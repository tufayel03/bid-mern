export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SALE_MODES = ["fixed", "auction", "hybrid"] as const;
export type SaleMode = (typeof SALE_MODES)[number];

export const CONDITIONS = ["carded", "loose"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const ORDER_PAYMENT_METHODS = ["cod"] as const;
export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["unpaid", "collected", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const AUCTION_STATUSES = [
  "scheduled",
  "live",
  "ended",
  "paid",
  "cancelled",
] as const;
export type AuctionStatus = (typeof AUCTION_STATUSES)[number];
