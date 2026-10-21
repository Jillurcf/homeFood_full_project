import type { BrowseFilters, CategoryCount, Food, SortValue } from "@/src/types/food";

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const PRICE_OPTIONS = [
  { value: "any", label: "Any price" },
  { value: "under150", label: "Under ৳150" },
  { value: "mid", label: "৳150 – ৳250" },
  { value: "over250", label: "Over ৳250" },
] as const;

export const RATING_OPTIONS = [
  { value: "any", label: "Any rating" },
  { value: "4.5", label: "4.5★ & up" },
  { value: "4.8", label: "4.8★ & up" },
] as const;

export const DEFAULT_FILTERS: BrowseFilters = {
  category: "All",
  price: "any",
  rating: "any",
  area: "All",
  dietary: [],
  inStockOnly: false,
};

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-US")}`;
}

export function deriveCategories(foods: Food[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const food of foods) {
    counts.set(food.category, (counts.get(food.category) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function deriveAreas(foods: Food[]): string[] {
  return Array.from(new Set(foods.map((food) => food.area))).sort();
}

export function deriveTags(foods: Food[]): string[] {
  return Array.from(new Set(foods.flatMap((food) => food.tags))).sort();
}

export function countActiveFilters(
  filters: BrowseFilters,
  showFavorites: boolean,
): number {
  let count = 0;
  if (filters.category !== "All") count += 1;
  if (filters.price !== "any") count += 1;
  if (filters.rating !== "any") count += 1;
  if (filters.area !== "All") count += 1;
  if (filters.dietary.length > 0) count += 1;
  if (filters.inStockOnly) count += 1;
  if (showFavorites) count += 1;
  return count;
}

export function applyFilters(
  foods: Food[],
  filters: BrowseFilters,
  favoriteIds: string[],
  showFavorites: boolean,
): Food[] {
  return foods.filter((food) => {
    if (filters.category !== "All" && food.category !== filters.category)
      return false;
    if (filters.area !== "All" && food.area !== filters.area) return false;
    if (filters.price === "under150" && food.price >= 150) return false;
    if (filters.price === "mid" && (food.price < 150 || food.price > 250))
      return false;
    if (filters.price === "over250" && food.price <= 250) return false;
    if (filters.rating === "4.5" && food.rating < 4.5) return false;
    if (filters.rating === "4.8" && food.rating < 4.8) return false;
    if (filters.inStockOnly && food.availability === "soldOut") return false;
    if (
      filters.dietary.length > 0 &&
      !filters.dietary.every((tag) => food.tags.includes(tag))
    )
      return false;
    if (showFavorites && !favoriteIds.includes(food.id)) return false;
    return true;
  });
}

export function applySort(foods: Food[], sort: SortValue): Food[] {
  const sorted = [...foods];
  sorted.sort((a, b) => {
    switch (sort) {
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviewCount - a.reviewCount;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return Number(a.id) - Number(b.id);
    }
  });
  return sorted;
}
