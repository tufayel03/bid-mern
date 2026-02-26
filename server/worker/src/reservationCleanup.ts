import mongoose, { model, models, Schema } from "mongoose";

type ReservationStatus = "active" | "consumed" | "expired" | "cancelled";

interface ReservationDocument {
  status: ReservationStatus;
  expiresAt: Date;
}

const reservationSchema = new Schema<ReservationDocument>(
  {
    status: {
      type: String,
      enum: ["active", "consumed", "expired", "cancelled"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  {
    strict: false,
  }
);

const InventoryReservationWorkerModel =
  models.InventoryReservationWorker ||
  model<ReservationDocument>(
    "InventoryReservationWorker",
    reservationSchema,
    "inventoryreservations"
  );

const RESERVATION_CLEANUP_INTERVAL_MS = 60 * 1000;

let cleanupInterval: NodeJS.Timeout | null = null;
let cleanupRunning = false;

async function expireReservationsOnce(): Promise<void> {
  if (cleanupRunning) {
    return;
  }

  cleanupRunning = true;

  try {
    const now = new Date();
    const result = await InventoryReservationWorkerModel.updateMany(
      { status: "active", expiresAt: { $lte: now } },
      { $set: { status: "expired" } }
    ).exec();

    if (result.modifiedCount > 0) {
      console.log(`[reservation-cleanup] marked ${result.modifiedCount} reservations expired`);
    }
  } catch (error) {
    console.error("[reservation-cleanup] failed to mark expired reservations", error);
  } finally {
    cleanupRunning = false;
  }
}

export async function startReservationCleanup(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("[reservation-cleanup] mongo is not connected");
  }

  await expireReservationsOnce();

  cleanupInterval = setInterval(() => {
    void expireReservationsOnce();
  }, RESERVATION_CLEANUP_INTERVAL_MS);
}

export async function stopReservationCleanup(): Promise<void> {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
