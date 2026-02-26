export interface WalletTransactionDto {
  id: string;
  type:
    | "credit"
    | "debit"
    | "hold"
    | "release"
    | "referral_reward"
    | "loyalty_redeem"
    | "refund"
    | "seller_payout";
  amount: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
}

export interface WalletOverviewDto {
  wallet: {
    balance: number;
    lockedBalance: number;
    currency: "BDT";
  };
  loyalty: {
    points: number;
    lifetimeEarned: number;
  };
  transactions: WalletTransactionDto[];
}

export interface WalletRedeemLoyaltyRequestDto {
  points: number;
}

export interface WalletRedeemLoyaltyResponseDto {
  pointsRedeemed: number;
  creditedAmount: number;
  wallet: {
    balance: number;
    lockedBalance: number;
    currency: "BDT";
  };
  loyalty: {
    points: number;
    lifetimeEarned: number;
  };
}
