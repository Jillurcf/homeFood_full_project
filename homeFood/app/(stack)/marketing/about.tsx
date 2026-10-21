import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { MarketingShell } from "@/src/components/marketing/MarketingShell";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

const MISSION_CARDS = [
  {
    icon: "heart-outline" as const,
    title: "Our Mission",
    body: "Our mission is to support women's economic independence by helping them turn their cooking talent into a sustainable source of income. We believe that technology can break barriers and open doors for women who want to build their own small businesses from home.",
  },
  {
    icon: "sparkles-outline" as const,
    title: "Women Empowerment",
    body: "Through this platform, women can easily list their homemade food, reach customers in their local communities, and manage their orders efficiently. By promoting homemade food businesses, we aim to strengthen women's confidence, financial stability, and social recognition.",
  },
];

const VISION_GOALS = [
  "Empower 10,000+ women entrepreneurs",
  "Serve every neighbourhood in Bangladesh",
  "Set the standard for homemade food safety",
  "Build a community built on trust and taste",
];

export default function AboutScreen() {
  return (
    <MarketingShell
      overline="About HomeFood"
      title="The taste of home, delivered with trust."
    >
      <Text style={tw`text-sm leading-6 text-textMuted`}>
        Our platform was created with a clear mission: to empower women by
        providing them with opportunities to showcase their cooking skills and
        generate income from home. Many talented women prepare delicious
        homemade food but lack a digital platform to reach customers. Our system
        connects these women directly with buyers, creating a supportive
        community that values homemade quality and entrepreneurship.
      </Text>

      <View style={tw`gap-3`}>
        {MISSION_CARDS.map((card) => (
          <View
            key={card.title}
            style={tw`rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <View style={tw`flex-row items-center gap-2`}>
              <View
                style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
              >
                <Ionicons name={card.icon} size={18} color={colors.primary} />
              </View>
              <Text style={tw`font-display text-lg font-semibold text-text`}>
                {card.title}
              </Text>
            </View>
            <Text style={tw`mt-3 text-sm leading-6 text-textMuted`}>
              {card.body}
            </Text>
          </View>
        ))}
      </View>

      <View style={tw`overflow-hidden rounded-2xl bg-ink p-5`}>
        <View
          style={tw`absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/5`}
        />
        <Text style={tw`font-display text-xl font-semibold text-white`}>
          Our Founder
        </Text>
        <Text style={tw`mt-3 text-sm leading-6 text-white/85`}>
          The platform was founded by a passionate software developer who
          combines strong technical expertise with solid administrative
          knowledge. With experience in modern web technologies and system
          management, the founder designed this platform to be simple, reliable,
          and accessible for women entrepreneurs. The vision is to use
          technology as a bridge that connects talented home chefs with people
          who appreciate authentic homemade food.
        </Text>
      </View>

      <View>
        <Text style={tw`text-xs font-semibold uppercase tracking-wide text-primaryDark`}>
          Looking ahead
        </Text>
        <Text style={tw`mt-1.5 font-display text-2xl font-semibold text-text`}>
          Our Vision
        </Text>
        <Text style={tw`mt-2 text-sm leading-6 text-textMuted`}>
          We envision a future where every skilled woman has the opportunity to
          become financially independent through her talent. By building a
          trusted digital marketplace for homemade food, we aim to support local
          communities, encourage entrepreneurship, and celebrate the value of
          homemade meals.
        </Text>
      </View>

      <View style={tw`gap-3`}>
        {VISION_GOALS.map((goal) => (
          <View
            key={goal}
            style={tw`flex-row items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <View
              style={tw`h-7 w-7 items-center justify-center rounded-full bg-emerald-bg`}
            >
              <Ionicons name="checkmark" size={15} color={colors.emerald.text} />
            </View>
            <Text style={tw`flex-1 text-sm font-medium leading-5 text-text`}>
              {goal}
            </Text>
          </View>
        ))}
      </View>
    </MarketingShell>
  );
}
