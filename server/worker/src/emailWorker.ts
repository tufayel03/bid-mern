import { Job, Worker } from "bullmq";
import { model, models, Schema, Types } from "mongoose";
import nodemailer from "nodemailer";

import { env } from "./config/env";
import { redisConnection } from "./queues/connection";

type EmailNotificationType = "order_created" | "auction_won" | "auction_outbid";

interface EmailNotificationPayload {
  type: EmailNotificationType;
  toUserId?: string;
  metadata: Record<string, unknown>;
}

type EmailDispatchKind = "campaign" | "stock_alert";

interface EmailDispatchPayload {
  to: string;
  subject: string;
  html: string;
  kind: EmailDispatchKind;
  campaignId?: string;
  campaignRecipientId?: string;
  stockAlertId?: string;
}

interface EmailCampaignWorkerDocument {
  totalRecipients: number;
  sentCount: number;
  status: "draft" | "sending" | "completed";
}

interface EmailCampaignRecipientWorkerDocument {
  campaignId: Types.ObjectId;
  sentAt?: Date;
  openedAt?: Date;
  openCount: number;
  status: "pending" | "sent" | "opened";
}

interface StockAlertWorkerDocument {
  notified: boolean;
}

interface EmailTransportSettingWorkerDocument {
  provider?: string;
  enabled?: boolean;
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    fromEmail?: string;
    fromName?: string;
    replyTo?: string;
    ignoreTLS?: boolean;
  };
}

interface ActiveSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  ignoreTLS: boolean;
}

const EmailCampaignWorkerModel =
  models.EmailCampaignWorker ||
  model<EmailCampaignWorkerDocument>(
    "EmailCampaignWorker",
    new Schema<EmailCampaignWorkerDocument>({}, { strict: false }),
    "emailcampaigns"
  );

const EmailCampaignRecipientWorkerModel =
  models.EmailCampaignRecipientWorker ||
  model<EmailCampaignRecipientWorkerDocument>(
    "EmailCampaignRecipientWorker",
    new Schema<EmailCampaignRecipientWorkerDocument>({}, { strict: false }),
    "emailcampaignrecipients"
  );

const StockAlertWorkerModel =
  models.StockAlertWorker ||
  model<StockAlertWorkerDocument>(
    "StockAlertWorker",
    new Schema<StockAlertWorkerDocument>({}, { strict: false }),
    "stockalerts"
  );

const EmailTransportSettingWorkerModel =
  models.EmailTransportSettingWorker ||
  model<EmailTransportSettingWorkerDocument>(
    "EmailTransportSettingWorker",
    new Schema<EmailTransportSettingWorkerDocument>({}, { strict: false }),
    "emailtransportsettings"
  );

const BULLMQ_PREFIX = "bidnsteal";
const SMTP_CONFIG_TTL_MS = 15_000;

let emailNotificationWorker: Worker<EmailNotificationPayload> | null = null;
let emailDispatchWorker: Worker<EmailDispatchPayload> | null = null;
let lastEmailSentAt = 0;
let smtpConfigCache: { value: ActiveSmtpConfig | null; expiresAt: number } = {
  value: null,
  expiresAt: 0,
};

async function throttleEmailDispatchRate(): Promise<void> {
  const minIntervalMs = 20;
  const now = Date.now();
  const waitMs = Math.max(0, minIntervalMs - (now - lastEmailSentAt));
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastEmailSentAt = Date.now();
}

async function loadActiveSmtpConfig(): Promise<ActiveSmtpConfig | null> {
  const now = Date.now();
  if (smtpConfigCache.expiresAt > now) {
    return smtpConfigCache.value;
  }

  try {
    const setting: any = await EmailTransportSettingWorkerModel.findOne({ key: "default" }).lean();
    if (!setting || setting.provider !== "smtp" || !setting.enabled) {
      smtpConfigCache = { value: null, expiresAt: now + SMTP_CONFIG_TTL_MS };
      return null;
    }

    const smtp = setting.smtp || {};
    const host = String(smtp.host || "").trim();
    const username = String(smtp.username || "").trim();
    const password = String(smtp.password || "").trim();
    const fromEmail = String(smtp.fromEmail || "").trim();

    if (!host || !username || !password || !fromEmail) {
      smtpConfigCache = { value: null, expiresAt: now + SMTP_CONFIG_TTL_MS };
      return null;
    }

    const normalized: ActiveSmtpConfig = {
      host,
      port: Math.max(1, Number(smtp.port || 465)),
      secure: Boolean(smtp.secure),
      username,
      password,
      fromEmail,
      fromName: String(smtp.fromName || "").trim(),
      replyTo: String(smtp.replyTo || "").trim(),
      ignoreTLS: Boolean(smtp.ignoreTLS),
    };

    smtpConfigCache = {
      value: normalized,
      expiresAt: now + SMTP_CONFIG_TTL_MS,
    };

    return normalized;
  } catch {
    smtpConfigCache = { value: null, expiresAt: now + SMTP_CONFIG_TTL_MS };
    return null;
  }
}

