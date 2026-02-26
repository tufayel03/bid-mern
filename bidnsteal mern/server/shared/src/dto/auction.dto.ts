export interface AuctionCreateRequestDto {
  productId: string;
  startAt: string;
  endAt: string;
  startingPrice: number;
  reservePrice?: number;
  minIncrement: number;
}

export interface AuctionPublicResponseDto {
  status: "scheduled" | "live" | "ended" | "cancelled";
  currentPrice: number;
  startingPrice: number;
  minIncrement: number;
  reservePriceReached: boolean;
  endAt: string;
  timeLeftMs: number;
  totalBids: number;
  highestBid: {
    userId: string;
    amount: number;
  } | null;
}

export interface AuctionBidRequestDto {
  amount: number;
}

export interface AuctionBidResponseDto {
  currentPrice: number;
}
