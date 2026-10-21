import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetMyFoodsQuery } from "@/src/api/foods";
import { useGetMyShopQuery, useGetMyStatsQuery } from "@/src/api/shops";
import {
  AvailabilityPill,
  EmptyState,
  PillButton,
  Skeleton,
  VerifiedBadge,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";

const SELLING_STEPS = [
  {
    title: "Set up your kitchen",
    body: "Name it, pick your areas",
  },
  {
    title: "Add dishes & photos",
    body: "Set prices and availability",
  },
  {
    title: "Accept orders",
    body: "Cook, deliver and earn",
  },
];

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "HF"
  );
}

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(stack)/seller/dashboard");
  }
}

function BackHeader() {
  return (
    <View style={tw`flex-row items-center gap-2`}>
      <Pressable
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={tw`h-9 w-9 items-center justify-center rounded-full bg-card`}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text} />
      </Pressable>
      <Text style={tw`font-display text-xl font-semibold text-text`}>
        My shop
      </Text>
    </View>
  );
}

export default function MyShopScreen() {
  const insets = useSafeAreaInsets();

  const {
    data: shop,
    isLoading: shopLoading,
    error: shopError,
    refetch: refetchShop,
  } = useGetMyShopQuery();

  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useGetMyStatsQuery(undefined, { skip: !shop });

  const {
    data: foods = [],
    isLoading: foodsLoading,
    refetch: refetchFoods,
  } = useGetMyFoodsQuery(undefined, { skip: !shop });

  const loading =
    shopLoading || (!!shop && (statsLoading || foodsLoading));

  const shopMissing =
    !!shopError &&
    ((shopError as { status?: number }).status === 404 ||
      (shopError as { originalStatus?: number }).originalStatus === 404);

  useFocusEffect(
    useCallback(() => {
      if (!shop) return;
      refetchStats();
      refetchFoods();
    }, [shop, refetchStats, refetchFoods]),
  );

  const onRefresh = () => {
    refetchShop();
    refetchStats();
    refetchFoods();
  };

  const goToMenu = () => router.push("/(stack)/seller/menu" as never);
  const goToOrders = () => router.push("/(stack)/seller/orders" as never);

  if (loading) {
    return (
      <View
        style={[
          tw`flex-1 gap-4 bg-background px-[6%]`,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <BackHeader />
        <Skeleton height={180} style={tw`rounded-2xl`} />
        <View style={tw`flex-row gap-3`}>
          <Skeleton height={90} style={tw`flex-1 rounded-2xl`} />
          <Skeleton height={90} style={tw`flex-1 rounded-2xl`} />
        </View>
        <View style={tw`flex-row gap-3`}>
          <Skeleton height={90} style={tw`flex-1 rounded-2xl`} />
          <Skeleton height={90} style={tw`flex-1 rounded-2xl`} />
        </View>
        <Skeleton height={160} style={tw`rounded-2xl`} />
      </View>
    );
  }

  if (!shop) {
    if (shopError && !shopMissing) {
      return (
        <ScrollView
          style={tw`flex-1 bg-background`}
          contentContainerStyle={[
            tw`px-[6%] pb-10`,
            { paddingTop: insets.top + 12 },
          ]}
        >
          <BackHeader />
          <View style={tw`mt-10`}>
            <EmptyState
              icon={
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color={colors.primary}
                />
              }
              title="Couldn't load your shop"
              description="Something went wrong while fetching your shop. Please try again."
              action={
                <PillButton
                  title="Retry"
                  variant="primary"
                  onPress={() => refetchShop()}
                />
              }
            />
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={tw`flex-1 bg-background`}
        contentContainerStyle={[
          tw`px-[6%] pb-12`,
          { paddingTop: insets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <BackHeader />

        <View
          style={tw`mt-6 items-center rounded-2xl border border-border bg-card p-6 shadow-sm`}
        >
          <View
            style={tw`h-14 w-14 items-center justify-center rounded-full bg-primary/10`}
          >
            <Ionicons name="restaurant-outline" size={28} color={colors.primary} />
          </View>
          <Text
            style={tw`mt-4 text-center font-display text-2xl font-semibold text-text`}
          >
            Turn your home cooking into a small business
          </Text>
          <Text style={tw`mt-2 text-center text-sm leading-6 text-textMuted`}>
            Set up your kitchen, add your best dishes with photos and prices,
            then start receiving orders. No technical skills needed.
          </Text>

          <View style={tw`mt-5 w-full gap-3`}>
            {SELLING_STEPS.map((step, index) => (
              <View
                key={step.title}
                style={tw`flex-row items-start gap-3 rounded-xl bg-background p-3.5`}
              >
                <View
                  style={tw`h-8 w-8 items-center justify-center rounded-full bg-primary`}
                >
                  <Text style={tw`text-sm font-semibold text-white`}>
                    {index + 1}
                  </Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-semibold text-text`}>
                    {step.title}
                  </Text>
                  <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                    {step.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <PillButton
            title="Start selling →"
            fullWidth
            style={tw`mt-5`}
            onPress={() => router.replace("/(stack)/seller/onboarding")}
          />
        </View>
      </ScrollView>
    );
  }

  const dishCount = foods.length;
  const avgRating =
    stats && stats.avgRating ? `${stats.avgRating.toFixed(1)}★` : "—";

  const statTiles = [
    { label: "Dishes", value: String(dishCount) },
    { label: "Avg. rating", value: avgRating },
    { label: "Orders delivered", value: String(stats?.completed ?? 0) },
    { label: "Total earned", value: formatPrice(stats?.totalEarnings ?? 0) },
  ];

  return (
    <ScrollView
      style={tw`flex-1 bg-background`}
      contentContainerStyle={[
        tw`px-[6%] pb-12`,
        { paddingTop: insets.top + 12 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={statsFetching}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <BackHeader />

      <View style={tw`mt-4 overflow-hidden rounded-2xl bg-primary p-5`}>
        <View
          style={tw`absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primaryDark/40`}
        />
        <View
          style={tw`absolute -bottom-12 right-16 h-24 w-24 rounded-full bg-primaryDark/20`}
        />

        <View style={tw`flex-row items-center gap-3`}>
          {shop.photoUrl ? (
            <Image
              source={{ uri: shop.photoUrl }}
              style={tw`h-14 w-14 rounded-full border-2 border-white/40`}
              contentFit="cover"
            />
          ) : (
            <View
              style={tw`h-14 w-14 items-center justify-center rounded-full bg-white/20`}
            >
              <Text style={tw`font-display text-lg font-semibold text-white`}>
                {initialsOf(shop.fullName)}
              </Text>
            </View>
          )}
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <Text
                style={tw`flex-1 font-display text-xl font-semibold text-white`}
                numberOfLines={1}
              >
                {shop.shopName}
              </Text>
              {shop.verified && <VerifiedBadge size={16} />}
            </View>
            <Text style={tw`mt-0.5 text-sm text-white/85`}>
              {shop.fullName} · {shop.area}
            </Text>
            {!!shop.bio && (
              <Text style={tw`mt-1 text-xs leading-5 text-white/75`}>
                {shop.bio}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => router.replace("/(stack)/seller/onboarding")}
          accessibilityRole="button"
          style={tw`mt-4 self-start rounded-full bg-white px-5 py-2.5`}
        >
          <Text style={tw`text-sm font-semibold text-primaryDark`}>
            Manage my shop
          </Text>
        </Pressable>
      </View>

      <View style={tw`mt-4 flex-row flex-wrap gap-3`}>
        {statTiles.map((tile) => (
          <View
            key={tile.label}
            style={tw`w-[48%] rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <Text
              style={tw`font-display text-xl font-semibold text-text`}
              numberOfLines={1}
            >
              {tile.value}
            </Text>
            <Text style={tw`mt-0.5 text-xs text-textMuted`}>{tile.label}</Text>
          </View>
        ))}
      </View>

      <View style={tw`mt-4 gap-3`}>
        {[
          {
            icon: "add-circle-outline" as const,
            title: "Add dishes to your menu",
            subtitle: "Photos, prices, availability",
            onPress: goToMenu,
          },
          {
            icon: "receipt-outline" as const,
            title: "Manage your orders",
            subtitle: "Accept, cook and deliver",
            onPress: goToOrders,
          },
        ].map((action) => (
          <Pressable
            key={action.title}
            onPress={action.onPress}
            accessibilityRole="button"
            style={tw`flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <View
              style={tw`h-10 w-10 items-center justify-center rounded-xl bg-primary/10`}
            >
              <Ionicons name={action.icon} size={20} color={colors.primary} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-semibold text-text`}>
                {action.title}
              </Text>
              <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                {action.subtitle}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        ))}
      </View>

      <View
        style={tw`mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm`}
      >
        <View style={tw`flex-row items-start justify-between gap-3`}>
          <View style={tw`flex-1`}>
            <Text style={tw`font-display text-lg font-semibold text-text`}>
              Menu
            </Text>
            <Text style={tw`mt-0.5 text-sm text-textMuted`}>
              What customers see when they open your shop
            </Text>
          </View>
          <Pressable onPress={goToMenu} accessibilityRole="button">
            <Text style={tw`text-xs font-semibold text-primaryDark`}>
              Edit menu
            </Text>
          </Pressable>
        </View>

        {dishCount === 0 ? (
          <View style={tw`mt-4`}>
            <EmptyState
              icon={
                <Ionicons
                  name="restaurant-outline"
                  size={24}
                  color={colors.primary}
                />
              }
              title="Your menu is empty"
              description="Add your first dish so customers can start ordering."
              action={<PillButton title="Add a dish" onPress={goToMenu} />}
              style={tw`p-6`}
            />
          </View>
        ) : (
          <View style={tw`mt-3 gap-3`}>
            {foods.map((food) => (
              <View
                key={food.id}
                style={tw`flex-row gap-3 border-t border-border pt-3`}
              >
                {food.image ? (
                  <Image
                    source={{ uri: food.image }}
                    style={tw`h-16 w-16 rounded-xl`}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={tw`h-16 w-16 items-center justify-center rounded-xl bg-background`}
                  >
                    <Ionicons
                      name="fast-food-outline"
                      size={22}
                      color={colors.textFaint}
                    />
                  </View>
                )}
                <View style={tw`flex-1`}>
                  <Text
                    style={tw`text-sm font-semibold text-text`}
                    numberOfLines={1}
                  >
                    {food.name}
                  </Text>
                  <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                    {food.category}
                  </Text>
                  <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                    {food.availability === "soldOut"
                      ? "Unavailable today"
                      : "Ready to order"}
                  </Text>
                  <View
                    style={tw`mt-1.5 flex-row items-center justify-between gap-2`}
                  >
                    <Text style={tw`text-sm font-semibold text-primaryDark`}>
                      {formatPrice(food.price)}/{food.perUnit}
                    </Text>
                    <AvailabilityPill availability={food.availability} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <Text style={tw`mt-4 px-2 text-center text-xs leading-5 text-textMuted`}>
        This is a preview of your shop page. Share{" "}
        <Text style={tw`font-semibold text-text`}>my shop</Text> with friends and
        neighbours to grow your orders.
      </Text>
    </ScrollView>
  );
}
