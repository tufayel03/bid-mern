import type { FulfillmentStatus, PaymentStatus } from "../enums";
import type { OrderListItemDto } from "./order.dto";

export interface AdminOrderListFiltersDto {
  status?: FulfillmentStatus;
  paymentStatus?: PaymentStatus;
  page: number;
  limit: number;
}

export interface AdminOrderListResponseDto {
  items: OrderListItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminOrderStatusPatchRequestDto {
  fulfillmentStatus?: Exclude<FulfillmentStatus, "pending">;
  paymentStatus?: PaymentStatus;
}

export interface SellerDto {
  id: string;
  userId?: string;
  storeName: string;
  verificationStatus: "pending" | "verified" | "rejected";
  rating: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CouponDto {
  id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  maxUses: number;
  usedCount: number;
  minOrderAmount: number;
  appliesTo: "fixed" | "auction" | "both";
  isActive: boolean;
  expiresAt?: string;
  createdAt?: string;
}

export interface FinancialSummaryDto {
  gmv: number;
  netRevenue: number;
  feesCollected: number;
  sellerPayoutsPending: number;
  activeSellers: number;
  conversionRate: number;
  avgAuctionUplift: number;
  walletBalances: {
    total: number;
    locked: number;
  };
  monthlyReport: Array<{
    month: string;
    orders: number;
    gmv: number;
    netRevenue: number;
    fees: number;
  }>;
}

export interface SellerFinancialSummaryDto {
  seller: SellerDto;
  orders: number;
  grossRevenue: number;
  platformFee: number;
  sellerPayout: number;
  pendingPayout: number;
  monthlyReport: Array<{
    month: string;
    orders: number;
    grossRevenue: number;
    platformFee: number;
    sellerPayout: number;
  }>;
}

export interface DisputeDto {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId?: string;
  reason: string;
  status: "open" | "under_review" | "resolved" | "rejected";
  resolution: "refund_buyer" | "release_funds" | "partial_refund" | "none";
  resolutionAmount?: number;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
}
