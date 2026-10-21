import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  shortOrderId,
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
  type Order,
  type OrderFilterValue,
  type OrderStatus,
} from "@/src/api/orders";
import {
  EmptyState,
  PillButton,
  Skeleton,
  StatusPill,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";

function orderClock(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onChangeStatus,
  updating,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onChangeStatus: (status: OrderStatus) => void;
  updating: boolean;
}) {
  const meta = STATUS_META[order.status];
  const address = order.deliveryAddress;
  const customerArea = address?.area || "Dhaka";
  const isNew = order.status === "PENDING";
  const isPreparing =
    order.status === "PREPARING" || order.status === "CONFIRMED";

  return (
    <View
      style={tw`mb-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm`}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={tw`flex-row items-center gap-3 p-4`}
      >
        <View style={tw`min-w-0 flex-1`}>
          <View style={tw`flex-row flex-wrap items-center gap-2`}>
            <Text style={tw`text-sm font-semibold text-text`}>
              {shortOrderId(order.id)}
            </Text>
            <StatusPill variant={meta.variant} label={meta.label} />
          </View>
          <Text style={tw`mt-0.5 text-sm text-textMuted`}>
            Customer · {customerArea}
          </Text>
        </View>
        <View style={tw`shrink-0 items-end`}>
          <Text style={tw`font-display font-semibold text-text`}>
            {formatPrice(order.totalAmount)}
          </Text>
          <Text style={tw`text-xs text-textFaint`}>
            {formatOrderDate(order.createdAt)}, {orderClock(order.createdAt)}
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textFaint}
        />
      </Pressable>

      {expanded && (
        <View style={tw`gap-4 border-t border-border p-4`}>
          <View>
            <Text
              style={tw`mb-2 text-xs font-semibold uppercase tracking-wide text-textFaint`}
            >
              Items
            </Text>
            <View style={tw`gap-1.5`}>
              {order.items.map((line, index) => (
                <View
                  key={`${order.id}-${line.foodId}-${index}`}
                  style={tw`flex-row items-center justify-between gap-3`}
                >
                  <Text style={tw`flex-1 text-sm text-text`}>
                    {line.quantity} × {line.name}
                  </Text>
                  <Text style={tw`shrink-0 text-sm text-textMuted`}>
                    {formatPrice(line.price * line.quantity)}
                  </Text>
                </View>
              ))}
              <View
                style={tw`mt-1 flex-row items-center justify-between border-t border-border pt-2`}
              >
                <Text style={tw`text-sm font-semibold text-text`}>Total</Text>
                <Text style={tw`text-sm font-semibold text-text`}>
                  {formatPrice(order.totalAmount)}
                </Text>
              </View>
            </View>
          </View>

          {(address?.addressLine || address?.phone) && (
            <View style={tw`gap-1.5`}>
              {address?.addressLine && (
                <View style={tw`flex-row items-start gap-2`}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.primary}
                    style={tw`mt-0.5`}
                  />
                  <Text style={tw`flex-1 text-sm text-textMuted`}>
                    {address.addressLine}
                    {address.area ? `, ${address.area}` : ""}
                  </Text>
                </View>
              )}
              {address?.phone && (
                <View style={tw`flex-row items-center gap-2`}>
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={tw`text-sm text-textMuted`}>{address.phone}</Text>
                </View>
              )}
            </View>
          )}

          {order.note ? (
            <View style={tw`rounded-xl bg-amber-bg p-3`}>
              <Text style={tw`text-sm text-amber-text`}>
                <Text style={tw`font-semibold`}>Customer note: </Text>
                {order.note}
              </Text>
            </View>
          ) : null}

          {isNew && (
            <View style={tw`flex-row flex-wrap gap-2`}>
              <PillButton
                title="Accept order"
                loading={updating}
                disabled={updating}
                onPress={() => onChangeStatus("PREPARING")}
              />
              <PillButton
                title="Decline"
                variant="secondary"
                loading={updating}
                disabled={updating}
                onPress={() => onChangeStatus("CANCELLED")}
              />
            </View>
          )}

          {isPreparing && (
            <PillButton
              title="Mark as delivered"
              loading={updating}
              disabled={updating}
              onPress={() => onChangeStatus("DELIVERED")}
            />
          )}

          {order.status === "DELIVERED" && (
            <Text style={tw`text-sm text-textFaint`}>
              This order is delivered and closed. Well done!
            </Text>
          )}

          {order.status === "CANCELLED" && (
            <Text style={tw`text-sm text-textFaint`}>
              This order was declined and is no longer active.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function ListSkeleton() {
  return (
    <View style={tw`gap-3`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height={96} style={tw`rounded-2xl`} />
      ))}
    </View>
  );
}

export default function SellerOrdersScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<OrderFilterValue>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetSellerOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();

  const counts = useMemo(
    () => ({
      new: orders.filter((order) => order.status === "PENDING").length,
      preparing: orders.filter((order) =>
        ["CONFIRMED", "PREPARING", "ON_THE_WAY"].includes(order.status),
      ).length,
      delivered: orders.filter((order) => order.status === "DELIVERED").length,
    }),
    [orders],
  );

  const visible = useMemo(
    () => orders.filter((order) => matchesOrderFilter(order, filter)),
    [orders, filter],
  );

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      await updateStatus({ orderId: order.id, status }).unwrap();
      if (status === "DELIVERED" || status === "CANCELLED") {
        setOpenId(null);
      }
    } catch (err: any) {
      Alert.alert(
        "Couldn't update order",
        err?.data?.message ?? "Please try again in a moment.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const header = (
    <View>
      <View style={tw`flex-row items-center gap-2`}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(stack)/seller/dashboard")
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={tw`h-9 w-9 items-center justify-center rounded-full bg-card`}
        >
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
        <View style={tw`flex-1`}>
          <Text style={tw`font-display text-xl font-semibold text-text`}>
            Orders
          </Text>
          <Text style={tw`text-sm text-textMuted`}>
            Accept, cook and deliver — you are in control.
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`gap-2 py-4`}
      >
        {ORDER_FILTERS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setFilter(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === option.value }}
            style={[
              tw`rounded-full border px-3 py-1.5`,
              filter === option.value
                ? tw`border-primary bg-primary`
                : tw`border-borderStrong bg-card`,
            ]}
          >
            <Text
              style={tw`text-sm font-medium ${
                filter === option.value ? "text-white" : "text-textMuted"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={tw`mb-4 flex-row flex-wrap gap-2`}>
        {[
          {
            label: `${counts.new} new`,
            className: "bg-amber-bg",
            textClassName: "text-amber-text",
          },
          {
            label: `${counts.preparing} preparing`,
            className: "bg-primary/10",
            textClassName: "text-primaryDark",
          },
          {
            label: `${counts.delivered} delivered`,
            className: "bg-emerald-bg",
            textClassName: "text-emerald-text",
          },
        ].map((chip) => (
          <View
            key={chip.label}
            style={tw`rounded-full px-3 py-1 ${chip.className}`}
          >
            <Text style={tw`text-sm font-medium ${chip.textClassName}`}>
              {chip.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          tw`flex-1 bg-background px-[6%]`,
          { paddingTop: insets.top + 12 },
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
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color={colors.primary}
            />
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

  return (
    <View style={tw`flex-1 bg-background`}>
      <ScrollView
        contentContainerStyle={[
          tw`px-[6%] pb-10`,
          { paddingTop: insets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {header}

        {visible.length === 0 ? (
          <EmptyState
            icon={
              <Ionicons
                name="receipt-outline"
                size={24}
                color={colors.primary}
              />
            }
            title={filter === "all" ? "No orders yet" : `No ${filter} orders`}
            description={
              filter === "all"
                ? "New orders will appear here the moment a customer places one."
                : "Try a different filter to see other orders."
            }
          />
        ) : (
          visible.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              expanded={openId === order.id}
              onToggle={() =>
                setOpenId((current) =>
                  current === order.id ? null : order.id,
                )
              }
              onChangeStatus={(status) => changeStatus(order, status)}
              updating={updatingId === order.id}
            />
          ))
        )}

        {updatingId && (
          <View style={tw`flex-row items-center justify-center gap-2 pt-2`}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={tw`text-xs text-textMuted`}>
              Updating order status…
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