async function sendViaSmtp(to: string, subject: string, html: string): Promise<boolean> {
  const smtp = await loadActiveSmtpConfig();
  if (!smtp) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
      tls: smtp.ignoreTLS ? { rejectUnauthorized: false } : undefined,
    });

    const from = smtp.fromName
      ? `"${smtp.fromName.replace(/"/g, "")}" <${smtp.fromEmail}>`
      : smtp.fromEmail;

    await transporter.sendMail({
      from,
      to,
      replyTo: smtp.replyTo || undefined,
      subject,
      html,
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown smtp error";
    console.error(`[email-worker-dispatch] smtp send failed ${message}`);
    return false;
  }
}

async function sendViaProvider(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const smtpDelivered = await sendViaSmtp(to, subject, html);
    if (smtpDelivered) {
      return true;
    }

    if (!env.RESEND_API_KEY) {
      console.log(
        `[email-worker-dispatch] ${JSON.stringify({
          to,
          subject,
          html,
        })}`
      );
      return true;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || "no-reply@bidnsteal.local",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(`[email-worker-dispatch] send failed ${response.status} ${errorBody}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[email-worker-dispatch] send exception", error);
    return false;
  }
}

async function processEmailJob(job: Job<EmailNotificationPayload>): Promise<void> {
  const payload = job.data;
  const message = {
    queue: "email-notifications",
    type: payload.type,
    toUserId: payload.toUserId || null,
    metadata: payload.metadata,
  };

  console.log(`[email-worker] ${JSON.stringify(message)}`);
}

async function markCampaignSendState(payload: EmailDispatchPayload, now: Date): Promise<void> {
  if (!payload.campaignRecipientId || !Types.ObjectId.isValid(payload.campaignRecipientId)) {
    return;
  }

  const recipientObjectId = new Types.ObjectId(payload.campaignRecipientId);

  const firstSendResult = await EmailCampaignRecipientWorkerModel.updateOne(
    {
      _id: recipientObjectId,
      sentAt: { $exists: false },
    },
    {
      $set: { sentAt: now, status: "sent" },
    }
  );

  if (!firstSendResult.matchedCount) {
    await EmailCampaignRecipientWorkerModel.updateOne(
      { _id: recipientObjectId, status: { $ne: "opened" } },
      { $set: { status: "sent" } }
    );
    return;
  }

  if (!payload.campaignId || !Types.ObjectId.isValid(payload.campaignId)) {
    return;
  }

  const campaignObjectId = new Types.ObjectId(payload.campaignId);
  await EmailCampaignWorkerModel.updateOne(
    { _id: campaignObjectId },
    { $inc: { sentCount: 1 }, $set: { status: "sending" } }
  );

  const campaign: any = await EmailCampaignWorkerModel.findById(campaignObjectId)
    .select({ totalRecipients: 1, sentCount: 1, status: 1 })
    .lean();

  if (campaign && Number(campaign.sentCount || 0) >= Number(campaign.totalRecipients || 0)) {
    await EmailCampaignWorkerModel.updateOne(
      { _id: campaignObjectId },
      { $set: { status: "completed" } }
    );
  }
}

async function processEmailDispatchJob(job: Job<EmailDispatchPayload>): Promise<void> {
  const payload = job.data;
  if (!payload?.to || !payload?.subject || !payload?.html) {
    return;
  }

  await throttleEmailDispatchRate();
  const delivered = await sendViaProvider(payload.to, payload.subject, payload.html);
  if (!delivered) {
    return;
  }

  const now = new Date();
  if (payload.kind === "campaign") {
    await markCampaignSendState(payload, now);
    return;
  }

  if (payload.kind === "stock_alert" && payload.stockAlertId && Types.ObjectId.isValid(payload.stockAlertId)) {
    await StockAlertWorkerModel.updateOne(
      { _id: new Types.ObjectId(payload.stockAlertId) },
      { $set: { notified: true } }
    );
  }
}

export async function startEmailWorker(): Promise<void> {
  emailNotificationWorker = new Worker<EmailNotificationPayload>(
    "email-notifications",
    async (job) => processEmailJob(job),
    {
      connection: redisConnection,
      prefix: BULLMQ_PREFIX,
      concurrency: 5,
      skipVersionCheck: true,
    }
  );

  emailDispatchWorker = new Worker<EmailDispatchPayload>(
    "email",
    async (job) => processEmailDispatchJob(job),
    {
      connection: redisConnection,
      prefix: BULLMQ_PREFIX,
      concurrency: 1,
      skipVersionCheck: true,
    }
  );

  emailNotificationWorker.on("error", (error) => {
    console.error("[email-notification-worker] worker error", error);
  });

  emailDispatchWorker.on("error", (error) => {
    console.error("[email-dispatch-worker] worker error", error);
  });
}

export async function stopEmailWorker(): Promise<void> {
  await Promise.all([
    (async () => {
      if (emailNotificationWorker) {
        await emailNotificationWorker.close();
        emailNotificationWorker = null;
      }
    })(),
    (async () => {
      if (emailDispatchWorker) {
        await emailDispatchWorker.close();
        emailDispatchWorker = null;
      }
    })(),
  ]);
}
