import type { Availability } from "@/src/components/ui/AvailabilityPill";

export interface FoodReview {
  author: string;
  area: string;
  rating: number;
  date: string;
  text: string;
  sellerReply?: string;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  price: number;
  perUnit: string;
  seller: string;
  sellerVerified: boolean;
  sellerImage: string;
  area: string;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  availability: Availability;
  deliveryTime: string;
  prepTime: number;
  maxOrdersPerDay: number;
  deliveryFee: number;
  tags: string[];
  reviews: FoodReview[];
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface BrowseFilters {
  category: string;
  price: string;
  rating: string;
  area: string;
  dietary: string[];
  inStockOnly: boolean;
}

export type SortValue =
  | "recommended"
  | "rating"
  | "reviews"
  | "price-asc"
  | "price-desc";
