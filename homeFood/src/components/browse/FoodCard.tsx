import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";
import { formatPrice } from "@/src/lib/browse";
import type { Food } from "@/src/types/food";
import { Stars, VerifiedBadge } from "@/src/components/ui";
import { useCart } from "@/src/store/cartStore";

function AvailabilityBadge({ availability }: { availability: Food["availability"] }) {
  if (availability === "soldOut") return null;

  const low = availability === "low";

  return (
    <View
      style={tw`absolute bottom-2 left-2 z-[2] flex-row items-center gap-1 rounded-full bg-white/95 px-2 py-0.5`}
    >
      <View
        style={tw`h-1.5 w-1.5 rounded-full ${low ? "bg-amber-500" : "bg-emerald-500"}`}
      />
      <Text
        style={tw`text-[10px] font-semibold ${low ? "text-amber-700" : "text-emerald-700"}`}
      >
        {low ? "Only a few left" : "Available"}
      </Text>
    </View>
  );
}

function AddButton({ food }: { food: Food }) {
  const soldOut = food.availability === "soldOut";
  const { add } = useCart();

  return (
    <TouchableOpacity
      disabled={soldOut}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        soldOut ? `${food.name} is sold out` : `Add ${food.name} to cart`
      }
      onPress={() => {
        if (soldOut) return;
        add(food.id);
      }}
      style={[
        tw`flex-row shrink-0 items-center justify-center gap-1 rounded-full px-2.5 py-1.5`,
        soldOut ? tw`bg-text/10` : tw`bg-primary`,
        soldOut && tw`opacity-60`,
      ]}
    >
      {!soldOut && (
        <Ionicons name="add" size={14} color={colors.white} />
      )}
      <Text style={tw`text-xs font-semibold ${soldOut ? "text-textFaint" : "text-white"}`}>
        {soldOut ? "Sold out" : "Add"}
      </Text>
    </TouchableOpacity>
  );
}

interface FoodCardProps {
  food: Food;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function FoodCard({ food, isFavorite, onToggleFavorite }: FoodCardProps) {
  const router = useRouter();
  const soldOut = food.availability === "soldOut";

  const openDetail = () =>
    router.push({
      pathname: "/(stack)/food/[id]" as never,
      params: { id: food.id },
    });

  return (
    <View
      style={tw`relative flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm`}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openDetail}
        accessibilityRole="button"
        accessibilityLabel={food.name}
        style={tw`relative aspect-[4/3] overflow-hidden bg-background ${soldOut ? "opacity-80" : ""}`}
      >
        <Image
          source={{ uri: food.image }}
          contentFit="cover"
          transition={250}
          style={tw`h-full w-full`}
        />

        {soldOut && (
          <View
            style={tw`absolute inset-0 z-10 items-center justify-center bg-ink/40`}
          >
            <View style={tw`rounded-full bg-white px-3 py-1`}>
              <Text style={tw`text-xs font-bold text-ink`}>Sold out</Text>
            </View>
          </View>
        )}

        <View
          style={tw`absolute left-2 top-2 z-[2] rounded-full bg-white/95 px-2 py-0.5`}
        >
          <Text style={tw`text-[10px] font-semibold uppercase tracking-wide text-ink`}>
            {food.category}
          </Text>
        </View>

        <AvailabilityBadge availability={food.availability} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onToggleFavorite(food.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        accessibilityLabel={
          isFavorite
            ? `Remove ${food.name} from favourites`
            : `Save ${food.name} to favourites`
        }
        style={tw`absolute right-2 top-2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm`}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={16}
          color={isFavorite ? "#EF4444" : "rgba(58,46,42,0.60)"}
        />
      </TouchableOpacity>

      <View style={tw`flex-1 gap-1.5 p-3`}>
        <TouchableOpacity activeOpacity={0.7} onPress={openDetail}>
          <Text numberOfLines={1} style={tw`text-[15px] font-semibold text-text`}>
            {food.name}
          </Text>
        </TouchableOpacity>

        <View style={tw`flex-row items-center gap-1`}>
          <Text numberOfLines={1} style={tw`text-xs text-textMuted`}>
            {food.seller}
          </Text>
          {food.sellerVerified && <VerifiedBadge size={14} />}
        </View>

        <Stars rating={food.rating} count={food.reviewCount} size={12} />

        {food.tags.length > 0 && (
          <View style={tw`flex-row flex-wrap gap-1`}>
            {food.tags.slice(0, 2).map((tag) => (
              <View
                key={tag}
                style={tw`rounded-full bg-background px-2 py-0.5`}
              >
                <Text style={tw`text-[10px] font-medium text-textMuted`}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={tw`mt-auto flex-row items-center justify-between gap-2 border-t border-border pt-2.5`}
        >
          <Text style={tw`text-base font-bold text-text`}>
            {formatPrice(food.price)}
          </Text>
          <AddButton food={food} />
        </View>
      </View>
    </View>
  );
}
