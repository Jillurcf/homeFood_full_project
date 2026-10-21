import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ORDER_FILTERS,
  STATUS_META,
  formatOrderDate,
  matchesOrderFilter,
  orderItemCount,
  shortOrderId,
  useGetMyOrdersQuery,
  type Order,
  type OrderFilterValue,
} from "@/src/api/orders";
import {
  Card,
  Chip,
  EmptyState,
  PillButton,
  Skeleton,
  StatusPill,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const meta = STATUS_META[order.status];
  const itemCount = orderItemCount(order);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Order ${shortOrderId(order.id)}, ${meta.label}`}
    >
      <Card style={tw`mb-3 p-4`}>
        <View style={tw`flex-row items-center justify-between gap-2`}>
          <Text style={tw`text-sm font-semibold text-text`}>
            {shortOrderId(order.id)}
          </Text>
          <StatusPill variant={meta.variant} label={meta.label} />
        </View>
        <Text style={tw`mt-1 text-xs text-textMuted`}>
          {formatOrderDate(order.createdAt)}
        </Text>
        <View
          style={tw`mt-3 flex-row items-center justify-between border-t border-border pt-3`}
        >
          <View style={tw`flex-row items-center gap-1.5`}>
            <Ionicons
              name="fast-food-outline"
              size={16}
              color={colors.textMuted}
            />
            <Text style={tw`text-sm text-textMuted`}>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Text>
          </View>
          <Text style={tw`text-sm font-semibold text-primary`}>
            {formatPrice(order.totalAmount)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

function ListSkeleton() {
  return (
    <View style={tw`gap-3`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height={110} style={tw`rounded-2xl`} />
      ))}
    </View>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<OrderFilterValue>("all");

  const {
    data: orders = [],
    isLoading,
    isError,
    isRefreshing,
    refetch,
  } = useGetMyOrdersQuery(undefined, {
    selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
      data: data ?? [],
      isLoading,
      isRefreshing: isFetching && !isLoading,
      isError,
    }),
  });

  const filtered = useMemo(
    () => orders.filter((order) => matchesOrderFilter(order, filter)),
    [orders, filter],
  );

  const openOrder = (orderId: string) =>
    router.push({
      pathname: "/(stack)/order/[id]" as never,
      params: { id: orderId },
    });

  const header = (
    <View>
      <Text style={tw`text-lg font-semibold text-text`}>My orders</Text>
      <Text style={tw`mt-1 text-sm text-textMuted`}>
        Track and review your past orders
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`gap-2 py-4`}
      >
        {ORDER_FILTERS.map((option) => (
          <Chip
            key={option.value}
            active={filter === option.value}
            onPress={() => setFilter(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          tw`flex-1 bg-background px-[6%]`,
          { paddingTop: insets.top + 8 },
        ]}
      >
        {header}
        <ListSkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          tw`flex-1 justify-center bg-background px-[6%]`,
          { paddingTop: insets.top },
        ]}
      >
        <EmptyState
          icon={
            <Ionicons name="alert-circle-outline" size={24} color={colors.primary} />
          }
          title="Couldn't load orders"
          description="Something went wrong while fetching your orders. Please try again."
          action={
            <PillButton title="Retry" onPress={() => refetch()} variant="primary" />
          }
        />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View
        style={[
          tw`flex-1 justify-center bg-background px-[6%]`,
          { paddingTop: insets.top },
        ]}
      >
        <EmptyState
          icon={
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
          }
          title="No orders yet"
          description="When you place an order it will show up here"
          action={
            <PillButton
              title="Browse food"
              onPress={() => router.push("/(tabs)")}
              variant="primary"
            />
          }
        />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-background`}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          tw`px-[6%] pb-6`,
          { paddingTop: insets.top + 8 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => openOrder(item.id)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={
              <Ionicons name="filter-outline" size={24} color={colors.primary} />
            }
            title={`No ${
              ORDER_FILTERS.find((o) => o.value === filter)?.label.toLowerCase() ??
              "matching"
            } orders`}
            description="Orders with this status will show up here"
          />
        }
      />
    </View>
  );
}
