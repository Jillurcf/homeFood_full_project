import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetFoodByIdQuery, useGetFoodsQuery } from "@/src/api/foods";
import { FoodCard } from "@/src/components/browse/FoodCard";
import {
  EmptyState,
  PillButton,
  Skeleton,
  Stars,
  VerifiedBadge,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";
import { toggleFavorite } from "@/src/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { useCart } from "@/src/store/cartStore";
import type { Food, FoodReview } from "@/src/types/food";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function availabilityText(food: Food) {
  if (food.availability === "soldOut") return "Sold out for today";
  if (food.availability === "low") return "Only a few left — order soon";
  return "Available now";
}

function DetailSkeleton() {
  return (
    <View style={tw`gap-4`} aria-hidden>
      <Skeleton height={280} style={tw`rounded-2xl`} />
      <Skeleton height={20} width={100} />
      <Skeleton height={32} width="70%" />
      <Skeleton height={16} width="50%" />
      <Skeleton height={80} />
      <Skeleton height={140} style={tw`rounded-2xl`} />
    </View>
  );
}

function ReviewCard({ review }: { review: FoodReview }) {
  return (
    <View style={tw`rounded-2xl border border-border bg-card p-4 shadow-sm`}>
      <View style={tw`flex-row items-center gap-3`}>
        <View
          style={tw`h-10 w-10 items-center justify-center rounded-full bg-primary/10`}
        >
          <Text style={tw`text-sm font-bold text-primaryDark`}>
            {initialsOf(review.author)}
          </Text>
        </View>
        <View style={tw`min-w-0 flex-1`}>
          <Text numberOfLines={1} style={tw`text-sm font-semibold text-text`}>
            {review.author}
          </Text>
          <Text style={tw`text-xs text-textFaint`}>
            {review.area} · {review.date}
          </Text>
        </View>
        <Stars rating={review.rating} size={12} />
      </View>
      <Text style={tw`mt-3 text-sm text-text/80`}>{review.text}</Text>
      {review.sellerReply ? (
        <View style={tw`mt-3 rounded-xl bg-background p-3`}>
          <Text style={tw`mb-0.5 text-xs font-semibold text-textMuted`}>
            Reply from the kitchen
          </Text>
          <Text style={tw`text-sm text-text/80`}>{review.sellerReply}</Text>
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={tw`flex-row items-center gap-2.5`}>
      {icon}
      <Text style={tw`flex-1 text-sm text-textMuted`}>{children}</Text>
    </View>
  );
}

export default function FoodDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const favoriteIds = useAppSelector((state) => state.favorites.ids);
  const { add, setQty, qtyOf } = useCart();

  const {
    data: food,
    isLoading,
    isError,
    refetch,
  } = useGetFoodByIdQuery(id ?? "", { skip: !id });
  const { data: similarFoods = [] } = useGetFoodsQuery(
    food ? { category: food.category, limit: 4 } : undefined,
    { skip: !food },
  );

  const similar = React.useMemo(() => {
    if (!food) return [];
    return similarFoods.filter((f) => f.id !== food.id).slice(0, 4);
  }, [similarFoods, food]);

  const isFavorite = food ? favoriteIds.includes(food.id) : false;
  const qty = food ? qtyOf(food.id) : 0;
  const soldOut = food?.availability === "soldOut";
  const aggregate = food && food.reviewCount > 0 ? food.rating : 0;

  const handleToggleFavorite = () => {
    if (food) dispatch(toggleFavorite(food.id));
  };

  const handleAddToCart = () => {
    if (!food || soldOut) return;
    add(food.id);
  };

  const handleIncrease = () => {
    if (food && !soldOut) add(food.id);
  };

  const handleDecrease = () => {
    if (food) setQty(food.id, Math.max(0, qty - 1));
  };

  const browseDishes = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (isLoading) {
    return (
      <View style={[tw`flex-1 bg-background px-[5%]`, { paddingTop: insets.top }]}>
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !food) {
    return (
      <View
        style={[
          tw`flex-1 justify-center bg-background px-[6%]`,
          { paddingTop: insets.top },
        ]}
      >
        <EmptyState
          icon={
            <Ionicons
              name="restaurant-outline"
              size={24}
              color={colors.primary}
            />
          }
          title="Couldn't load this dish"
          description="Check your connection and try again. The dish may have been removed by the chef."
          action={
            <View style={tw`flex-row flex-wrap justify-center gap-2`}>
              {id && (
                <PillButton
                  title="Try again"
                  onPress={() => void refetch()}
                  variant="primary"
                />
              )}
              <PillButton
                title="Browse dishes"
                onPress={browseDishes}
                variant="secondary"
              />
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-background`}>
      <FlatList
        data={food.reviews}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={[
          tw`px-[5%] pb-10`,
          { paddingTop: insets.top + 8 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Back link */}
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back to dishes"
              hitSlop={8}
              style={tw`flex-row items-center gap-1 self-start py-2`}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={colors.textMuted}
              />
              <Text style={tw`text-sm font-semibold text-textMuted`}>
                Back to dishes
              </Text>
            </TouchableOpacity>

            {/* Hero image */}
            <View
              style={[
                tw`relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-background shadow-sm`,
                soldOut && tw`opacity-90`,
              ]}
            >
              <Image
                source={{ uri: food.image }}
                contentFit="cover"
                transition={250}
                style={tw`h-52 w-full`}
              />
              {soldOut && (
                <View
                  style={tw`absolute inset-0 items-center justify-center bg-ink/40`}
                >
                  <View style={tw`rounded-full bg-white px-4 py-1.5`}>
                    <Text style={tw`text-sm font-bold text-ink`}>
                      Sold out for today
                    </Text>
                  </View>
                </View>
              )}

              {/* Favorite heart */}
              <TouchableOpacity
                onPress={handleToggleFavorite}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isFavorite }}
                accessibilityLabel={
                  isFavorite
                    ? "Remove from favourites"
                    : "Save to favourites"
                }
                style={tw`absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white shadow-md`}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "#EF4444" : "rgba(58,46,42,0.60)"}
                />
              </TouchableOpacity>
            </View>

            {/* Category + availability */}
            <View style={tw`mt-4 flex-row flex-wrap items-center gap-2`}>
              <View
                style={tw`rounded-full bg-primary/10 px-3 py-1`}
              >
                <Text
                  style={tw`text-xs font-semibold uppercase tracking-wide text-primaryDark`}
                >
                  {food.category}
                </Text>
              </View>
              <View
                style={[
                  tw`rounded-full px-2.5 py-1`,
                  food.availability === "soldOut"
                    ? tw`bg-red-bg`
                    : food.availability === "low"
                      ? tw`bg-amber-bg`
                      : tw`bg-emerald-bg`,
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-semibold`,
                    food.availability === "soldOut"
                      ? tw`text-red-text`
                      : food.availability === "low"
                        ? tw`text-amber-text`
                        : tw`text-emerald-text`,
                  ]}
                >
                  {availabilityText(food)}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text
              style={tw`mt-3 text-3xl font-semibold tracking-tight text-text font-display`}
            >
              {food.name}
            </Text>

            {/* Seller */}
            <View style={tw`mt-3 flex-row items-center gap-3`}>
              {food.sellerImage ? (
                <Image
                  source={{ uri: food.sellerImage }}
                  contentFit="cover"
                  transition={200}
                  style={tw`h-10 w-10 rounded-full`}
                />
              ) : (
                <View
                  style={tw`h-10 w-10 items-center justify-center rounded-full bg-primary/10`}
                >
                  <Text style={tw`text-sm font-bold text-primaryDark`}>
                    {initialsOf(food.seller)}
                  </Text>
                </View>
              )}
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center gap-1`}>
                  <Text style={tw`font-semibold text-text`}>
                    {food.seller}
                  </Text>
                  {food.sellerVerified && <VerifiedBadge size={16} />}
                </View>
                <Text style={tw`text-xs text-textMuted`}>
                  Home chef · {food.area}
                </Text>
              </View>
            </View>

            {/* Rating */}
            <View style={tw`mt-4 flex-row flex-wrap items-center gap-2`}>
              <Text style={tw`text-2xl font-semibold text-text font-display`}>
                {aggregate.toFixed(1)}
              </Text>
              <Stars rating={food.rating} size={16} />
              <Text style={tw`text-sm text-textMuted`}>
                from {food.reviewCount} verified reviews
              </Text>
            </View>

            {/* Tags */}
            {food.tags.length > 0 && (
              <View style={tw`mt-3 flex-row flex-wrap gap-1.5`}>
                {food.tags.map((tag) => (
                  <View
                    key={tag}
                    style={tw`rounded-full bg-background px-2.5 py-1`}
                  >
                    <Text style={tw`text-xs font-medium text-textMuted`}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Description */}
            <Text style={tw`mt-4 text-sm leading-6 text-textMuted`}>
              {food.description}
            </Text>

            {/* Delivery info */}
            <View style={tw`mt-5 gap-3`}>
              <InfoRow
                icon={
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.primary}
                  />
                }
              >
                Ready in{" "}
                <Text style={tw`font-semibold text-text`}>
                  {food.deliveryTime}
                </Text>
              </InfoRow>
              <InfoRow
                icon={
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.primary}
                  />
                }
              >
                Delivered from{" "}
                <Text style={tw`font-semibold text-text`}>{food.area}</Text>
              </InfoRow>
              <InfoRow
                icon={
                  <Ionicons
                    name="bicycle-outline"
                    size={16}
                    color={colors.primary}
                  />
                }
              >
                <Text style={tw`font-semibold text-text`}>
                  {formatPrice(food.deliveryFee)}
                </Text>{" "}
                delivery · free above ৳1,000
              </InfoRow>
              <InfoRow
                icon={
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={colors.primary}
                  />
                }
              >
                {food.sellerVerified
                  ? "NID-verified home kitchen"
                  : "Home kitchen"}
              </InfoRow>
            </View>

            {/* Buy box */}
            <View
              style={tw`mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm`}
            >
              <View style={tw`flex-row flex-wrap items-center justify-between gap-4`}>
                <View>
                  <Text style={tw`text-sm text-textMuted`}>Price</Text>
                  <Text style={tw`text-2xl font-bold text-text`}>
                    {formatPrice(food.price)}
                    <Text style={tw`text-sm font-normal text-textFaint`}>
                      {" "}
                      / {food.perUnit}
                    </Text>
                  </Text>
                </View>

                <View style={tw`flex-row items-center gap-2`}>
                  <TouchableOpacity
                    onPress={handleDecrease}
                    disabled={qty === 0}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease quantity of ${food.name}`}
                    style={[
                      tw`h-10 w-10 items-center justify-center rounded-full border border-borderStrong`,
                      qty === 0
                        ? tw`opacity-40`
                        : tw`border-primary`,
                    ]}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={qty === 0 ? colors.textFaint : colors.primaryDark}
                    />
                  </TouchableOpacity>
                  <Text
                    style={tw`w-8 text-center text-base font-bold text-text`}
                  >
                    {qty}
                  </Text>
                  <TouchableOpacity
                    onPress={handleIncrease}
                    disabled={soldOut}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase quantity of ${food.name}`}
                    style={[
                      tw`h-10 w-10 items-center justify-center rounded-full`,
                      soldOut ? tw`bg-text/10` : tw`bg-primary`,
                    ]}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={soldOut ? colors.textFaint : colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={tw`mt-5`}>
                <PillButton
                  title={
                    soldOut
                      ? "Sold out"
                      : qty > 0
                        ? `Add another — ${formatPrice(food.price)}`
                        : "Add to cart"
                  }
                  onPress={handleAddToCart}
                  disabled={soldOut}
                  fullWidth
                  variant="primary"
                />
              </View>
            </View>

            {/* Ratings & reviews header */}
            <View style={tw`mt-10`}>
              <Text style={tw`text-2xl font-semibold text-text font-display`}>
                Ratings &amp; reviews
              </Text>
              <View style={tw`mt-3 flex-row items-end gap-2`}>
                <Text style={tw`text-5xl font-semibold text-text font-display`}>
                  {aggregate.toFixed(1)}
                </Text>
                <Text style={tw`pb-1.5 text-sm text-textMuted`}>
                  out of 5 · {food.reviewCount} reviews
                </Text>
              </View>
            </View>

            {food.reviews.length === 0 && (
              <Text style={tw`mt-4 text-sm text-textMuted`}>
                No reviews yet.
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => <ReviewCard review={item} />}
        ItemSeparatorComponent={() => <View style={tw`h-3`} />}
        ListFooterComponent={
          <View>
            {/* Similar dishes */}
            {similar.length > 0 && (
              <View style={tw`mt-10`}>
                <Text
                  style={tw`mb-4 text-2xl font-semibold text-text font-display`}
                >
                  More {food.category.toLowerCase()} you may like
                </Text>
                <FlatList
                  horizontal
                  data={similar}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={tw`w-3`} />}
                  renderItem={({ item }) => (
                    <View style={tw`w-44`}>
                      <FoodCard
                        food={item}
                        isFavorite={favoriteIds.includes(item.id)}
                        onToggleFavorite={(fid) =>
                          dispatch(toggleFavorite(fid))
                        }
                      />
                    </View>
                  )}
                />
              </View>
            )}

            <Text style={tw`mt-12 text-center text-sm text-textFaint`}>
              Need help? Contact the seller directly for custom orders and
              catering.
            </Text>
          </View>
        }
      />
    </View>
  );
}
