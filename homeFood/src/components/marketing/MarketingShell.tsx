import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

interface MarketingShellProps {
  title: string;
  subtitle?: string;
  bengaliOverline?: string;
  overline?: string;
  children: React.ReactNode;
}

function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)/profile");
  }
}

export function MarketingShell({
  title,
  subtitle,
  bengaliOverline,
  overline,
  children,
}: MarketingShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={tw`flex-1 bg-background`}
      contentContainerStyle={[
        tw`px-[6%] pb-12`,
        { paddingTop: insets.top + 12 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={tw`h-9 w-9 items-center justify-center rounded-full bg-card`}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text} />
      </Pressable>

      {(bengaliOverline || overline) && (
        <Text
          style={tw`mt-5 text-xs font-semibold uppercase tracking-wide text-primaryDark ${
            bengaliOverline ? "font-bengali" : ""
          }`}
        >
          {bengaliOverline ?? overline}
        </Text>
      )}
      <Text style={tw`mt-2 font-display text-3xl font-semibold text-text`}>
        {title}
      </Text>
      {subtitle && (
        <Text style={tw`mt-2 text-sm leading-6 text-textMuted`}>
          {subtitle}
        </Text>
      )}

      <View style={tw`mt-6 gap-4`}>{children}</View>
    </ScrollView>
  );
}
