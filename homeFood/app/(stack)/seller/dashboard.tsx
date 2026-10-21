import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  STATUS_META,
  shortOrderId,
  useGetSellerOrdersQuery,
} from "@/src/api/orders";
import { useGetMyShopQuery, useGetMyStatsQuery } from "@/src/api/shops";
import {
  EmptyState,
  PillButton,
  Skeleton,
  StatusPill,
  Stars,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";

const SEA_GREEN = "#047857";
const AMBER = "#B45309";
const VIOLET = "#7C3AED";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub: string;
  tint: string;
  tintBg: string;
}

function StatCard({ icon, label, value, sub, tint, tintBg }: StatCardProps) {
  return (
    <View
      style={tw`flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm`}
    >
      <View
        style={[
          tw`h-9 w-9 items-center justify-center rounded-lg`,
          { backgroundColor: tintBg },
        ]}
      >
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={tw`mt-3 font-display text-xl font-semibold text-text`}>
        {value}
      </Text>
      <Text style={tw`mt-0.5 text-xs font-semibold text-text`}>{label}</Text>
      <Text style={tw`text-xs text-textMuted`}>{sub}</Text>
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <View style={tw`gap-4`} aria-hidden>
      <Skeleton height={64} style={tw`rounded-2xl`} />
      <Skeleton height={120} style={tw`rounded-2xl`} />
      <View style={tw`flex-row gap-3`}>
        <Skeleton height={130} style={tw`flex-1 rounded-2xl`} />
        <Skeleton height={130} style={tw`flex-1 rounded-2xl`} />
      </View>
      <View style={tw`flex-row gap-3`}>
        <Skeleton height={130} style={tw`flex-1 rounded-2xl`} />
        <Skeleton height={130} style={tw`flex-1 rounded-2xl`} />
      </View>
      <Skeleton height={180} style={tw`rounded-2xl`} />
    </View>
  );
}

