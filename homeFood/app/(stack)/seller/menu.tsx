import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useCreateFoodMutation,
  useDeleteFoodMutation,
  useGetMyFoodsQuery,
  useUpdateFoodMutation,
  type FoodAvailability,
  type FoodPayload,
} from "@/src/api/foods";
import { useGetMyShopQuery } from "@/src/api/shops";
import {
  AvailabilityPill,
  EmptyState,
  Input,
  PillButton,
  Skeleton,
} from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import { formatPrice } from "@/src/lib/browse";
import tw from "@/src/lib/tailwind";
import type { Food } from "@/src/types/food";

const CATEGORIES = [
  "Biryani",
  "Curry",
  "Roast",
  "Fried Rice",
  "Veg",
  "Desserts",
  "Snacks",
  "Drinks",
];

const PER_UNIT_OPTIONS = ["serving", "plate", "kg", "piece", "packet"];

const AVAILABILITY_OPTIONS: {
  value: FoodAvailability;
  label: string;
}[] = [
  { value: "available", label: "Available" },
  { value: "low", label: "Low stock" },
  { value: "sold_out", label: "Sold out" },
];

interface FormState {
  name: string;
  category: string;
  perUnit: string;
  price: string;
  prepTime: string;
  maxOrdersPerDay: string;
  availability: FoodAvailability;
  description: string;
  imageUrl: string;
}

const blankForm: FormState = {
  name: "",
  category: CATEGORIES[0],
  perUnit: "serving",
  price: "",
  prepTime: "30",
  maxOrdersPerDay: "10",
  availability: "available",
  description: "",
  imageUrl: "",
};

function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={tw`flex-row flex-wrap gap-2`}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option.value }}
          style={[
            tw`rounded-full border px-3 py-1.5`,
            value === option.value
              ? tw`border-primary bg-primary`
              : tw`border-borderStrong bg-card`,
          ]}
        >
          <Text
            style={tw`text-sm font-medium ${
              value === option.value ? "text-white" : "text-textMuted"
            }`}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function SectionLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <View style={tw`mb-1.5`}>
      <Text style={tw`text-sm font-medium text-text`}>{children}</Text>
      {hint ? <Text style={tw`text-xs text-textMuted`}>{hint}</Text> : null}
    </View>
  );
}

