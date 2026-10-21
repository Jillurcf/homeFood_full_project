import { Card, EmptyState, PillButton, VerifiedBadge } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import { useCart } from "@/src/store/cartStore";
import { useGetFoodsQuery } from "@/src/api/foods";
import tw from "@/src/lib/tailwind";
import { useAppSelector } from "@/src/store/hooks";
import { api } from "@/src/api/clients";
import type { Food } from "@/src/types/food";

export default function CartScreen() {
  const router = useRouter();
  const { items, totalItems, setQty, remove, clear } = useCart();
  const {
    data: foods = [],
    isLoading,
    isError,
    refetch,
  } = useGetFoodsQuery({ limit: 50 });
  const token = useAppSelector((s) => s.auth.token);

  const foodsById = useMemo(() => {
    const map = new Map<string, Food>();
    foods.forEach((food) => map.set(food.id, food));
    return map;
  }, [foods]);

  const cartLines = useMemo(() => {
    return items.flatMap((item) => {
      const food = foodsById.get(item.foodId);
      if (!food) return [];
      const soldOut = food.availability === "soldOut";
      const lineTotal = food.price * item.qty;
      return [{ item, food, soldOut, lineTotal }];
    });
  }, [items, foodsById]);

  const subtotal = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.lineTotal, 0),
    [cartLines]
  );

  const hasSoldOut = cartLines.some((l) => l.soldOut);
  const canPlaceOrder = totalItems > 0 && !hasSoldOut && !!token;

  const handlePlaceOrder = async () => {
    if (!token) {
      Alert.alert("Sign in required", "Please sign in to place your order.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }
    if (hasSoldOut) {
      Alert.alert("Some items are sold out", "Remove sold out items to continue.");
      return;
    }
    if (cartLines.length === 0) return;

    try {
      const payload = {
        items: cartLines.map((line) => ({
          foodId: line.food.id,
          qty: line.item.qty,
          price: line.food.price,
        })),
        deliveryAddress: {
          label: "Home",
          addressLine: "TBA",
          area: cartLines[0].food.area || "",
        },
        paymentMethod: "cod",
      };
      // restaurantId not strictly needed if backend derives from food; but current backend requires it
      // include a placeholder to be compatible
      const restaurantId =
        cartLines[0].food.seller.replace(/\s+/g, "-").toLowerCase() ||
        "homefood";
      const body = {
        restaurantId,
        ...payload,
        items: cartLines.map((line) => ({
          foodId: line.food.id,
          qty: line.item.qty,
          price: line.food.price,
          name: line.food.name,
        })),
        totalAmount: subtotal,
      };

      await api.post("/orders", body, token);
      clear();
      Alert.alert("Order placed", "Your order has been placed successfully.", [
        { text: "OK", onPress: () => router.push("/(tabs)/orders") },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Failed to place order",
        e?.message || "Something went wrong. Please try again."
      );
    }
  };

  if (totalItems === 0) {
    return (
      <View style={tw`flex-1 justify-center bg-background px-[6%]`}>
        <EmptyState
          icon={<Ionicons name="cart-outline" size={24} color={colors.primary} />}
          title="Your cart is empty"
          description="Add some delicious food to get started"
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
      <ScrollView
        contentContainerStyle={tw`px-[6%] pb-40 pt-4`}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`mb-4 flex-row items-center justify-between`}>
          <Text style={tw`text-lg font-semibold text-text`}>Cart</Text>
          <Pressable onPress={clear}>
            <Text style={tw`text-sm text-primary`}>Clear cart</Text>
          </Pressable>
        </View>

        {isLoading && cartLines.length === 0 ? (
          <Text style={tw`py-8 text-center text-sm text-textMuted`}>
            Loading your cart items...
          </Text>
        ) : null}
        {isError && cartLines.length === 0 ? (
          <View style={tw`items-center gap-2 py-8`}>
            <Text style={tw`text-center text-sm text-textMuted`}>
              Couldn&apos;t load your cart items. Check your connection and try
              again.
            </Text>
            <PillButton
              title="Try again"
              onPress={() => void refetch()}
              variant="secondary"
            />
          </View>
        ) : null}

        {cartLines.map((line) => (
          <Card
            key={line.item.foodId}
            style={tw`mb-3 flex-row items-center gap-3 p-3`}
          >
            <Image
              source={{ uri: line.food.image }}
              style={tw`h-20 w-20 rounded-xl bg-border`}
              contentFit="cover"
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-semibold text-text`} numberOfLines={1}>
                {line.food.name}
              </Text>
              <View style={tw`mt-0.5 flex-row items-center gap-1`}>
                {line.food.sellerVerified ? <VerifiedBadge /> : null}
                <Text style={tw`text-xs text-textMuted`} numberOfLines={1}>
                  {line.food.seller || "Seller"}
                </Text>
              </View>
              <Text style={tw`mt-1 text-sm font-semibold text-primary`}>
                {formatPrice(line.food.price)}
              </Text>
              {line.soldOut ? (
                <Text style={tw`mt-1 text-xs text-red-600`}>Sold out</Text>
              ) : null}
            </View>
            <View style={tw`items-end gap-2`}>
              <Pressable onPress={() => remove(line.item.foodId)}>
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </Pressable>
              <View style={tw`flex-row items-center rounded-full border border-border bg-white`}>
                <Pressable
                  disabled={line.soldOut}
                  onPress={() => setQty(line.item.foodId, line.item.qty - 1)}
                  style={tw`px-2 py-1`}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={tw`min-w-[28px] text-center text-sm text-text`}>
                  {line.item.qty}
                </Text>
                <Pressable
                  disabled={line.soldOut}
                  onPress={() => setQty(line.item.foodId, line.item.qty + 1)}
                  style={tw`px-2 py-1`}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
              <Text style={tw`text-sm font-semibold text-text`}>
                {formatPrice(line.lineTotal)}
              </Text>
            </View>
          </Card>
        ))}

        <Card style={tw`mt-2 p-4`}>
          <Text style={tw`mb-3 text-base font-semibold text-text`}>Order summary</Text>
          <View style={tw`mb-2 flex-row items-center justify-between`}>
            <Text style={tw`text-sm text-textMuted`}>Subtotal</Text>
            <Text style={tw`text-sm text-text`}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={tw`mb-3 flex-row items-center justify-between`}>
            <Text style={tw`text-sm text-textMuted`}>Delivery</Text>
            <Text style={tw`text-sm text-textMuted`}>Calculated at checkout</Text>
          </View>
          <View style={tw`mb-4 flex-row items-center justify-between border-t border-border pt-3`}>
            <Text style={tw`text-base font-semibold text-text`}>Total</Text>
            <Text style={tw`text-base font-semibold text-text`}>{formatPrice(subtotal)}</Text>
          </View>
          <PillButton
            title="Place order"
            onPress={handlePlaceOrder}
            disabled={!canPlaceOrder}
            fullWidth
          />
          {!token ? (
            <Text style={tw`mt-2 text-center text-xs text-textMuted`}>
              Sign in to place order
            </Text>
          ) : hasSoldOut ? (
            <Text style={tw`mt-2 text-center text-xs text-red-600`}>
              Remove sold out items to continue
            </Text>
          ) : null}
        </Card>
      </ScrollView>
    </View>
  );
}
