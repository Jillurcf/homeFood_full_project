import type { Availability } from "@/src/components/ui/AvailabilityPill";
import type { Food, FoodReview } from "@/src/types/food";

export const API_ORIGIN = "http://192.168.0.4:8080";

export interface RawSeller {
  _id: string;
  name?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface RawReview {
  authorName?: string;
  area?: string;
  rating?: number;
  text?: string;
  sellerReply?: string;
  repliedAt?: string;
  createdAt?: string;
}

export interface RawFood {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  perUnit: string;
  prepTime: number;
  maxOrdersPerDay?: number;
  availability: "available" | "low" | "sold_out";
  imageUrl: string;
  dietaryTags?: string[];
  deliveryFee?: number;
  area: string;
  rating: number;
  reviewCount: number;
  sellerId?: RawSeller | string;
  reviews?: RawReview[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toAbsoluteUrl = (url?: string) => {
  if (!url) return "";
  if (/^(https?:\/\/|data:)/i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

const formatReviewDate = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const mapAvailability = (
  value: RawFood["availability"],
): Availability => {
  if (value === "sold_out") return "soldOut";
  if (value === "low") return "low";
  return "available";
};

const mapReview = (raw: RawReview): FoodReview => ({
  author: raw.authorName || "Verified buyer",
  area: raw.area || "",
  rating: raw.rating ?? 5,
  date: formatReviewDate(raw.createdAt),
  text: raw.text || "",
  sellerReply: raw.sellerReply || "",
});

export function mapFood(raw: RawFood): Food {
  const seller =
    raw.sellerId && typeof raw.sellerId === "object" ? raw.sellerId : undefined;

  return {
    id: raw._id,
    name: raw.name,
    category: raw.category,
    price: raw.price,
    perUnit: raw.perUnit,
    seller: seller?.name || "Home chef",
    sellerVerified: Boolean(seller?.isVerified),
    sellerImage: toAbsoluteUrl(seller?.avatarUrl),
    area: raw.area,
    image: toAbsoluteUrl(raw.imageUrl),
    description: raw.description,
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    availability: mapAvailability(raw.availability),
    deliveryTime: `${raw.prepTime} min`,
    prepTime: raw.prepTime,
    maxOrdersPerDay: raw.maxOrdersPerDay ?? 10,
    deliveryFee: raw.deliveryFee ?? 40,
    tags: raw.dietaryTags ?? [],
    reviews: (raw.reviews ?? []).map(mapReview),
  };
}

export const mapFoodList = (raws: RawFood[]): Food[] => raws.map(mapFood);