export default function SellerDashboardScreen() {
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
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useGetSellerOrdersQuery(undefined, { skip: !shop });

  const refreshing = statsFetching;
  const loading = shopLoading || (!!shop && (statsLoading || ordersLoading));
  const shopMissing =
    !!shopError &&
    ((shopError as { status?: number }).status === 404 ||
      (shopError as { originalStatus?: number }).originalStatus === 404);

  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);

  useFocusEffect(
    useCallback(() => {
      if (!shop) return;
      refetchStats();
      refetchOrders();
    }, [shop, refetchStats, refetchOrders]),
  );

  const onRefresh = () => {
    refetchShop();
    refetchStats();
    refetchOrders();
  };

  if (loading) {
    return (
      <View
        style={[
          tw`flex-1 bg-background px-[6%]`,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <DashboardSkeleton />
      </View>
    );
  }

  if (!shop) {
    return (
      <View
        style={[
          tw`flex-1 justify-center bg-background px-[6%]`,
          { paddingTop: insets.top },
        ]}
      >
        {shopError && !shopMissing ? (
          <EmptyState
            icon={
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={colors.primary}
              />
            }
            title="Couldn't load your kitchen"
            description="Something went wrong while fetching your shop. Please try again."
            action={
              <PillButton
                title="Retry"
                variant="primary"
                onPress={() => refetchShop()}
              />
            }
          />
        ) : (
          <EmptyState
            icon={
              <Ionicons
                name="storefront-outline"
                size={24}
                color={colors.primary}
              />
            }
            title="Set up your kitchen"
            description="Create your shop profile to start receiving orders."
            action={
              <PillButton
                title="Create my kitchen"
                onPress={() => router.replace("/(stack)/seller/onboarding")}
              />
            }
          />
        )}
      </View>
    );
  }

  const pending = stats?.pending ?? 0;
  const needsAction = pending > 0;
  const ownerFirstName = shop.fullName.split(/\s+/)[0] || "friend";

  const nextTitle = needsAction
    ? `${pending} ${pending === 1 ? "order needs" : "orders need"} your attention`
    : "Add your first dish";
  const nextDescription = needsAction
    ? "Accept the order now and get cooking."
    : "A menu with clear prices and mouth-watering photos brings the first orders in.";
  const nextLabel = needsAction ? "Accept orders" : "Add a dish";

  const goToOrders = () => router.push("/(stack)/seller/orders" as never);
  const goToMenu = () => router.push("/(stack)/seller/menu" as never);
  const goToReviews = () => router.push("/(stack)/seller/reviews" as never);
  const goToMyShop = () => router.push("/(stack)/seller/myshop" as never);

  const popularMax = stats?.popularFoods[0]?.qty ?? 0;

  return (
    <ScrollView
      style={tw`flex-1 bg-background`}
      contentContainerStyle={[
        tw`px-[6%] pb-10`,
        { paddingTop: insets.top + 12 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={tw`flex-row items-center justify-between gap-3`}>
        <View style={tw`flex-1 flex-row items-center gap-3`}>
          <View
            style={tw`h-12 w-12 items-center justify-center rounded-full bg-primary/10`}
          >
            <Text style={tw`font-display text-lg font-semibold text-primaryDark`}>
              {initialsOf(shop.fullName)}
            </Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`font-display text-xl font-semibold text-text`}>
              {greeting()}, {ownerFirstName}!
            </Text>
            <Text style={tw`mt-0.5 text-sm text-textMuted`}>
              {shop.shopName} · {shop.area}
            </Text>
          </View>
        </View>
      </View>

      <View style={tw`mt-3 flex-row items-center gap-2`}>
        <View
          style={tw`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
            shop.verified ? "bg-emerald-bg" : "bg-amber-bg"
          }`}
        >
          <View
            style={tw`h-1.5 w-1.5 rounded-full ${
              shop.verified ? "bg-emerald-text" : "bg-amber-text"
            }`}
          />
          <Text
            style={tw`text-xs font-semibold ${
              shop.verified ? "text-emerald-text" : "text-amber-text"
            }`}
          >
            {shop.verified ? "Kitchen is live" : "Verification pending"}
          </Text>
        </View>
        <Pressable
          onPress={() => router.replace("/(stack)/seller/onboarding")}
          accessibilityRole="button"
        >
          <Text style={tw`text-xs font-semibold text-primaryDark`}>
            Edit shop
          </Text>
        </Pressable>
      </View>

      <View style={tw`mt-5 overflow-hidden rounded-2xl bg-primary p-5`}>
        <View
          style={tw`absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primaryDark/40`}
        />
        <View
          style={tw`absolute -bottom-12 right-16 h-24 w-24 rounded-full bg-primaryDark/20`}
        />
        <View style={tw`flex-row items-start gap-3`}>
          <View
            style={tw`h-10 w-10 items-center justify-center rounded-full bg-white/15`}
          >
            <Ionicons name="sparkles" size={20} color={colors.white} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`font-semibold text-white`}>{nextTitle}</Text>
            <Text style={tw`mt-0.5 text-sm text-white/85`}>
              {nextDescription}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={needsAction ? goToOrders : goToMenu}
          accessibilityRole="button"
          style={tw`mt-4 self-start rounded-full bg-card px-5 py-2.5`}
        >
          <Text style={tw`text-sm font-semibold text-primaryDark`}>
            {nextLabel} →
          </Text>
        </Pressable>
      </View>

      <View style={tw`mt-5 flex-row gap-3`}>
        <StatCard
          icon="bag-handle-outline"
          label="Today's orders"
          value={String(stats?.todayOrders ?? 0)}
          sub="placed today"
          tint={colors.primary}
          tintBg="rgba(243,108,38,0.10)"
        />
        <StatCard
          icon="clipboard-outline"
          label="Pending"
          value={String(pending)}
          sub="need your action"
          tint={AMBER}
          tintBg="rgba(251,191,36,0.16)"
        />
      </View>
      <View style={tw`mt-3 flex-row gap-3`}>
        <StatCard
          icon="checkmark-done-outline"
          label="Completed"
          value={String(stats?.completed ?? 0)}
          sub="delivered so far"
          tint={SEA_GREEN}
          tintBg="rgba(16,185,129,0.14)"
        />
        <StatCard
          icon="wallet-outline"
          label="Today's earnings"
          value={formatPrice(stats?.todayEarnings ?? 0)}
          sub={`${formatPrice(stats?.totalEarnings ?? 0)} total`}
          tint={VIOLET}
          tintBg="rgba(124,58,237,0.12)"
        />
      </View>

      <View
        style={tw`mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm`}
      >
        <View style={tw`flex-row items-center justify-between gap-3`}>
          <View style={tw`flex-1`}>
            <Text style={tw`font-display text-lg font-semibold text-text`}>
              Recent orders
            </Text>
            <Text style={tw`mt-0.5 text-sm text-textMuted`}>
              Latest activity from your customers
            </Text>
          </View>
          <Pressable onPress={goToOrders} accessibilityRole="button">
            <Text style={tw`text-xs font-semibold text-primaryDark`}>
              View all
            </Text>
          </Pressable>
        </View>

        {recentOrders.length === 0 ? (
          <Text style={tw`mt-4 text-sm text-textMuted`}>
            New orders will show up here as soon as customers place them.
          </Text>
        ) : (
          <View style={tw`mt-2`}>
            {recentOrders.map((order, index) => {
              const meta = STATUS_META[order.status];
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <Pressable
                  key={order.id}
                  onPress={goToOrders}
                  accessibilityRole="button"
                  style={tw`flex-row items-center justify-between gap-3 py-3 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <View style={tw`min-w-0 flex-1`}>
                    <View style={tw`flex-row items-center gap-2`}>
                      <Text style={tw`text-sm font-semibold text-text`}>
                        {shortOrderId(order.id)}
                      </Text>
                      <StatusPill variant={meta.variant} label={meta.label} />
                    </View>
                    <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                      {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                  <Text style={tw`font-display font-semibold text-text`}>
                    {formatPrice(order.totalAmount)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={tw`mt-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}>
        <View style={tw`flex-row items-center justify-between gap-3`}>
          <View style={tw`flex-1`}>
            <Text style={tw`font-display text-lg font-semibold text-text`}>
              Total earnings
            </Text>
            <Text style={tw`mt-1 font-display text-2xl font-semibold text-text`}>
              {formatPrice(stats?.totalEarnings ?? 0)}
            </Text>
            <Text style={tw`mt-0.5 text-sm text-textMuted`}>
              across {stats?.completed ?? 0} completed{" "}
              {(stats?.completed ?? 0) === 1 ? "order" : "orders"}
            </Text>
          </View>
          <View style={tw`items-end gap-1`}>
            <Stars rating={stats?.avgRating ?? 0} size={14} />
            <Text style={tw`text-xs text-textMuted`}>
              {stats?.avgRating
                ? `${stats.avgRating.toFixed(1)} avg rating`
                : "No reviews yet"}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={tw`mt-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}
      >
        <Text style={tw`font-display text-lg font-semibold text-text`}>
          Popular dishes
        </Text>
        <Text style={tw`mt-0.5 text-sm text-textMuted`}>Best sellers so far</Text>

        {(stats?.popularFoods.length ?? 0) === 0 ? (
          <Text style={tw`mt-3 text-sm text-textMuted`}>
            No sales yet — get some orders rolling to see your bestsellers here.
          </Text>
        ) : (
          <View style={tw`mt-3 gap-3`}>
            {stats?.popularFoods.map((item, index) => (
              <View key={item.foodId}>
                <View style={tw`flex-row items-center justify-between gap-2`}>
                  <Text style={tw`flex-1 text-sm font-medium text-text`}>
                    {index + 1}. {item.name}
                  </Text>
                  <Text style={tw`text-xs text-textMuted`}>
                    {item.qty} sold
                  </Text>
                </View>
                <View
                  style={tw`mt-1 h-1.5 overflow-hidden rounded-full bg-background`}
                >
                  <View
                    style={[
                      tw`h-1.5 rounded-full bg-primary`,
                      {
                        width: `${
                          popularMax ? (item.qty / popularMax) * 100 : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={tw`mt-5 flex-row flex-wrap gap-3`}>
        {[
          {
            icon: "storefront-outline" as const,
            label: "My shop",
            onPress: goToMyShop,
          },
          {
            icon: "add-circle-outline" as const,
            label: "Add a dish",
            onPress: goToMenu,
          },
          {
            icon: "receipt-outline" as const,
            label: "Manage orders",
            onPress: goToOrders,
          },
          {
            icon: "chatbubble-ellipses-outline" as const,
            label: "Reply to reviews",
            onPress: goToReviews,
          },
          {
            icon: "settings-outline" as const,
            label: "Settings",
            onPress: () => router.replace("/(stack)/seller/onboarding"),
          },
        ].map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            style={tw`w-[48%] items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 shadow-sm`}
          >
            <View
              style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
            >
              <Ionicons name={action.icon} size={18} color={colors.primary} />
            </View>
            <Text style={tw`text-center text-xs font-semibold text-text`}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
