import { Queue } from "bullmq";

import { redisConnection } from "./connection";
const BULLMQ_PREFIX = "bidnsteal";

export const reservationExpiryQueue = new Queue("reservation-expiry", {
  connection: redisConnection,
  prefix: BULLMQ_PREFIX,
  skipVersionCheck: true,
});

export const emailQueue = new Queue("email", {
  connection: redisConnection,
  prefix: BULLMQ_PREFIX,
  skipVersionCheck: true,
});

export const emailNotificationsQueue = new Queue("email-notifications", {
  connection: redisConnection,
  prefix: BULLMQ_PREFIX,
  skipVersionCheck: true,
});

export const auctionLifecycleQueue = new Queue("auction-lifecycle", {
  connection: redisConnection,
  prefix: BULLMQ_PREFIX,
  skipVersionCheck: true,
});

export const stockAlertsQueue = new Queue("stock-alerts", {
  connection: redisConnection,
  prefix: BULLMQ_PREFIX,
  skipVersionCheck: true,
});

export async function closeQueues(): Promise<void> {
  await Promise.all([
    reservationExpiryQueue.close(),
    emailQueue.close(),
    emailNotificationsQueue.close(),
    auctionLifecycleQueue.close(),
    stockAlertsQueue.close(),
  ]);
}
