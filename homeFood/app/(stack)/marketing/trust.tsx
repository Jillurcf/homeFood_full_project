import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { MarketingShell } from "@/src/components/marketing/MarketingShell";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

const PILLARS = [
  {
    icon: "shield-checkmark-outline" as const,
    title: "Verified home chefs",
    body: "Every seller passes NID verification, and their kitchen is reviewed before going live.",
  },
  {
    icon: "nutrition-outline" as const,
    title: "Safe food handling",
    body: "Sellers follow hygiene guidelines and clearly list allergens, spice levels and freshness.",
  },
  {
    icon: "wallet-outline" as const,
    title: "Payment flexibility",
    body: "Pay by cash on delivery, bKash or NAGAD. Money only changes hands when your food arrives.",
  },
  {
    icon: "time-outline" as const,
    title: "On-time delivery",
    body: "Clear delivery windows and live order tracking from preparation to your doorstep.",
  },
];

const VERIFICATION_STEPS = [
  {
    title: "NID verification",
    body: "Every chef submits their NID and sparks a secure identity check before their kitchen goes live.",
  },
  {
    title: "Kitchen review",
    body: "A short onboarding review confirms food-handling basics, hygiene and safe packaging.",
  },
  {
    title: "Ongoing ratings",
    body: "Buyers rate every meal. Low-rated kitchens are flagged and removed if standards slip.",
  },
];

const PROTECTIONS = [
  "Pay on delivery, bKash or NAGAD — money only moves when your food arrives",
  "Refunds for missing, late or clearly wrong orders",
  "Direct chat with the chef for custom orders and requests",
  "Your personal details are never shared with third parties",
];

export default function TrustScreen() {
  return (
    <MarketingShell
      bengaliOverline="বিশ্বাসই আমাদের ভিত্তি"
      title="Trust & safety"
      subtitle="Comfort food from a stranger's kitchen should feel safe. So we build trust into every step — for buyers and chefs alike."
    >
      <View>
        <Text style={tw`text-xs font-semibold uppercase tracking-wide text-primaryDark`}>
          How we protect you
        </Text>
        <Text style={tw`mt-1.5 font-display text-2xl font-semibold text-text`}>
          The promise behind every meal
        </Text>
      </View>

      <View style={tw`flex-row flex-wrap gap-3`}>
        {PILLARS.map((pillar) => (
          <View
            key={pillar.title}
            style={tw`w-[48%] gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <View
              style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
            >
              <Ionicons name={pillar.icon} size={18} color={colors.primary} />
            </View>
            <Text style={tw`text-sm font-semibold text-text`}>
              {pillar.title}
            </Text>
            <Text style={tw`text-xs leading-5 text-textMuted`}>
              {pillar.body}
            </Text>
          </View>
        ))}
      </View>

      <View style={tw`rounded-2xl border border-border bg-card p-5 shadow-sm`}>
        <View style={tw`flex-row items-center gap-2`}>
          <View
            style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
          >
            <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
          </View>
          <Text style={tw`flex-1 font-display text-lg font-semibold text-text`}>
            How we verify every chef
          </Text>
        </View>

        <View style={tw`mt-4 gap-4`}>
          {VERIFICATION_STEPS.map((step, index) => (
            <View key={step.title} style={tw`flex-row items-start gap-3`}>
              <View
                style={tw`h-7 w-7 items-center justify-center rounded-full bg-primary/10`}
              >
                <Text style={tw`text-xs font-semibold text-primaryDark`}>
                  {index + 1}
                </Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-semibold text-text`}>
                  {step.title}
                </Text>
                <Text style={tw`mt-0.5 text-xs leading-5 text-textMuted`}>
                  {step.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={tw`overflow-hidden rounded-2xl bg-ink p-5`}>
        <View
          style={tw`absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/5`}
        />
        <Text style={tw`font-display text-lg font-semibold text-white`}>
          Buyer protection
        </Text>
        <View style={tw`mt-3 gap-2.5`}>
          {PROTECTIONS.map((item) => (
            <View key={item} style={tw`flex-row items-start gap-2.5`}>
              <View style={tw`mt-1.5 h-1.5 w-1.5 rounded-full bg-primary`} />
              <Text style={tw`flex-1 text-sm leading-5 text-white/85`}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={tw`overflow-hidden rounded-2xl bg-primary p-5`}>
        <View
          style={tw`absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primaryDark/40`}
        />
        <View
          style={tw`absolute -bottom-12 right-16 h-24 w-24 rounded-full bg-primaryDark/20`}
        />
        <Text style={tw`font-display text-xl font-semibold text-white`}>
          Spot a problem? Tell us.
        </Text>
        <Text style={tw`mt-1.5 text-sm leading-6 text-white/85`}>
          Our team reviews every report and acts within one working day. Your
          identity is always kept confidential.
        </Text>
        <View style={tw`mt-4 flex-row flex-wrap gap-2.5`}>
          <Pressable
            onPress={() => router.push("/(stack)/marketing/contact" as never)}
            accessibilityRole="button"
            style={tw`rounded-full bg-white px-5 py-2.5`}
          >
            <Text style={tw`text-sm font-semibold text-primaryDark`}>
              Report an issue
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(stack)/marketing/help" as never)}
            accessibilityRole="button"
            style={tw`rounded-full border border-white/60 px-5 py-2.5`}
          >
            <Text style={tw`text-sm font-semibold text-white`}>
              Visit Help centre
            </Text>
          </Pressable>
        </View>
      </View>
    </MarketingShell>
  );
}
