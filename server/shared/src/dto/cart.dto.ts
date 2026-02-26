export interface CartItemDto {
  id: string;
  productId: string;
  titleSnapshot: string;
  unitPriceSnapshot: number;
  qty: number;
  type: "fixed" | "auction_win";
  locked: boolean;
}

export interface CartDto {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItemDto[];
}
