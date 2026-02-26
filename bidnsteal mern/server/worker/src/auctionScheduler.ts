import { Job, Worker } from "bullmq";
import mongoose, { model, models, Schema, Types } from "mongoose";

import { env } from "./config/env";
import { redisConnection } from "./queues/connection";
import { emailNotificationsQueue } from "./queues/queues";

type AuctionStatus = "scheduled" | "live" | "ended" | "cancelled";

interface AuctionDocument {
  productId: Types.ObjectId;
  status: AuctionStatus;
  startAt: Date;
  endAt: Date;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  minIncrement: number;
  winnerUserId?: Types.ObjectId;
  winnerBidId?: Types.ObjectId;
  endedAt?: Date;
}

interface AuctionBidDocument {
  auctionId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  createdAt: Date;
}

interface AuctionLifecycleJobData {
  auctionId: string;
}

const auctionSchema = new Schema<AuctionDocument>(
  {
    productId: { type: Schema.Types.ObjectId, required: true, unique: true },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      required: true,
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    reservePrice: { type: Number },
    minIncrement: { type: Number, required: true },
    winnerUserId: { type: Schema.Types.ObjectId },
    winnerBidId: { type: Schema.Types.ObjectId },
    endedAt: { type: Date },
  },
  {
    strict: false,
  }
);

const auctionBidSchema = new Schema<AuctionBidDocument>(
  {
    auctionId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, required: true },
  },
  {
    strict: false,
  }
);

const AuctionWorkerModel =
  models.AuctionWorker || model<AuctionDocument>("AuctionWorker", auctionSchema, "auctions");
const AuctionBidWorkerModel =
  models.AuctionBidWorker ||
  model<AuctionBidDocument>("AuctionBidWorker", auctionBidSchema, "auctionbids");
const BULLMQ_PREFIX = "bidnsteal";

let auctionWorker: Worker<AuctionLifecycleJobData> | null = null;

async function handleAuctionStart(auctionId: string): Promise<void> {
  if (!Types.ObjectId.isValid(auctionId)) {
    return;
  }

  const now = new Date();
  await AuctionWorkerModel.updateOne(
    {
      _id: new Types.ObjectId(auctionId),
      status: "scheduled",
      startAt: { $lte: now },
    },
    { $set: { status: "live" } }
  ).exec();
}

async function handleAuctionEnd(auctionId: string): Promise<void> {
  if (!Types.ObjectId.isValid(auctionId)) {
    return;
  }

  const now = new Date();
  const auction: any = await AuctionWorkerModel.findOne({
    _id: new Types.ObjectId(auctionId),
  }).lean();

  if (!auction) {
    return;
  }

  if (auction.status === "ended" || auction.status === "cancelled") {
    return;
  }

  const highestBid: any = await AuctionBidWorkerModel.findOne({
    auctionId: auction._id,
  })
    .sort({ amount: -1, createdAt: 1 })
    .lean();

  const hasReserve = typeof auction.reservePrice === "number";
  const reserveMet = !hasReserve || (highestBid && highestBid.amount >= auction.reservePrice);

  const setFields: Record<string, unknown> = {
    status: "ended",
    endedAt: now,
  };
  const unsetFields: Record<string, "" | 1> = {};

  if (highestBid) {
    setFields.currentPrice = highestBid.amount;
  }

  if (highestBid && reserveMet) {
    setFields.winnerUserId = highestBid.userId;
    setFields.winnerBidId = highestBid._id;
  } else {
    unsetFields.winnerUserId = "";
    unsetFields.winnerBidId = "";
  }

  const updateResult = await AuctionWorkerModel.updateOne(
    {
      _id: auction._id,
      status: { $in: ["scheduled", "live"] },
      endAt: { $lte: now },
    },
    {
      $set: setFields,
      ...(Object.keys(unsetFields).length ? { $unset: unsetFields } : {}),
    }
  ).exec();

  if (!updateResult.matchedCount) {
    return;
  }

  if (env.FEATURE_EMAILS === "true" && highestBid && reserveMet) {
    await emailNotificationsQueue.add(
      "auction_won",
      {
        type: "auction_won",
        toUserId: String(highestBid.userId),
        metadata: {
          auctionId: String(auction._id),
          productId: String(auction.productId),
          amount: Number(highestBid.amount),
        },
      },
      { removeOnComplete: true, attempts: 3 }
    );
  }
}

async function processAuctionLifecycleJob(job: Job<AuctionLifecycleJobData>): Promise<void> {
  const auctionId = job.data?.auctionId;
  if (!auctionId) {
    return;
  }

  if (job.name === "auction_start") {
    await handleAuctionStart(auctionId);
    return;
  }

  if (job.name === "auction_end") {
    await handleAuctionEnd(auctionId);
  }
}

export async function startAuctionScheduler(): Promise<void> {
  if (env.FEATURE_AUCTIONS !== "true") {
    console.log("[auction-scheduler] disabled via FEATURE_AUCTIONS");
    return;
  }
  if (mongoose.connection.readyState !== 1) {
    throw new Error("[auction-scheduler] mongo is not connected");
  }

  auctionWorker = new Worker<AuctionLifecycleJobData>(
    "auction-lifecycle",
    async (job) => processAuctionLifecycleJob(job),
    {
      connection: redisConnection,
      prefix: BULLMQ_PREFIX,
      concurrency: 5,
    }
  );

  auctionWorker.on("error", (error) => {
    console.error("[auction-scheduler] worker error", error);
  });
}

export async function stopAuctionScheduler(): Promise<void> {
  if (auctionWorker) {
    await auctionWorker.close();
    auctionWorker = null;
  }
}
