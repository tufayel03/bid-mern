import type { FulfillmentStatus, PaymentStatus } from "../enums";

export interface CreateOrderRequestDto {
  customerNote?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    area: string;
    city: string;
    postalCode?: string;
    country: "BD";
  };
}

export interface CreateOrderResponseDto {
  id: string;
  orderNumber: string;
  total: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
}

export interface OrderListItemDto {
  id: string;
  orderNumber: string;
  total: number;
  grossRevenue?: number;
  netRevenue?: number;
  platformFee?: number;
  sellerPayout?: number;
  customerNote?: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
}

export interface OrderDetailDto extends OrderListItemDto {
  items: Array<{
    productId: string;
    titleSnapshot: string;
    qty: number;
    unitPrice: number;
    type: "fixed" | "auction_win";
    sellerId?: string;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  escrowStatus?: "none" | "held" | "released" | "refunded";
  escrowHeldAmount?: number;
  escrowReleasedAt?: string;
  escrowRefundedAt?: string;
  referralRewardAmount?: number;
  loyaltyPointsEarned?: number;
  sellerSplits?: Array<{
    sellerId?: string;
    grossAmount: number;
    platformFee: number;
    sellerPayout: number;
    status: "held" | "released" | "refunded";
  }>;
  paymentMethod: "cod";
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    area: string;
    city: string;
    postalCode?: string;
    country: "BD";
  };
}
