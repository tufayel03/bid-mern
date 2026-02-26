import { z } from "zod";

export const healthResponseSchema = z.object({
  ok: z.literal(true),
});

export const idempotencyKeySchema = z
  .string()
  .min(1)
  .max(128);

export const registerRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().min(4).max(32).optional(),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["customer", "admin"]),
  referralCode: z.string().min(4).max(32).optional(),
});

export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: authUserSchema,
});

export const productListItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  price: z.number(),
  sku: z.string().min(1).optional(),
  stock: z.number(),
  images: z.array(z.string().min(1)).optional(),
  series: z.string().min(1).optional(),
  isFeatured: z.boolean().optional(),
  isNewDrop: z.boolean().optional(),
  condition: z.enum(["carded", "loose"]),
  saleMode: z.enum(["fixed", "auction", "hybrid"]),
  sellerId: z.string().min(1).optional(),
  auctionStatus: z.enum(["live", "scheduled", "ended"]).optional(),
  auctionCurrentPrice: z.number().optional(),
  auctionEndAt: z.string().datetime().optional(),
});

export const productListResponseSchema = z.object({
  items: z.array(productListItemSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(1),
});

export const suggestResponseSchema = z.array(z.string().min(1));

export const cartAddItemRequestSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(99),
});

export const cartUpdateItemQtyRequestSchema = z.object({
  qty: z.number().int().min(1).max(99),
});

export const cartItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  titleSnapshot: z.string().min(1),
  unitPriceSnapshot: z.number(),
  qty: z.number().int().min(1),
  type: z.enum(["fixed", "auction_win"]),
  locked: z.boolean(),
});

export const cartResponseSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional(),
  sessionId: z.string().min(1).optional(),
  items: z.array(cartItemSchema),
});

export const checkoutIntentRequestSchema = z.object({
  couponCode: z.string().min(1).max(32).optional(),
});

export const checkoutIntentResponseSchema = z.object({
  reservationId: z.string().min(1),
  subtotal: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total: z.number(),
  expiresAt: z.string().datetime(),
  couponCode: z.string().min(1).optional(),
});

export const createOrderRequestSchema = z.object({
  customerNote: z.string().max(1000).optional(),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    area: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().optional(),
    country: z.literal("BD"),
  }),
});

export const orderCreateResponseSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  total: z.number(),
  paymentStatus: z.enum(["unpaid", "collected", "refunded"]),
  fulfillmentStatus: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  createdAt: z.string().datetime(),
});

export const orderListItemSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  total: z.number(),
  grossRevenue: z.number().optional(),
  netRevenue: z.number().optional(),
  platformFee: z.number().optional(),
  sellerPayout: z.number().optional(),
  customerNote: z.string().max(1000).optional(),
  paymentStatus: z.enum(["unpaid", "collected", "refunded"]),
  fulfillmentStatus: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  createdAt: z.string().datetime(),
});

export const orderDetailSchema = orderListItemSchema.extend({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      sellerId: z.string().min(1).optional(),
      titleSnapshot: z.string().min(1),
      qty: z.number().int().min(1),
      unitPrice: z.number(),
      type: z.enum(["fixed", "auction_win"]),
    })
  ),
  subtotal: z.number(),
  shipping: z.number(),
  discount: z.number(),
  escrowStatus: z.enum(["none", "held", "released", "refunded"]).optional(),
  escrowHeldAmount: z.number().optional(),
  escrowReleasedAt: z.string().datetime().optional(),
  escrowRefundedAt: z.string().datetime().optional(),
  referralRewardAmount: z.number().optional(),
  loyaltyPointsEarned: z.number().optional(),
  sellerSplits: z
    .array(
      z.object({
        sellerId: z.string().min(1).optional(),
        grossAmount: z.number(),
        platformFee: z.number(),
        sellerPayout: z.number(),
        status: z.enum(["held", "released", "refunded"]),
      })
    )
    .optional(),
  paymentMethod: z.literal("cod"),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    area: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().optional(),
    country: z.literal("BD"),
  }),
});

export const adminOrderStatusPatchRequestSchema = z
  .object({
    fulfillmentStatus: z.enum(["processing", "shipped", "delivered", "cancelled"]).optional(),
    paymentStatus: z.enum(["unpaid", "collected", "refunded"]).optional(),
  })
  .refine((value) => Boolean(value.fulfillmentStatus || value.paymentStatus), {
    message: "At least one status field is required",
  });

