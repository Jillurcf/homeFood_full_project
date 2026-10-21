import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetFoodsQuery } from "@/src/api/foods";
import { BrowseFiltersPanel } from "@/src/components/browse/BrowseFiltersPanel";
import { FoodCard } from "@/src/components/browse/FoodCard";
import { SearchBar } from "@/src/components/browse/SearchBar";
import { Chip, EmptyState, FoodCardSkeleton, PillButton } from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import {
  DEFAULT_FILTERS,
  RATING_OPTIONS,
  SORT_OPTIONS,
  applyFilters,
  applySort,
  countActiveFilters,
  deriveAreas,
  deriveCategories,
  deriveTags,
} from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";
import { toggleFavorite } from "@/src/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { BrowseFilters, Food, SortValue } from "@/src/types/food";

const SKELETON_COUNT = 6;

export default function HomeBrowseScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) => state.favorites.ids);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [sort, setSort] = useState<SortValue>("recommended");
  const [filters, setFilters] = useState<BrowseFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const { data: foods = [], isLoading, isError, refetch } = useGetFoodsQuery(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  const categories = useMemo(() => deriveCategories(foods), [foods]);
  const areas = useMemo(() => deriveAreas(foods), [foods]);
  const tags = useMemo(() => deriveTags(foods), [foods]);

  const updateFilter = useCallback((patch: Partial<BrowseFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setShowFavorites(false);
  }, []);

  const filtered = useMemo(
    () => applySort(applyFilters(foods, filters, favoriteIds, showFavorites), sort),
    [foods, filters, favoriteIds, showFavorites, sort],
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, showFavorites),
    [filters, showFavorites],
  );

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];

    if (filters.category !== "All") {
      chips.push({
        key: "category",
        label: filters.category,
        clear: () => updateFilter({ category: "All" }),
      });
    }
    if (filters.price !== "any") {
      chips.push({
        key: "price",
        label: filters.price,
        clear: () => updateFilter({ price: "any" }),
      });
    }
    if (filters.rating !== "any") {
      const label =
        RATING_OPTIONS.find((o) => o.value === filters.rating)?.label ??
        filters.rating;
      chips.push({
        key: "rating",
        label,
        clear: () => updateFilter({ rating: "any" }),
      });
    }
    if (filters.area !== "All") {
      chips.push({
        key: "area",
        label: filters.area,
        clear: () => updateFilter({ area: "All" }),
      });
    }
    filters.dietary.forEach((tag) => {
      chips.push({
        key: `dietary-${tag}`,
        label: tag,
        clear: () =>
          updateFilter({ dietary: filters.dietary.filter((t) => t !== tag) }),
      });
    });
    if (filters.inStockOnly) {
      chips.push({
        key: "instock",
        label: "In stock only",
        clear: () => updateFilter({ inStockOnly: false }),
      });
    }
    if (showFavorites) {
      chips.push({
        key: "favorites",
        label: "Favourites",
        clear: () => setShowFavorites(false),
      });
    }

    return chips;
  }, [filters, showFavorites, updateFilter]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      dispatch(toggleFavorite(id));
    },
    [dispatch],
  );

  const nothingFound = !isLoading && !isError && filtered.length === 0;
  const favoritesEmpty = showFavorites && favoriteIds.length === 0;

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={tw`pt-2 pb-5`}>
        <Text
          style={tw`text-xs font-semibold uppercase tracking-[0.16em] text-primaryDark font-bengali`}
        >
          স্থানীয় রান্নাঘর থেকে তাজা
        </Text>
        <Text
          style={tw`mt-2 text-3xl font-semibold tracking-tight text-text font-bengali`}
        >
          ঘরের খাবার
        </Text>
        <Text style={tw`mt-1 text-lg font-semibold text-primaryDark font-display`}>
          Discover homemade food near you
        </Text>
        <Text style={tw`mt-2 text-sm text-textMuted`}>
          Order from NID-verified women home chefs in your neighborhood, with real
          ratings, reviews and honest availability.
        </Text>

        <View style={tw`mt-5`}>
          <SearchBar value={searchInput} onChangeText={setSearchInput} />
        </View>
      </View>

      {/* Category chips */}
      {!isLoading && categories.length > 0 && (
        <View style={tw`mb-4`}>
          <FlatList
            horizontal
            data={[{ name: "All", count: categories.reduce((s, c) => s + c.count, 0) }, ...categories]}
            keyExtractor={(item) => item.name}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={tw`w-2`} />}
            renderItem={({ item }) => (
              <Chip
                active={filters.category === item.name}
                onPress={() => updateFilter({ category: item.name })}
              >
                {item.name} ({item.count})
              </Chip>
            )}
          />
        </View>
      )}

      {/* Toolbar */}
      <View style={tw`mb-3 flex-row flex-wrap items-center gap-2`}>
        <Text
          accessibilityLiveRegion="polite"
          style={tw`mr-auto text-sm text-textMuted`}
        >
          {isLoading
            ? "Loading dishes…"
            : `${filtered.length} of ${foods.length} dishes`}
        </Text>

        <Chip
          active={showFavorites}
          onPress={() => setShowFavorites((v) => !v)}
        >
          <View style={tw`flex-row items-center gap-1.5`}>
            <Ionicons
              name={showFavorites ? "heart" : "heart-outline"}
              size={14}
              color={showFavorites ? colors.white : colors.textMuted}
            />
            <Text
              style={tw`text-sm font-medium ${showFavorites ? "text-white" : "text-textMuted"}`}
            >
              Favourites{favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ""}
            </Text>
          </View>
        </Chip>

        <TouchableOpacity
          onPress={() => setFiltersOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: filtersOpen }}
          style={[
            tw`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5`,
            activeFilterCount > 0 || filtersOpen
              ? tw`border-primary bg-primary/10`
              : tw`border-borderStrong bg-card`,
          ]}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={
              activeFilterCount > 0 || filtersOpen
                ? colors.primaryDark
                : colors.textMuted
            }
          />
          <Text
            style={tw`text-sm font-medium ${activeFilterCount > 0 || filtersOpen ? "text-primaryDark" : "text-textMuted"}`}
          >
            Filters
          </Text>
          {activeFilterCount > 0 && (
            <View
              style={tw`h-5 w-5 items-center justify-center rounded-full bg-primary`}
            >
              <Text style={tw`text-[11px] font-bold text-white`}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const currentIndex = SORT_OPTIONS.findIndex((o) => o.value === sort);
            const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
            setSort(SORT_OPTIONS[nextIndex].value);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${SORT_OPTIONS.find((o) => o.value === sort)?.label}`}
          style={tw`flex-row items-center gap-1.5 rounded-full border border-borderStrong bg-card px-3 py-1.5`}
        >
          <Ionicons name="swap-vertical-outline" size={14} color={colors.textMuted} />
          <Text style={tw`text-sm font-medium text-text`}>
            {SORT_OPTIONS.find((o) => o.value === sort)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {filtersOpen && (
        <View style={tw`mb-5`}>
          <BrowseFiltersPanel
            filters={filters}
            categories={categories}
            areas={areas}
            tags={tags}
            onChange={updateFilter}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
        </View>
      )}

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <View style={tw`mb-5 flex-row flex-wrap items-center gap-2`}>
          {activeChips.map((chip) => (
            <View
              key={chip.key}
              style={tw`flex-row items-center gap-1 rounded-full border border-borderStrong bg-card px-3 py-1`}
            >
              <Text style={tw`text-xs font-medium text-text`}>{chip.label}</Text>
              <TouchableOpacity
                onPress={chip.clear}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${chip.label} filter`}
                hitSlop={6}
              >
                <Ionicons name="close" size={14} color={colors.textFaint} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={resetAll}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={tw`text-xs font-semibold text-primaryDark`}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    if (isError) {
      return (
        <EmptyState
          icon={
            <Ionicons name="cloud-offline-outline" size={24} color={colors.primary} />
          }
          title="Could not load dishes"
          description="Something went wrong while fetching meals. Please try again."
          action={
            <PillButton title="Retry" onPress={() => refetch()} variant="primary" />
          }
        />
      );
    }

    if (nothingFound) {
      return (
        <EmptyState
          icon={
            favoritesEmpty ? (
              <Ionicons name="heart-outline" size={24} color={colors.primary} />
            ) : undefined
          }
          title={
            favoritesEmpty
              ? "No favourites yet"
              : searchInput
                ? `No dishes match “${searchInput}”`
                : "No dishes match your filters"
          }
          description={
            favoritesEmpty
              ? "Tap the heart on any dish to save it here for quick ordering."
              : "Try a different keyword or loosen a filter or two."
          }
          action={
            <PillButton
              title={favoritesEmpty ? "Browse all dishes" : "Clear search & filters"}
              onPress={resetAll}
              variant="primary"
            />
          }
        />
      );
    }

    return null;
  };

  const renderSkeletons = () => (
    <View style={tw`flex-row flex-wrap gap-3`}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View key={index} style={tw`w-[48%]`}>
          <FoodCardSkeleton />
        </View>
      ))}
    </View>
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Food; index: number }) => {
      const isLastOdd =
        index === filtered.length - 1 && filtered.length % 2 === 1;
      return (
        <View style={[tw`w-[48%] mb-3`, isLastOdd && { width: "100%" }]}>
          <FoodCard
            food={item}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        </View>
      );
    },
    [filtered.length, favoriteIds, handleToggleFavorite],
  );

  return (
    <View
      style={[
        tw`flex-1 bg-background`,
        { paddingTop: insets.top },
      ]}
    >
      <FlatList
        data={isLoading ? [] : filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? renderSkeletons() : renderEmpty()
        }
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={tw`justify-between`}
        contentContainerStyle={tw`px-[5%] pb-8`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel="Browse homemade dishes"
      />
    </View>
  );
}
