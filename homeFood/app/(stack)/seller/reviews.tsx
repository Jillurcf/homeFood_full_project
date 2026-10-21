import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetSellerReviewsQuery,
  useReplyToReviewMutation,
  type SellerReview,
} from "@/src/api/reviews";
import {
  EmptyState,
  PillButton,
  Skeleton,
  Stars,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

type ReviewFilter = "all" | "5" | "4" | "below";

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "all", label: "All reviews" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "below", label: "3 & below" },
];

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "HF"
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function matchesFilter(rating: number, filter: ReviewFilter) {
  if (filter === "all") return true;
  if (filter === "5") return rating >= 5;
  if (filter === "4") return rating === 4;
  return rating <= 3;
}

function ReviewCard({
  review,
  replying,
  replyText,
  sending,
  onStartReply,
  onCancelReply,
  onChangeReply,
  onSendReply,
}: {
  review: SellerReview;
  replying: boolean;
  replyText: string;
  sending: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  onChangeReply: (value: string) => void;
  onSendReply: () => void;
}) {
  return (
    <View
      style={tw`mb-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}
    >
      <View style={tw`flex-row items-start justify-between gap-2`}>
        <View style={tw`min-w-0 flex-1 flex-row items-center gap-3`}>
          <View
            style={tw`h-10 w-10 items-center justify-center rounded-full bg-primary/10`}
          >
            <Text style={tw`text-sm font-semibold text-primaryDark`}>
              {initialsOf(review.authorName)}
            </Text>
          </View>
          <View style={tw`min-w-0 flex-1`}>
            <Text numberOfLines={1} style={tw`text-sm font-semibold text-text`}>
              {review.authorName}
            </Text>
            <Text style={tw`text-xs text-textMuted`}>
              {review.area}
              {review.area ? " · " : ""}
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
        <View style={tw`items-end gap-1`}>
          <View style={tw`flex-row flex-wrap items-center gap-2`}>
            <Stars rating={review.rating} size={12} />
            <View style={tw`rounded-full bg-background px-2.5 py-0.5`}>
              <Text style={tw`text-xs font-medium text-textMuted`}>
                {review.foodName}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={tw`mt-3 text-sm leading-5 text-text/80`}>{review.text}</Text>

      {review.sellerReply && !replying ? (
        <View style={tw`mt-3 rounded-xl bg-background p-3`}>
          <Text style={tw`mb-0.5 text-xs font-semibold text-textMuted`}>
            Your reply
          </Text>
          <Text style={tw`text-sm text-text/80`}>{review.sellerReply}</Text>
        </View>
      ) : null}

      <View style={tw`mt-3`}>
        {replying ? (
          <View>
            <Text style={tw`mb-1.5 text-sm font-medium text-text`}>
              Your reply
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={replyText}
              onChangeText={onChangeReply}
              placeholder="Thank them for the feedback…"
              placeholderTextColor={colors.textFaint}
              cursorColor={colors.primary}
              selectionColor={colors.primary}
              style={tw`min-h-20 rounded-xl border border-borderStrong bg-card px-3.5 py-2.5 text-sm text-text font-body`}
            />
            <View style={tw`mt-2 flex-row flex-wrap gap-2`}>
              <PillButton
                title="Send reply"
                loading={sending}
                disabled={sending || !replyText.trim()}
                onPress={onSendReply}
              />
              <PillButton
                title="Cancel"
                variant="secondary"
                disabled={sending}
                onPress={onCancelReply}
              />
            </View>
          </View>
        ) : (
          <Pressable
            onPress={onStartReply}
            accessibilityRole="button"
            style={tw`flex-row items-center gap-1.5`}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={15}
              color={colors.primaryDark}
            />
            <Text style={tw`text-sm font-semibold text-primaryDark`}>
              {review.sellerReply ? "Edit reply" : "Reply to this review"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function SellerReviewsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const {
    data: reviews = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetSellerReviewsQuery();
  const [replyToReview] = useReplyToReviewMutation();

  const average = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0,
    [reviews],
  );

  const visible = useMemo(
    () => reviews.filter((review) => matchesFilter(review.rating, filter)),
    [reviews, filter],
  );

  const startReply = (review: SellerReview) => {
    setReplyingId(review.id);
    setReplyText(review.sellerReply ?? "");
  };

  const cancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const sendReply = async (review: SellerReview) => {
    const reply = replyText.trim();
    if (!reply) return;

    setSendingId(review.id);
    try {
      await replyToReview({ id: review.id, reply }).unwrap();
      cancelReply();
      Keyboard.dismiss();
    } catch (err: any) {
      Alert.alert(
        "Couldn't send reply",
        err?.data?.message ?? "Please try again in a moment.",
      );
    } finally {
      setSendingId(null);
    }
  };

  const header = (
    <View>
      <View style={tw`flex-row items-center gap-2`}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(stack)/seller/dashboard")
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={tw`h-9 w-9 items-center justify-center rounded-full bg-card`}
        >
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
        <View style={tw`flex-1`}>
          <Text style={tw`font-display text-xl font-semibold text-text`}>
            Customer reviews
          </Text>
          <Text style={tw`text-sm text-textMuted`}>
            Kind replies make customers feel valued and keep your rating high.
          </Text>
        </View>
      </View>

      <View
        style={tw`mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm`}
      >
        <View style={tw`flex-row items-center justify-between gap-3`}>
          <View style={tw`flex-row items-center gap-3`}>
            <Text style={tw`font-display text-4xl font-semibold text-text`}>
              {reviews.length ? average.toFixed(1) : "—"}
            </Text>
            <View>
              <Stars rating={average} size={15} />
              <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                Based on {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`mt-4 flex-row flex-wrap gap-2`}>
          {FILTERS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setFilter(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === option.value }}
              style={[
                tw`rounded-full border px-3 py-1.5`,
                filter === option.value
                  ? tw`border-primary bg-primary`
                  : tw`border-borderStrong bg-card`,
              ]}
            >
              <Text
                style={tw`text-sm font-medium ${
                  filter === option.value ? "text-white" : "text-textMuted"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[
          tw`flex-1 bg-background px-[6%]`,
          { paddingTop: insets.top + 12 },
        ]}
      >
        {header}
        <View style={tw`mt-4 gap-3`} aria-hidden>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} height={150} style={tw`rounded-2xl`} />
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          tw`flex-1 justify-center bg-background px-[6%]`,
          { paddingTop: insets.top },
        ]}
      >
        <EmptyState
          icon={
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color={colors.primary}
            />
          }
          title="Couldn't load reviews"
          description="Something went wrong while fetching your reviews."
          action={
            <PillButton
              title="Retry"
              variant="primary"
              onPress={() => refetch()}
            />
          }
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={tw`flex-1 bg-background`}
      contentContainerStyle={[
        tw`px-[6%] pb-10`,
        { paddingTop: insets.top + 12 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      {header}

      <View style={tw`mt-4`}>
        {visible.length === 0 ? (
          <EmptyState
            icon={
              <Ionicons
                name="star-outline"
                size={24}
                color={colors.primary}
              />
            }
            title="No reviews in this range yet"
            description="Try a different filter to see other reviews."
          />
        ) : (
          visible.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              replying={replyingId === review.id}
              replyText={replyText}
              sending={sendingId === review.id}
              onStartReply={() => startReply(review)}
              onCancelReply={cancelReply}
              onChangeReply={setReplyText}
              onSendReply={() => sendReply(review)}
            />
          ))
        )}
      </View>

      <View
        style={tw`mt-2 flex-row items-start gap-3 rounded-2xl bg-card p-4 shadow-sm`}
      >
        <View
          style={tw`h-10 w-10 items-center justify-center rounded-full bg-primary/10`}
        >
          <Text style={tw`text-sm font-semibold text-primaryDark`}>HF</Text>
        </View>
        <Text style={tw`flex-1 text-sm text-textMuted`}>
          <Text style={tw`font-semibold text-text`}>Why reply? </Text>
          Customers remember sellers who respond warmly — and it encourages
          them to order again.
        </Text>
      </View>
    </ScrollView>
  );
}
