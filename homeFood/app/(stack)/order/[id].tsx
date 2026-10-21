import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  STATUS_META,
  formatOrderDate,
  orderItemCount,
  paymentMethodLabel,
  shortOrderId,
  useGetOrderByIdQuery,
  type Order,
  type OrderStatus,
} from "@/src/api/orders";
import {
  Card,
  EmptyState,
  Skeleton,
  StatusPill,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";

type StepState = "done" | "current" | "todo";

const TIMELINE_STEPS = [
  { label: "Order placed", icon: "receipt-outline" as const },
  { label: "Preparing", icon: "restaurant-outline" as const },
  { label: "Delivered", icon: "checkmark-done-outline" as const },
];

function currentStepIndex(status: OrderStatus): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
    case "PREPARING":
    case "ON_THE_WAY":
      return 1;
    case "DELIVERED":
      return 2;
    default:
      return -1;
  }
}

function stepStates(status: OrderStatus): StepState[] {
  const index = currentStepIndex(status);
  return TIMELINE_STEPS.map((_, i) => {
    if (i < index) return "done";
    if (i === index) return status === "DELIVERED" ? "done" : "current";
    return "todo";
  });
}

function TimelineStep({
  label,
  icon,
  state,
  isLast,
}: {
  label: string;
  icon: string;
  state: StepState;
  isLast: boolean;
}) {
  const dotStyle =
    state === "done"
      ? tw`bg-emerald-bg`
      : state === "current"
        ? tw`bg-primary/10`
        : tw`bg-text/10`;
  const iconColor =
    state === "done"
      ? colors.emerald.text
      : state === "current"
        ? colors.primary
        : colors.textFaint;

  return (
    <View style={tw`flex-row gap-3`}>
      <View style={tw`items-center`}>
        <View style={[tw`h-8 w-8 items-center justify-center rounded-full`, dotStyle]}>
          <Ionicons
            name={state === "done" ? "checkmark" : (icon as never)}
            size={16}
            color={iconColor}
          />
        </View>
        {!isLast && (
          <View
            style={tw`w-0.5 flex-1 ${state === "done" ? "bg-emerald-bg" : "bg-border"}`}
          />
        )}
      </View>
      <View style={tw`flex-1 pb-6`}>
        <Text
          style={tw`text-sm font-semibold ${state === "todo" ? "text-textFaint" : "text-text"}`}
        >
          {label}
        </Text>
        {state === "current" && (
          <Text style={tw`mt-0.5 text-xs text-textMuted`}>In progress</Text>
        )}
      </View>
    </View>
  );
}

function StatusTimeline({ status }: { status: OrderStatus }) {
  const states = stepStates(status);

  return (
    <Card style={tw`mt-4 p-4`}>
      <Text style={tw`mb-4 text-base font-semibold text-text`}>Status timeline</Text>
      {TIMELINE_STEPS.map((step, i) => (
        <TimelineStep
          key={step.label}
          label={step.label}
          icon={step.icon}
          state={states[i]}
          isLast={i === TIMELINE_STEPS.length - 1}
        />
      ))}
    </Card>
  );
}

function AddressCard({ order }: { order: Order }) {
  const address = order.deliveryAddress;
  const parts = [
    address?.label,
    address?.addressLine,
    address?.area,
    address?.city,
  ].filter(Boolean) as string[];

  return (
    <Card style={tw`mt-4 p-4`}>
      <Text style={tw`mb-3 text-base font-semibold text-text`}>
        Delivery address
      </Text>
      {parts.length > 0 || address?.phone ? (
        <View style={tw`flex-row gap-2.5`}>
          <Ionicons
            name="location-outline"
            size={16}
            color={colors.primary}
            style={tw`mt-0.5`}
          />
          <View style={tw`flex-1`}>
            {parts.length > 0 && (
              <Text style={tw`text-sm text-textMuted`}>{parts.join(", ")}</Text>
            )}
            {address?.phone && (
              <Text style={tw`mt-1 text-sm text-textMuted`}>{address.phone}</Text>
            )}
          </View>
        </View>
      ) : (
        <Text style={tw`text-sm text-textMuted`}>No delivery address added</Text>
      )}
    </Card>
  );
}

