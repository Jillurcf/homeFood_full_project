import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EmptyState, PillButton } from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";
import { useCart } from "@/src/store/cartStore";
import { toggleFavorite } from "@/src/store/favoritesSlice";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";

type FoodDetailsItem = {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  image?: string | number | { uri?: string };
  price?: number | string;
  quantity?: string | number;
  perUnit?: string;
  mobileNo?: string;
  availability?: string;
};

function parseItem(data: string | string[] | undefined): FoodDetailsItem | null {
  const raw = Array.isArray(data) ? data[0] : data;
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as FoodDetailsItem;
  } catch {
    return null;
  }
}

export default function FoodDetails() {
  const { data } = useLocalSearchParams<{ data?: string | string[] }>();
  const item = useMemo(() => parseItem(data), [data]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { add } = useCart();
  const favoriteIds = useAppSelector((state) => state.favorites.ids);

  if (!item) {
    return (
      <View style={tw`flex-1 justify-center bg-background px-[6%]`}>
        <EmptyState
          icon={
            <Ionicons
              name="restaurant-outline"
              size={24}
              color={colors.primary}
            />
          }
          title="Dish details unavailable"
          description="This dish could not be opened. Browse the menu and try again."
          action={
            <PillButton
              title="Browse dishes"
              onPress={() => router.replace("/(tabs)")}
              variant="primary"
            />
          }
        />
      </View>
    );
  }

  const itemId = item.id ?? item._id;
  const title = item.name ?? item.title ?? "Dish";
  const soldOut =
    item.availability === "soldOut" || item.availability === "sold_out";
  const isFavorite = itemId ? favoriteIds.includes(itemId) : false;
  const imageSource =
    typeof item.image === "string"
      ? { uri: item.image }
      : item.image;
  const price =
    typeof item.price === "number" && Number.isFinite(item.price)
      ? formatPrice(item.price)
      : item.price ?? "Price unavailable";
  const quantity = item.perUnit ?? item.quantity;

  const addToCart = () => {
    if (!itemId || soldOut) return;
    add(itemId);
  };

  const orderNow = () => {
    if (!itemId || soldOut) return;
    add(itemId);
    router.push("/(tabs)/cart");
  };

  const copyMobileNumber = async () => {
    if (!item.mobileNo) return;
    await Clipboard.setStringAsync(item.mobileNo);
    Alert.alert("Copied", "Phone number copied to clipboard.");
  };

  return (
    <ScrollView
      style={tw`flex-1 bg-background`}
      contentContainerStyle={tw`px-[5%] pb-10 pt-4`}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back to dishes"
        hitSlop={8}
        style={tw`mb-4 flex-row items-center gap-1 self-start py-2`}
      >
        <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
        <Text style={tw`text-sm font-semibold text-textMuted`}>
          Back to dishes
        </Text>
      </TouchableOpacity>

      {imageSource ? (
        <Image
          source={imageSource}
          contentFit="cover"
          transition={250}
          style={styles.heroImage}
        />
      ) : (
        <View
          style={[styles.heroImage, tw`items-center justify-center`]}
        >
          <Ionicons name="image-outline" size={32} color={colors.textFaint} />
        </View>
      )}

      <View style={tw`mt-3 flex-row items-center justify-between gap-3`}>
        <Text style={tw`flex-1 text-2xl font-bold text-primary`}>
          {title}
        </Text>
        {itemId ? (
          <TouchableOpacity
            onPress={() => dispatch(toggleFavorite(itemId))}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite }}
            accessibilityLabel={
              isFavorite ? "Remove from favourites" : "Save to favourites"
            }
            hitSlop={8}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#EF4444" : colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={tw`mt-4 gap-2 rounded-2xl border border-border bg-card p-4`}>
        <Text style={tw`text-base font-semibold text-text`}>
          Price: {price}
        </Text>
        {quantity != null ? (
          <Text style={tw`text-sm text-textMuted`}>Quantity: {quantity}</Text>
        ) : null}
        {item.mobileNo ? (
          <TouchableOpacity
            onPress={() => void copyMobileNumber()}
            accessibilityRole="button"
            accessibilityLabel="Copy seller phone number"
          >
            <Text style={tw`text-sm text-primary`}>
              Mobile no: {item.mobileNo} · Tap to copy
            </Text>
          </TouchableOpacity>
        ) : null}
        {soldOut ? (
          <Text style={tw`text-sm font-semibold text-red-600`}>
            Sold out for today
          </Text>
        ) : null}
      </View>

      <View style={tw`mt-4 gap-3`}>
        <PillButton
          title="Add to cart"
          onPress={addToCart}
          disabled={!itemId || soldOut}
          fullWidth
          variant="primary"
        />
        <PillButton
          title="Order now"
          onPress={orderNow}
          disabled={!itemId || soldOut}
          fullWidth
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
});
