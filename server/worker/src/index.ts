import { startAuctionScheduler, stopAuctionScheduler } from "./auctionScheduler";
import { connectMongo, disconnectMongo } from "./db/mongoose";
import { startEmailWorker, stopEmailWorker } from "./emailWorker";
import { stopReservationCleanup, startReservationCleanup } from "./reservationCleanup";
import { startStockAlertWorker, stopStockAlertWorker } from "./stockAlertWorker";
import { redisConnection } from "./queues/connection";
import { closeQueues } from "./queues/queues";

async function bootstrap(): Promise<void> {
  await connectMongo();
  console.log("worker up");
  await startAuctionScheduler();
  await startReservationCleanup();
  await startEmailWorker();
  await startStockAlertWorker();
}

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`[worker] received ${signal}, shutting down`);

  let exitCode = 0;
  try {
    await stopAuctionScheduler();
    await stopReservationCleanup();
    await stopEmailWorker();
    await stopStockAlertWorker();
    await closeQueues();
    await redisConnection.quit();
    await disconnectMongo();
    console.log("[worker] shutdown complete");
  } catch (error) {
    exitCode = 1;
    console.error("[worker] shutdown failed", error);
  } finally {
    process.exit(exitCode);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

bootstrap().catch((error) => {
  console.error("[worker] bootstrap failed", error);
  process.exit(1);
});
