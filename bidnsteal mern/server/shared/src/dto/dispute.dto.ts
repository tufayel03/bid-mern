export interface CreateDisputeRequestDto {
  orderId: string;
  reason: string;
}

export interface DisputeItemDto {
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