export const adminOrderListQuerySchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "collected", "refunded"]).optional(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
});

export const adminOrderListResponseSchema = z.object({
  items: z.array(orderListItemSchema),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(1),
});

export const auctionCreateSchema = z.object({
  productId: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  startingPrice: z.number().int().min(0),
  reservePrice: z.number().int().min(0).optional(),
  minIncrement: z.number().int().min(1),
});

export const auctionBidSchema = z.object({
  amount: z.number().int().min(0),
});

export const auctionPublicResponseSchema = z.object({
  status: z.enum(["scheduled", "live", "ended", "cancelled"]),
  currentPrice: z.number().int().min(0),
  startingPrice: z.number().int().min(0),
  minIncrement: z.number().int().min(1),
  reservePriceReached: z.boolean(),
  endAt: z.string().datetime(),
  timeLeftMs: z.number().int().min(0),
  totalBids: z.number().int().min(0),
  highestBid: z
    .object({
      userId: z.string().min(1),
      amount: z.number().int().min(0),
    })
    .nullable(),
});

export const sellerSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional(),
  storeName: z.string().min(1),
  verificationStatus: z.enum(["pending", "verified", "rejected"]),
  rating: z.number().min(0).max(5),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(),
});

export const couponSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(["flat", "percent"]),
  value: z.number().min(0),
  maxUses: z.number().int().min(1),
  usedCount: z.number().int().min(0),
  minOrderAmount: z.number().min(0),
  appliesTo: z.enum(["fixed", "auction", "both"]),
  isActive: z.boolean(),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
});

export const walletTransactionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "credit",
    "debit",
    "hold",
    "release",
    "referral_reward",
    "loyalty_redeem",
    "refund",
    "seller_payout",
  ]),
  amount: z.number(),
  reason: z.string().min(1),
  referenceId: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const walletOverviewSchema = z.object({
  wallet: z.object({
    balance: z.number(),
    lockedBalance: z.number(),
    currency: z.literal("BDT"),
  }),
  loyalty: z.object({
    points: z.number().int().min(0),
    lifetimeEarned: z.number().int().min(0),
  }),
  transactions: z.array(walletTransactionSchema),
});

export const walletRedeemLoyaltyRequestSchema = z.object({
  points: z.number().int().min(1),
});

export const walletRedeemLoyaltyResponseSchema = z.object({
  pointsRedeemed: z.number().int().min(1),
  creditedAmount: z.number().min(0),
  wallet: z.object({
    balance: z.number(),
    lockedBalance: z.number(),
    currency: z.literal("BDT"),
  }),
  loyalty: z.object({
    points: z.number().int().min(0),
    lifetimeEarned: z.number().int().min(0),
  }),
});

export const createDisputeRequestSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(5).max(1000),
});

export const disputeSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  buyerId: z.string().min(1),
  sellerId: z.string().min(1).optional(),
  reason: z.string().min(1),
  status: z.enum(["open", "under_review", "resolved", "rejected"]),
  resolution: z.enum(["refund_buyer", "release_funds", "partial_refund", "none"]),
  resolutionAmount: z.number().min(1).optional(),
  adminNote: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const financialSummarySchema = z.object({
  gmv: z.number().min(0),
  netRevenue: z.number().min(0),
  feesCollected: z.number().min(0),
  sellerPayoutsPending: z.number().min(0),
  activeSellers: z.number().int().min(0),
  conversionRate: z.number().min(0),
  avgAuctionUplift: z.number(),
  walletBalances: z.object({
    total: z.number(),
    locked: z.number(),
  }),
  monthlyReport: z.array(
    z.object({
      month: z.string().min(1),
      orders: z.number().int().min(0),
      gmv: z.number().min(0),
      netRevenue: z.number(),
      fees: z.number(),
    })
  ),
});

export const sellerFinancialSummarySchema = z.object({
  seller: sellerSchema,
  orders: z.number().int().min(0),
  grossRevenue: z.number().min(0),
  platformFee: z.number().min(0),
  sellerPayout: z.number().min(0),
  pendingPayout: z.number().min(0),
  monthlyReport: z.array(
    z.object({
      month: z.string().min(1),
      orders: z.number().int().min(0),
      grossRevenue: z.number().min(0),
      platformFee: z.number().min(0),
      sellerPayout: z.number().min(0),
    })
  ),
});