function ItemsCard({ order }: { order: Order }) {
  return (
    <Card style={tw`mt-4 p-4`}>
      <Text style={tw`mb-3 text-base font-semibold text-text`}>Items</Text>
      {order.items.map((item, index) => (
        <View
          key={`${item.foodId}-${index}`}
          style={tw`flex-row items-start justify-between gap-3 py-2 ${index > 0 ? "border-t border-border" : ""}`}
        >
          <View style={tw`flex-1`}>
            <Text style={tw`text-sm font-semibold text-text`} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={tw`mt-0.5 text-xs text-textMuted`}>
              {formatPrice(item.price)} × {item.quantity}
            </Text>
          </View>
          <Text style={tw`text-sm font-semibold text-text`}>
            {formatPrice(item.price * item.quantity)}
          </Text>
        </View>
      ))}
      <View
        style={tw`mt-2 flex-row items-center justify-between border-t border-border pt-3`}
      >
        <Text style={tw`text-sm text-textMuted`}>Total</Text>
        <Text style={tw`text-base font-semibold text-primary`}>
          {formatPrice(order.totalAmount)}
        </Text>
      </View>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <View style={tw`gap-4`} aria-hidden>
      <Skeleton height={24} width={120} />
      <Skeleton height={100} style={tw`rounded-2xl`} />
      <Skeleton height={180} style={tw`rounded-2xl`} />
      <Skeleton height={120} style={tw`rounded-2xl`} />
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id ?? "", {
    skip: !id,
  });

  if (isLoading) {
    return (
      <View style={[tw`flex-1 bg-background px-[5%]`, { paddingTop: insets.top }]}>
        <DetailSkeleton />
      </View>
    );
  }

  if (isError || !order) {
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
          title="Order not found"
          description="This order may have been removed or you don't have access to it."
          action={
            <EmptyStateAction onBack={() => router.back()} />
          }
        />
      </View>
    );
  }

  const meta = STATUS_META[order.status];
  const itemCount = orderItemCount(order);

  return (
    <View style={tw`flex-1 bg-background`}>
      <ScrollView
        contentContainerStyle={[
          tw`px-[5%] pb-10`,
          { paddingTop: insets.top + 8 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to orders"
          hitSlop={8}
          style={tw`flex-row items-center gap-1 self-start py-2`}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
          <Text style={tw`text-sm font-semibold text-textMuted`}>
            Back to orders
          </Text>
        </TouchableOpacity>

        <Card style={tw`mt-3 p-4`}>
          <View style={tw`flex-row items-center justify-between gap-2`}>
            <Text style={tw`text-base font-semibold text-text`}>
              {shortOrderId(order.id)}
            </Text>
            <StatusPill variant={meta.variant} label={meta.label} />
          </View>
          <Text style={tw`mt-1 text-xs text-textMuted`}>
            {formatOrderDate(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </Text>
          <View
            style={tw`mt-3 flex-row items-center justify-between border-t border-border pt-3`}
          >
            <Text style={tw`text-sm text-textMuted`}>Payment</Text>
            <Text style={tw`text-sm text-text`}>
              {paymentMethodLabel(order.paymentMethod)}
            </Text>
          </View>
        </Card>

        {order.status === "CANCELLED" ? (
          <View
            style={tw`mt-4 flex-row items-center gap-2.5 rounded-2xl bg-red-bg p-4`}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.red.text} />
            <Text style={tw`flex-1 text-sm font-semibold text-red-text`}>
              This order was cancelled
            </Text>
          </View>
        ) : (
          <StatusTimeline status={order.status} />
        )}

        <ItemsCard order={order} />
        <AddressCard order={order} />
      </ScrollView>
    </View>
  );
}

function EmptyStateAction({ onBack }: { onBack: () => void }) {
  return (
    <TouchableOpacity
      onPress={onBack}
      accessibilityRole="button"
      style={tw`items-center rounded-full bg-primary px-5 py-2.5`}
    >
      <Text style={tw`text-sm font-semibold text-white`}>Back to orders</Text>
    </TouchableOpacity>
  );
}
