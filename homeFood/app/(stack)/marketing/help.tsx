import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MarketingShell } from "@/src/components/marketing/MarketingShell";
import { Chip } from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

type TopicId = "buying" | "selling" | "delivery" | "account";

const TOPICS: {
  id: TopicId;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { id: "buying", icon: "basket-outline", label: "Buying food" },
  { id: "selling", icon: "storefront-outline", label: "Selling & setup" },
  { id: "delivery", icon: "bicycle-outline", label: "Delivery & payment" },
  { id: "account", icon: "shield-checkmark-outline", label: "Account & safety" },
];

const FAQS: { id: string; topic: TopicId; question: string; answer: string }[] =
  [
    {
      id: "buy-1",
      topic: "buying",
      question: "How do I place an order?",
      answer:
        "Browse the marketplace, open a dish you like, pick a quantity and tap “Add to cart”. At checkout you choose a delivery time and how you want to pay — cash on delivery, bKash or NAGAD.",
    },
    {
      id: "buy-2",
      topic: "buying",
      question: "Can I request a custom dish?",
      answer:
        "Yes. Select the dish, then use the contact form to message the chef directly about custom orders, family-sized portions or catering. Chefs usually confirm within a few hours.",
    },
    {
      id: "buy-3",
      topic: "buying",
      question: "What if a dish is sold out?",
      answer:
        "Sold-out dishes are clearly marked and can't be added to your cart. Check back later in the day, or try a similar dish from another chef in your area.",
    },
    {
      id: "sell-1",
      topic: "selling",
      question: "How do I become a chef?",
      answer:
        "Tap “Start Selling”, set up your kitchen with your name, area and bio, then add your dishes with photos and prices. Completing NID verification unlocks your shop so buyers can order.",
    },
    {
      id: "sell-2",
      topic: "selling",
      question: "What do I need to start?",
      answer:
        "A valid NID, a mobile number and a few photos of the dishes you want to sell. No cooking certificates or technical skills are required — the app walks you through everything.",
    },
    {
      id: "sell-3",
      topic: "selling",
      question: "How much do I earn?",
      answer:
        "You keep up to 90% of every order. The remainder covers delivery coordination and platform costs. Your earnings are visible in the seller dashboard after each completed order.",
    },
    {
      id: "delivery-1",
      topic: "delivery",
      question: "How long does delivery take?",
      answer:
        "Most meals arrive within 30–50 minutes depending on distance and the chef's cooking time. Every dish shows a delivery window before you order, and you can track progress in your cart.",
    },
    {
      id: "delivery-2",
      topic: "delivery",
      question: "How can I pay for my order?",
      answer:
        "We accept cash on delivery, bKash and NAGAD. You can also pay by wallet or card where available. Money only changes hands once your food is on the way to you.",
    },
    {
      id: "delivery-3",
      topic: "delivery",
      question: "What if my order arrives late or wrong?",
      answer:
        "Contact us within 24 hours and we'll make it right — including a refund or replacement for missing, late or clearly incorrect orders.",
    },
    {
      id: "account-1",
      topic: "account",
      question: "Is my personal information safe?",
      answer:
        "Yes. Your details are encrypted and never shared with third parties. Chefs only receive what they need to prepare and deliver your order.",
    },
    {
      id: "account-2",
      topic: "account",
      question: "How are chefs verified?",
      answer:
        "Every chef passes NID verification and a short kitchen review before going live. Buyers also rate every meal, so standards stay high.",
    },
    {
      id: "account-3",
      topic: "account",
      question: "How do I change my address or details?",
      answer:
        "Open your account settings from the menu and update your address, mobile or payment preferences at any time. Changes apply to your next order.",
    },
  ];

export default function HelpScreen() {
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const visibleFaqs = useMemo(
    () => (topic ? FAQS.filter((faq) => faq.topic === topic) : FAQS),
    [topic],
  );

  return (
    <MarketingShell
      bengaliOverline="কীভাবে আমরা সাহায্য করতে পারি?"
      title="Help centre"
      subtitle="Answers to the most common questions about buying, selling, delivery and your account. Can't find what you need? We're one message away."
    >
      <View style={tw`flex-row flex-wrap gap-3`}>
        {TOPICS.map((item) => {
          const active = topic === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTopic(active ? null : item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={tw`w-[48%] gap-2 rounded-2xl border p-4 shadow-sm ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <View
                style={tw`h-9 w-9 items-center justify-center rounded-lg ${
                  active ? "bg-primary" : "bg-primary/10"
                }`}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active ? colors.white : colors.primary}
                />
              </View>
              <Text style={tw`text-sm font-semibold text-text`}>
                {item.label}
              </Text>
              <Text style={tw`text-xs text-textMuted`}>
                3 common questions
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={tw`flex-row flex-wrap gap-2`}>
        <Chip active={!topic} onPress={() => setTopic(null)}>
          All questions
        </Chip>
        {TOPICS.map((item) => (
          <Chip
            key={item.id}
            active={topic === item.id}
            onPress={() => setTopic(item.id)}
          >
            {item.label}
          </Chip>
        ))}
      </View>

      <View style={tw`gap-2.5`}>
        {visibleFaqs.map((faq) => {
          const open = expanded === faq.id;
          return (
            <View
              key={faq.id}
              style={tw`overflow-hidden rounded-2xl border border-border bg-card shadow-sm`}
            >
              <Pressable
                onPress={() => setExpanded(open ? null : faq.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                style={tw`flex-row items-center gap-3 px-4 py-3.5`}
              >
                <Text style={tw`flex-1 text-sm font-semibold text-text`}>
                  {faq.question}
                </Text>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>
              {open && (
                <Text style={tw`px-4 pb-4 text-sm leading-6 text-textMuted`}>
                  {faq.answer}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={tw`gap-2.5`}>
        {[
          {
            title: "Contact support",
            description:
              "Send us a message and we'll reply within one working day.",
            route: "/(stack)/marketing/contact" as const,
          },
          {
            title: "Trust & safety",
            description:
              "How we verify chefs and protect buyers on every order.",
            route: "/(stack)/marketing/trust" as const,
          },
        ].map((item) => (
          <Pressable
            key={item.title}
            onPress={() => router.push(item.route as never)}
            accessibilityRole="button"
            style={tw`flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-semibold text-text`}>
                {item.title}
              </Text>
              <Text style={tw`mt-0.5 text-xs leading-5 text-textMuted`}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        ))}
      </View>

      <View
        style={tw`flex-row items-start gap-2.5 rounded-2xl bg-amber-bg p-4`}
      >
        <Ionicons
          name="document-text-outline"
          size={16}
          color={colors.amber.text}
        />
        <Text style={tw`flex-1 text-xs leading-5 text-amber-text`}>
          Available in Bengali too — সাত দিনের মধ্যে আমাদের দলকে যেকোনো প্রশ্ন
          জিজ্ঞাসা করুন।
        </Text>
      </View>
    </MarketingShell>
  );
}
