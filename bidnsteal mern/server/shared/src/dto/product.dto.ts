import type { Condition, SaleMode } from "../enums";

export interface ProductListItemDto {
  id: string;
  title: string;
  slug: string;
  price: number;
  sku?: string;
  stock: number;
  images?: string[];
  series?: string;
  isFeatured?: boolean;
  isNewDrop?: boolean;
  condition: Condition;
  saleMode: SaleMode;
  sellerId?: string;
  auctionStatus?: "live" | "scheduled" | "ended";
  auctionCurrentPrice?: number;
  auctionEndAt?: string;
}

export interface ProductDetailDto extends ProductListItemDto {
  description: string;
  images: string[];
}

export interface ProductListResponseDto {
  items: ProductListItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ProductSuggestResponseDto = string[];