function DishRow({
  food,
  confirming,
  deleting,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  food: Food;
  confirming: boolean;
  deleting: boolean;
  onEdit: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <View
      style={tw`mb-3 rounded-2xl border border-border bg-card p-4 shadow-sm`}
    >
      <View style={tw`flex-row items-center gap-3`}>
        <View style={tw`h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background`}>
          {food.image ? (
            <Image
              source={{ uri: food.image }}
              style={tw`h-full w-full`}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <View style={tw`h-full w-full items-center justify-center`}>
              <Ionicons name="fast-food-outline" size={22} color={colors.textFaint} />
            </View>
          )}
        </View>

        <View style={tw`min-w-0 flex-1`}>
          <Text numberOfLines={1} style={tw`text-sm font-semibold text-text`}>
            {food.name}
          </Text>
          <Text style={tw`mt-0.5 text-xs text-textMuted`}>
            {food.category} ·{" "}
            <Text style={tw`text-text`}>{formatPrice(food.price)}</Text>/
            {food.perUnit}
          </Text>
          <AvailabilityPill availability={food.availability} style={tw`mt-1`} />
        </View>

        <View style={tw`shrink-0 gap-1.5`}>
          <PillButton
            title="Edit"
            variant="secondary"
            leftIcon={
              <Ionicons name="pencil-outline" size={13} color={colors.text} />
            }
            onPress={onEdit}
            style={tw`px-3 py-1.5`}
            textStyle={tw`text-xs`}
          />
          <PillButton
            title="Delete"
            variant="danger"
            leftIcon={
              <Ionicons name="trash-outline" size={13} color={colors.white} />
            }
            onPress={onAskDelete}
            style={tw`px-3 py-1.5`}
            textStyle={tw`text-xs`}
          />
        </View>
      </View>

      {confirming ? (
        <View
          style={tw`mt-3 flex-row flex-wrap items-center justify-between gap-2 rounded-xl bg-red-bg px-3 py-2.5`}
        >
          <Text style={tw`flex-1 text-sm font-medium text-red-text`}>
            Remove “{food.name}” from your menu?
          </Text>
          <View style={tw`flex-row gap-2`}>
            <PillButton
              title="Yes, remove"
              variant="danger"
              loading={deleting}
              disabled={deleting}
              onPress={onConfirmDelete}
              style={tw`px-4 py-1.5`}
              textStyle={tw`text-xs`}
            />
            <PillButton
              title="Keep"
              variant="secondary"
              disabled={deleting}
              onPress={onCancelDelete}
              style={tw`px-4 py-1.5`}
              textStyle={tw`text-xs`}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function SellerMenuScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const { data: shop } = useGetMyShopQuery();
  const {
    data: foods = [],
    isLoading,
    isError,
    refetch,
  } = useGetMyFoodsQuery();
  const [createFood, { isLoading: creating }] = useCreateFoodMutation();
  const [updateFood, { isLoading: updating }] = useUpdateFoodMutation();
  const [deleteFood, { isLoading: deleting }] = useDeleteFoodMutation();

  const [form, setForm] = useState<FormState>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const saving = creating || updating;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const scrollToForm = () =>
    scrollRef.current?.scrollTo({ y: 0, animated: true });

  const beginEdit = (food: Food) => {
    setForm({
      name: food.name,
      category: food.category,
      perUnit: food.perUnit,
      price: String(food.price),
      prepTime: String(food.prepTime || 30),
      maxOrdersPerDay: String(food.maxOrdersPerDay || 10),
      availability:
        food.availability === "soldOut"
          ? "sold_out"
          : food.availability === "low"
            ? "low"
            : "available",
      description: food.description,
      imageUrl: food.image,
    });
    setEditingId(food.id);
    setError("");
    scrollToForm();
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
    setError("");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Allow photo access to add a picture to your dish.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.35,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;

    set(
      "imageUrl",
      asset.base64
        ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
        : asset.uri,
    );
  };

  const save = async () => {
    const price = Number(form.price);
    const prepTime = Number(form.prepTime);
    const maxOrdersPerDay = Number(form.maxOrdersPerDay);

    if (!form.name.trim()) {
      setError("Please give your dish a name.");
      return;
    }
    if (!price || price <= 0) {
      setError("Please set a price above 0.");
      return;
    }
    if (!form.description.trim()) {
      setError("Please add a short description of the dish.");
      return;
    }
    if (!prepTime || prepTime < 5) {
      setError("Prep time should be at least 5 minutes.");
      return;
    }
    if (!maxOrdersPerDay || maxOrdersPerDay < 1) {
      setError("Max orders per day should be at least 1.");
      return;
    }
    if (!shop?.area) {
      setError("Set up your kitchen profile before adding dishes.");
      return;
    }

    const payload: FoodPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
      perUnit: form.perUnit,
      prepTime,
      maxOrdersPerDay,
      availability: form.availability,
      imageUrl: form.imageUrl,
      area: shop.area,
    };

    try {
      setError("");
      if (editingId) {
        await updateFood({ id: editingId, body: payload }).unwrap();
      } else {
        await createFood(payload).unwrap();
      }
      resetForm();
    } catch (err: any) {
      setError(
        err?.data?.message ?? "Couldn't save the dish. Please try again.",
      );
    }
  };

  const confirmDelete = async (food: Food) => {
    try {
      await deleteFood(food.id).unwrap();
      if (editingId === food.id) resetForm();
      setConfirmDeleteId(null);
    } catch (err: any) {
      Alert.alert(
        "Couldn't delete dish",
        err?.data?.message ?? "Please try again in a moment.",
      );
    }
  };

  const editing = useMemo(
    () => (editingId ? foods.find((food) => food.id === editingId) : null),
    [editingId, foods],
  );

  return (
    <View style={tw`flex-1 bg-background`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            tw`px-[6%] pb-10`,
            { paddingTop: insets.top + 12 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                My menu
              </Text>
              <Text style={tw`text-sm text-textMuted`}>
                Add dishes, set prices and availability. Customers order
                straight from these.
              </Text>
            </View>
          </View>

          <View
            style={tw`mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm`}
          >
            <Text style={tw`font-display text-lg font-semibold text-text`}>
              {editing ? "Edit dish" : "Add a new dish"}
            </Text>

            <View style={tw`mt-4`}>
              <SectionLabel hint="A clear photo makes dishes irresistible.">
                Photo
              </SectionLabel>
              <Pressable
                onPress={pickImage}
                accessibilityRole="button"
                style={tw`flex-row items-center gap-3 rounded-xl border border-dashed border-borderStrong p-3`}
              >
                <View style={tw`h-16 w-16 overflow-hidden rounded-lg bg-background`}>
                  {form.imageUrl ? (
                    <Image
                      source={{ uri: form.imageUrl }}
                      style={tw`h-full w-full`}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={tw`h-full w-full items-center justify-center`}>
                      <Ionicons
                        name="image-outline"
                        size={22}
                        color={colors.textFaint}
                      />
                    </View>
                  )}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-medium text-text`}>
                    {form.imageUrl ? "Change photo" : "Upload photo"}
                  </Text>
                  <Text style={tw`text-xs text-textMuted`}>
                    PNG or JPG, from your phone or computer
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textFaint}
                />
              </Pressable>
            </View>

            <View style={tw`mt-4`}>
              <Input
                label="Dish name"
                required
                placeholder="e.g. Special Chicken Biryani"
                value={form.name}
                onChangeText={(value) => set("name", value)}
              />
            </View>

            <View style={tw`mt-4`}>
              <SectionLabel>Category</SectionLabel>
              <ChoiceRow
                options={CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
                value={form.category}
                onChange={(value) => set("category", value)}
              />
            </View>

            <View style={tw`mt-4`}>
              <SectionLabel>Per unit</SectionLabel>
              <ChoiceRow
                options={PER_UNIT_OPTIONS.map((unit) => ({
                  value: unit,
                  label: unit,
                }))}
                value={form.perUnit}
                onChange={(value) => set("perUnit", value)}
              />
            </View>

            <View style={tw`mt-4 flex-row gap-3`}>
              <Input
                containerStyle={tw`flex-1`}
                label="Price (৳)"
                required
                hint="Your price per unit."
                keyboardType="numeric"
                placeholder="e.g. 250"
                value={form.price}
                onChangeText={(value) => set("price", value)}
              />
              <Input
                containerStyle={tw`flex-1`}
                label="Prep time"
                hint="Estimate for customers."
                keyboardType="numeric"
                placeholder="e.g. 35"
                value={form.prepTime}
                onChangeText={(value) => set("prepTime", value)}
              />
            </View>

            <View style={tw`mt-4`}>
              <Input
                label="Max orders per day"
                hint="Only take what you can comfortably cook."
                keyboardType="numeric"
                placeholder="e.g. 10"
                value={form.maxOrdersPerDay}
                onChangeText={(value) => set("maxOrdersPerDay", value)}
              />
            </View>

            <View style={tw`mt-4`}>
              <SectionLabel hint="Let customers know if you can cook this today.">
                Availability
              </SectionLabel>
              <ChoiceRow
                options={AVAILABILITY_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={form.availability}
                onChange={(value) =>
                  set("availability", value as FoodAvailability)
                }
              />
            </View>

            <View style={tw`mt-4`}>
              <Input
                label="Description"
                required
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="What makes it special? Ingredients, spice level…"
                value={form.description}
                onChangeText={(value) => set("description", value)}
                style={tw`min-h-20`}
              />
            </View>

            {error ? (
              <Text
                style={tw`mt-4 rounded-xl bg-red-bg px-3 py-2 text-sm font-medium text-red-text`}
              >
                {error}
              </Text>
            ) : null}

            <View style={tw`mt-4 flex-row flex-wrap gap-2`}>
              <PillButton
                title={editing ? "Save changes" : "Add to menu"}
                loading={saving}
                disabled={saving}
                onPress={save}
              />
              {editing ? (
                <PillButton
                  title="Cancel"
                  variant="secondary"
                  disabled={saving}
                  onPress={resetForm}
                />
              ) : null}
            </View>
          </View>

          <View style={tw`mt-3 flex-row items-start gap-2`}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={colors.primary}
              style={tw`mt-0.5`}
            />
            <Text style={tw`flex-1 text-xs text-textMuted`}>
              Tip: start with 3–4 best dishes. Focus on what you cook best,
              then grow your menu.
            </Text>
          </View>

          <View style={tw`mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm`}>
            <View style={tw`mb-4 flex-row items-center justify-between gap-3`}>
              <Text style={tw`font-display text-lg font-semibold text-text`}>
                Dish list
              </Text>
              <View style={tw`rounded-full bg-background px-3 py-1`}>
                <Text style={tw`text-sm font-medium text-textMuted`}>
                  {foods.length} {foods.length === 1 ? "dish" : "dishes"}
                </Text>
              </View>
            </View>

            <View style={tw`mt-3`}>
              {isLoading ? (
                <View style={tw`gap-3`} aria-hidden>
                  {[0, 1, 2].map((key) => (
                    <Skeleton key={key} height={100} style={tw`rounded-2xl`} />
                  ))}
                </View>
              ) : isError ? (
                <EmptyState
                  icon={
                    <Ionicons
                      name="alert-circle-outline"
                      size={24}
                      color={colors.primary}
                    />
                  }
                  title="Couldn't load your menu"
                  description="Something went wrong while fetching your dishes."
                  action={
                    <PillButton
                      title="Retry"
                      variant="primary"
                      onPress={() => refetch()}
                    />
                  }
                />
              ) : foods.length === 0 ? (
                <EmptyState
                  icon={
                    <Ionicons
                      name="fast-food-outline"
                      size={24}
                      color={colors.primary}
                    />
                  }
                  title="Your menu is empty"
                  description="Add your first dish to start receiving orders."
                />
              ) : (
                foods.map((food) => (
                  <DishRow
                    key={food.id}
                    food={food}
                    confirming={confirmDeleteId === food.id}
                    deleting={deleting}
                    onEdit={() => beginEdit(food)}
                    onAskDelete={() => setConfirmDeleteId(food.id)}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                    onConfirmDelete={() => confirmDelete(food)}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
