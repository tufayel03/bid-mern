import { Job, Worker } from "bullmq";
import { model, models, Schema, Types } from "mongoose";

import { emailQueue } from "./queues/queues";
import { redisConnection } from "./queues/connection";

interface StockAlertProcessJobData {
  productId: string;
}

interface ProductWorkerDocument {
  title: string;
  stock: number;
}

interface StockAlertWorkerDocument {
  productId: Types.ObjectId;
  email: string;
  notified: boolean;
}

const ProductWorkerModel =
  models.ProductWorker ||
  model<ProductWorkerDocument>("ProductWorker", new Schema<ProductWorkerDocument>({}, { strict: false }), "products");

const StockAlertWorkerModel =
  models.StockAlertWorker ||
  model<StockAlertWorkerDocument>(
    "StockAlertWorker",
    new Schema<StockAlertWorkerDocument>({}, { strict: false }),
    "stockalerts"
  );
const BULLMQ_PREFIX = "bidnsteal";

let stockAlertWorker: Worker<StockAlertProcessJobData> | null = null;

async function processStockAlertJob(job: Job<StockAlertProcessJobData>): Promise<void> {
  const productId = job.data?.productId;
  if (!productId || !Types.ObjectId.isValid(productId)) {
    return;
  }

  const productObjectId = new Types.ObjectId(productId);
  const product: any = await ProductWorkerModel.findById(productObjectId)
    .select({ title: 1, stock: 1 })
    .lean();
  if (!product || Number(product.stock || 0) <= 0) {
    return;
  }

  const alerts: any[] = await StockAlertWorkerModel.find({
    productId: productObjectId,
    notified: false,
  })
    .select({ email: 1 })
    .limit(5000)
    .lean();

  if (!alerts.length) {
    return;
  }

  await emailQueue.addBulk(
    alerts.map((alert: any) => ({
      name: "dispatch",
      data: {
        to: alert.email,
        subject: `${product.title} is back in stock`,
        html: `<h3>${product.title}</h3><p>The item you requested is now back in stock.</p>`,
        kind: "stock_alert" as const,
        stockAlertId: String(alert._id),
      },
      opts: {
        removeOnComplete: true,
        attempts: 3,
        jobId: `stock-alert-email:${String(alert._id)}`,
      },
    }))
  );
}

export async function startStockAlertWorker(): Promise<void> {
  stockAlertWorker = new Worker<StockAlertProcessJobData>(
    "stock-alerts",
    async (job) => processStockAlertJob(job),
    {
      connection: redisConnection,
      prefix: BULLMQ_PREFIX,
      concurrency: 3,
      skipVersionCheck: true,
    }
  );

  stockAlertWorker.on("error", (error) => {
    console.error("[stock-alert-worker] worker error", error);
  });
}

export async function stopStockAlertWorker(): Promise<void> {
  if (stockAlertWorker) {
    await stockAlertWorker.close();
    stockAlertWorker = null;
  }
}
