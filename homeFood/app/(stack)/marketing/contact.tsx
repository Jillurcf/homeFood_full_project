import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { MarketingShell } from "@/src/components/marketing/MarketingShell";
import { Chip, Input, PillButton } from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { saveContactSubmission } from "@/src/lib/contactSubmissions";
import tw from "@/src/lib/tailwind";

const TOPICS = [
  "Order issue",
  "Delivery & payment",
  "Becoming a home chef",
  "Account & verification",
  "Feedback & suggestions",
  "Something else",
];

const CONTACT_INFO = [
  {
    icon: "mail-outline" as const,
    label: "Email",
    value: "care@homefood.app",
    note: "For detailed questions and documents",
  },
  {
    icon: "call-outline" as const,
    label: "Phone & WhatsApp",
    value: "+880 1700-000000",
    note: "Replies within business hours",
  },
  {
    icon: "location-outline" as const,
    label: "Head office",
    value: "House 12, Road 5, Dhanmondi, Dhaka 1205",
    note: "Visits by appointment",
  },
  {
    icon: "time-outline" as const,
    label: "Support hours",
    value: "Sat–Fri, 9:00 AM – 10:00 PM",
    note: "We reply to every message",
  },
];

export default function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ name: string; topic: string } | null>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setMobile("");
    setTopic(TOPICS[0]);
    setMessage("");
    setError(null);
    setSent(null);
  };

  const validate = () => {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim() || !email.includes("@"))
      return "Please enter a valid email address.";
    if (mobile.trim() && !/^\d{6,15}$/.test(mobile.trim()))
      return "Please enter a valid mobile number.";
    if (message.trim().length < 10)
      return "Please describe your message (at least 10 characters).";
    return null;
  };

  const onSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await saveContactSubmission({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        topic,
        message: message.trim(),
      });
      setSent({ name: name.trim(), topic });
    } catch {
      setError("We couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    const firstName = sent.name.split(/\s+/)[0] || sent.name;
    return (
      <MarketingShell title="Contact us">
        <View
          style={tw`items-center rounded-2xl border border-border bg-card p-8 shadow-sm`}
        >
          <View
            style={tw`h-14 w-14 items-center justify-center rounded-full bg-emerald-bg`}
          >
            <Ionicons
              name="checkmark-circle"
              size={30}
              color={colors.emerald.text}
            />
          </View>
          <Text
            style={tw`mt-4 text-center font-display text-2xl font-semibold text-text`}
          >
            Message sent!
          </Text>
          <Text style={tw`mt-2 text-center text-sm leading-6 text-textMuted`}>
            Thank you, {firstName}. Our support team has received your message
            about “{sent.topic}” and will reply within one working day.
          </Text>
          <PillButton
            title="Send another message"
            style={tw`mt-6`}
            onPress={reset}
          />
        </View>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell
      bengaliOverline="আমাদের সাথে যোগাযোগ করুন"
      title="Contact us"
      subtitle="Questions, feedback or a problem with an order — drop us a message and our team will get back to you within one working day."
    >
      <View style={tw`gap-2.5`}>
        {CONTACT_INFO.map((item) => (
          <View
            key={item.label}
            style={tw`flex-row items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <View
              style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
            >
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-semibold uppercase tracking-wide text-textMuted`}>
                {item.label}
              </Text>
              <Text style={tw`mt-0.5 text-sm font-semibold text-text`}>
                {item.value}
              </Text>
              <Text style={tw`mt-0.5 text-xs text-textMuted`}>{item.note}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={tw`overflow-hidden rounded-2xl bg-ink p-5`}>
        <View
          style={tw`absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/5`}
        />
        <Text style={tw`font-bengali text-lg font-semibold text-white`}>
          ঘরের স্বাদ, ঘরে ঘরে
        </Text>
        <Text style={tw`mt-2 text-sm leading-6 text-white/85`}>
          The taste of home, delivered with trust. We read every message and
          answer in Bengali or English — whichever you prefer.
        </Text>
      </View>

      <View style={tw`rounded-2xl border border-border bg-card p-5 shadow-sm`}>
        <View style={tw`flex-row items-center gap-2`}>
          <View
            style={tw`h-9 w-9 items-center justify-center rounded-lg bg-primary/10`}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={colors.primary}
            />
          </View>
          <Text style={tw`font-display text-lg font-semibold text-text`}>
            Send us a message
          </Text>
        </View>

        {error && (
          <View style={tw`mt-4 rounded-xl bg-red-bg px-3.5 py-2.5`}>
            <Text style={tw`text-xs font-medium text-red-text`}>{error}</Text>
          </View>
        )}

        <View style={tw`mt-4 gap-4`}>
          <Input
            label="Name"
            required
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Input
            label="Email"
            required
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Input
            label="Mobile"
            placeholder="01XXXXXXXXX"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            returnKeyType="next"
          />

          <View>
            <Text style={tw`mb-1.5 text-sm font-medium text-text`}>Topic</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {TOPICS.map((item) => (
                <Chip
                  key={item}
                  active={topic === item}
                  onPress={() => setTopic(item)}
                >
                  {item}
                </Chip>
              ))}
            </View>
          </View>

          <Input
            label="Message"
            required
            placeholder="Tell us what happened or what you need…"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={tw`min-h-28`}
          />

          <PillButton
            title={submitting ? "Sending…" : "Send message"}
            fullWidth
            loading={submitting}
            disabled={submitting}
            onPress={onSubmit}
            leftIcon={
              !submitting ? (
                <Ionicons name="send" size={15} color={colors.white} />
              ) : undefined
            }
          />
        </View>
      </View>
    </MarketingShell>
  );
}
