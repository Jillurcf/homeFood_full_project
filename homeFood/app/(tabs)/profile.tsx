import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";
import { useAppSelector } from "@/src/store/hooks";

const SUPPORT_LINKS = [
  { icon: "information-circle-outline" as const, label: "About us", route: "/(stack)/marketing/about" },
  { icon: "help-circle-outline" as const, label: "Help centre", route: "/(stack)/marketing/help" },
  { icon: "shield-checkmark-outline" as const, label: "Trust & safety", route: "/(stack)/marketing/trust" },
  { icon: "mail-outline" as const, label: "Contact us", route: "/(stack)/marketing/contact" },
];

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={tw`flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm`}
    >
      <View
        style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={tw`flex-1 text-sm font-semibold text-text`}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <ScrollView
      style={tw`flex-1 bg-background`}
      contentContainerStyle={[
        tw`px-[6%] pb-12`,
        { paddingTop: insets.top + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={tw`font-display text-2xl font-semibold text-text`}>
        Profile
      </Text>
      <Text style={tw`mt-1 text-sm text-textMuted`}>
        {user ? `${user.name} · ${user.email}` : "Your account and support"}
      </Text>

      <Text
        style={tw`mt-6 text-xs font-semibold uppercase tracking-wide text-textMuted`}
      >
        Selling
      </Text>
      <View style={tw`mt-2`}>
        <MenuRow
          icon="storefront-outline"
          label="My shop"
          onPress={() => router.push("/(stack)/seller/myshop" as never)}
        />
      </View>

      <Text
        style={tw`mt-6 text-xs font-semibold uppercase tracking-wide text-textMuted`}
      >
        Support & info
      </Text>
      <View style={tw`mt-2 gap-2.5`}>
        {SUPPORT_LINKS.map((link) => (
          <MenuRow
            key={link.label}
            icon={link.icon}
            label={link.label}
            onPress={() => router.push(link.route as never)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
