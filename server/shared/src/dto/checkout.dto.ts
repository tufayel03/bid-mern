export interface CheckoutIntentRequestDto {
  idempotencyKey: string;
  couponCode?: string;
}

export interface CheckoutIntentResponseDto {
  reservationId: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  expiresAt: string;
  couponCode?: string;
}
