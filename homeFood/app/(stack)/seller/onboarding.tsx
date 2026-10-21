import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetMyShopQuery,
  useSaveShopMutation,
  type KitchenType,
} from "@/src/api/shops";
import { Chip, Input, PillButton } from "@/src/components/ui";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";
import { useAppSelector } from "@/src/store/hooks";
import { useShop } from "@/src/store/shopStore";

const STEP_TITLES = [
  { title: "About you", description: "The person behind the cooking" },
  { title: "Your kitchen", description: "The business customers will see" },
  { title: "Review & go live", description: "One last look before you start" },
];

const AREA_OPTIONS = [
  "Uttara",
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Mirpur",
  "Mohammadpur",
  "Kallyanpur",
];

const KITCHEN_TYPE_OPTIONS: { value: KitchenType; label: string }[] = [
  { value: "home", label: "Home kitchen" },
  { value: "shared", label: "Shared kitchen" },
  { value: "home_catering", label: "Home + catering" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ShopForm {
  fullName: string;
  phone: string;
  email: string;
  area: string;
  bio: string;
  shopName: string;
  kitchenType: KitchenType;
  address: string;
  areas: string[];
  openHours: string;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function kitchenTypeLabel(value: KitchenType) {
  return KITCHEN_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default function SellerOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const { setIsShopAdded } = useShop();

  const {
    data: existingShop,
    isLoading,
    error: loadError,
  } = useGetMyShopQuery();
  const [saveShop, { isLoading: saving }] = useSaveShopMutation();

  const isEdit = !!existingShop;
  const hydratedRef = useRef(false);

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ShopForm>({
    fullName: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    area: "",
    bio: "",
    shopName: "",
    kitchenType: "home",
    address: "",
    areas: [],
    openHours: "7 AM – 9 PM",
  });

  useEffect(() => {
    if (!existingShop || hydratedRef.current) return;
    hydratedRef.current = true;
    setForm({
      fullName: existingShop.fullName,
      phone: existingShop.phone,
      email: existingShop.email,
      area: existingShop.area,
      bio: existingShop.bio ?? "",
      shopName: existingShop.shopName,
      kitchenType: existingShop.kitchenType,
      address: existingShop.address,
      areas: existingShop.areas,
      openHours: existingShop.openHours ?? "7 AM – 9 PM",
    });
    setIsShopAdded(true);
  }, [existingShop, setIsShopAdded]);

  const set = <K extends keyof ShopForm>(key: K, value: ShopForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const toggleArea = (area: string) => {
    setForm((current) => ({
      ...current,
      areas: current.areas.includes(area)
        ? current.areas.filter((item) => item !== area)
        : [...current.areas, area],
    }));
    setError("");
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.fullName.trim()) return "Please enter your name.";
      if (form.phone.trim().length < 6)
        return "Please enter a valid phone number.";
      if (!EMAIL_REGEX.test(form.email.trim()))
        return "Please enter a valid email address.";
      if (!form.area) return "Please choose the area your kitchen is in.";
      return null;
    }
    if (step === 1) {
      if (!form.shopName.trim()) return "Please give your kitchen a name.";
      if (!form.address.trim()) return "Please enter your kitchen address.";
      if (form.areas.length === 0)
        return "Please select at least one delivery area.";
      return null;
    }
    return null;
  };

  const next = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, STEP_TITLES.length - 1));
  };

  const back = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleFinish = async () => {
    if (saving) return;
    setError("");

    try {
      await saveShop({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        area: form.area,
        bio: form.bio.trim() || undefined,
        photoUrl: existingShop?.photoUrl,
        shopName: form.shopName.trim(),
        kitchenType: form.kitchenType,
        address: form.address.trim(),
        areas: form.areas,
        openHours: form.openHours.trim() || undefined,
      }).unwrap();

      setIsShopAdded(true);
      router.replace("/(stack)/seller/dashboard");
    } catch (err: unknown) {
      const failure = err as { data?: { message?: string }; message?: string };
      setError(
        failure?.data?.message ||
          failure?.message ||
          "Could not save your shop. Please try again."
      );
    }
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (isLoading) {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center bg-background`,
          { paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const loadFailed = !!loadError && (loadError as { status?: number }).status !== 404;
  const initials = initialsOf(form.fullName);
  const progressWidth = `${((step + 1) / STEP_TITLES.length) * 100}%`;

  return (
    <View style={tw`flex-1 bg-background`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            tw`px-[6%] pb-10`,
            { paddingTop: insets.top + 8 },
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          <View style={tw`flex-row items-center gap-1 self-start py-2`}>
            <TouchableOpacity
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={8}
              style={tw`flex-row items-center gap-1`}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={colors.textMuted}
              />
              <Text style={tw`text-sm font-semibold text-textMuted`}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`mb-5 items-center`}>
            <Text
              style={[
                tw`text-xs font-semibold uppercase text-primaryDark`,
                { letterSpacing: 1.5 },
              ]}
            >
              {isEdit ? "Edit shop profile" : "Get started"}
            </Text>
            <Text
              style={tw`mt-1 text-center font-display text-2xl font-semibold text-text`}
            >
              {isEdit
                ? "Update your shop profile"
                : "Welcome! Let's set up your kitchen"}
            </Text>
            <Text style={tw`mt-1 text-center text-sm text-textMuted`}>
              {isEdit
                ? "Customers see this information on your shop page."
                : "It only takes a couple of minutes — no technical skills needed."}
            </Text>
          </View>

          <View style={tw`mb-5`}>
            <View style={tw`mb-2 flex-row items-center justify-between`}>
              <Text style={tw`text-sm font-medium text-text`}>
                Step {step + 1} of {STEP_TITLES.length}
              </Text>
              <Text style={tw`text-sm text-textMuted`}>
                {STEP_TITLES[step].title}
              </Text>
            </View>
            <View style={tw`h-2 overflow-hidden rounded-full bg-border`}>
              <View
                style={[
                  tw`h-2 rounded-full bg-primary`,
                  { width: progressWidth },
                ]}
              />
            </View>
          </View>

          <View style={tw`rounded-2xl border border-border bg-card p-5 shadow-sm`}>
            <Text style={tw`font-display text-lg font-semibold text-text`}>
              {STEP_TITLES[step].title}
            </Text>
            <Text style={tw`mb-5 text-sm text-textMuted`}>
              {STEP_TITLES[step].description}
            </Text>

            {step === 0 && (
              <View style={tw`gap-4`}>
                <View style={tw`flex-row items-center gap-4`}>
                  <View style={tw`h-14 w-14 items-center justify-center rounded-full bg-primary/10`}>
                    <Text style={tw`text-lg font-bold text-primaryDark`}>
                      {initials || "?"}
                    </Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm font-medium text-text`}>
                      Your photo
                    </Text>
                    <Text style={tw`mt-0.5 text-xs text-textMuted`}>
                      You can add a photo later from your shop profile.
                    </Text>
                  </View>
                </View>

                <Input
                  label="Your full name"
                  required
                  placeholder="e.g. Ayesha Rahman"
                  value={form.fullName}
                  onChangeText={(value) => set("fullName", value)}
                  autoComplete="name"
                  textContentType="name"
                />

                <Input
                  label="Phone number"
                  required
                  hint="Customers may call about orders."
                  placeholder="e.g. 01712-345678"
                  value={form.phone}
                  onChangeText={(value) => set("phone", value)}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                />

                <Input
                  label="Email"
                  required
                  placeholder="you@email.com"
                  value={form.email}
                  onChangeText={(value) => set("email", value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />

                <View>
                  <Text style={tw`mb-1.5 text-sm font-medium text-text`}>
                    Your area<Text style={tw`text-red-text`}> *</Text>
                  </Text>
                  <Text style={tw`mb-2 text-xs text-textMuted`}>
                    Where is your kitchen located?
                  </Text>
                  <View style={tw`flex-row flex-wrap gap-2`}>
                    {AREA_OPTIONS.map((area) => (
                      <Chip
                        key={area}
                        active={form.area === area}
                        onPress={() => set("area", area)}
                      >
                        {area}
                      </Chip>
                    ))}
                  </View>
                </View>

                <Input
                  label="About you"
                  hint="A short line about you and your cooking."
                  placeholder="e.g. Home cook for 8 years, specialising in traditional Dhaka biryani."
                  value={form.bio}
                  onChangeText={(value) => set("bio", value)}
                  multiline
                  style={tw`min-h-16`}
                  textAlignVertical="top"
                />
              </View>
            )}

            {step === 1 && (
              <View style={tw`gap-4`}>
                <Input
                  label="Kitchen name"
                  required
                  hint="This is what customers will search for."
                  placeholder="e.g. Ayesha's Home Kitchen"
                  value={form.shopName}
                  onChangeText={(value) => set("shopName", value)}
                />

                <View>
                  <Text style={tw`mb-1.5 text-sm font-medium text-text`}>
                    Kitchen type
                  </Text>
                  <View style={tw`flex-row flex-wrap gap-2`}>
                    {KITCHEN_TYPE_OPTIONS.map((option) => (
                      <Chip
                        key={option.value}
                        active={form.kitchenType === option.value}
                        onPress={() => set("kitchenType", option.value)}
                      >
                        {option.label}
                      </Chip>
                    ))}
                  </View>
                </View>

                <Input
                  label="Kitchen address"
                  required
                  placeholder="House, road, sector, area"
                  value={form.address}
                  onChangeText={(value) => set("address", value)}
                  multiline
                  style={tw`min-h-16`}
                  textAlignVertical="top"
                />

                <View>
                  <Text style={tw`mb-1.5 text-sm font-medium text-text`}>
                    Areas you can deliver to<Text style={tw`text-red-text`}> *</Text>
                  </Text>
                  <Text style={tw`mb-2 text-xs text-textMuted`}>
                    Pick every area you feel comfortable delivering in.
                  </Text>
                  <View style={tw`flex-row flex-wrap gap-2`}>
                    {AREA_OPTIONS.map((area) => (
                      <Chip
                        key={area}
                        active={form.areas.includes(area)}
                        onPress={() => toggleArea(area)}
                      >
                        {area}
                      </Chip>
                    ))}
                  </View>
                </View>

                <Input
                  label="Open hours"
                  hint="When can customers place orders?"
                  placeholder="e.g. 7 AM – 9 PM"
                  value={form.openHours}
                  onChangeText={(value) => set("openHours", value)}
                />
              </View>
            )}

            {step === 2 && (
              <View style={tw`gap-4`}>
                <View style={tw`flex-row items-center gap-3`}>
                  <View style={tw`h-14 w-14 items-center justify-center rounded-full bg-primary/10`}>
                    <Text style={tw`text-lg font-bold text-primaryDark`}>
                      {initials || "?"}
                    </Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-display text-lg font-semibold text-text`}>
                      {form.shopName || "Your kitchen name"}
                    </Text>
                    <Text style={tw`text-sm text-textMuted`}>
                      {form.fullName}
                      {form.area ? ` · ${form.area}` : ""}
                    </Text>
                  </View>
                </View>

                <View style={tw`gap-3 rounded-xl bg-background p-4`}>
                  {[
                    ["Phone", form.phone],
                    ["Email", form.email],
                    ["Kitchen type", kitchenTypeLabel(form.kitchenType)],
                    ["Address", form.address],
                    ["Open hours", form.openHours],
                    [
                      "Deliveries",
                      form.areas.length ? form.areas.join(", ") : "—",
                    ],
                  ].map(([label, value]) => (
                    <View
                      key={label}
                      style={tw`flex-row items-start justify-between gap-4`}
                    >
                      <Text style={tw`text-sm text-textMuted`}>{label}</Text>
                      <Text
                        style={tw`flex-1 text-right text-sm font-medium text-text`}
                      >
                        {value || "—"}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={tw`flex-row items-start gap-2`}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.primary}
                    style={tw`mt-0.5`}
                  />
                  <Text style={tw`flex-1 text-sm text-textMuted`}>
                    Your kitchen will appear in the marketplace once the review
                    team verifies it. You can start adding dishes right away.
                  </Text>
                </View>
              </View>
            )}

            {error ? (
              <View style={tw`mt-4 rounded-xl bg-red-bg px-3 py-2`}>
                <Text style={tw`text-sm font-medium text-red-text`}>{error}</Text>
              </View>
            ) : null}

            {loadFailed ? (
              <View style={tw`mt-4 rounded-xl bg-amber-bg px-3 py-2`}>
                <Text style={tw`text-sm font-medium text-amber-text`}>
                  Couldn&apos;t load your saved shop profile. You can still fill
                  the form and save.
                </Text>
              </View>
            ) : null}
          </View>

          <View style={tw`mt-5 flex-row items-center justify-between gap-3`}>
            <PillButton
              title="Back"
              variant="secondary"
              onPress={back}
              disabled={step === 0 || saving}
            />
            {step < STEP_TITLES.length - 1 ? (
              <PillButton title="Continue" onPress={next} />
            ) : (
              <PillButton
                title={isEdit ? "Save changes" : "Finish & go live"}
                onPress={handleFinish}
                loading={saving}
                style={tw`bg-success`}
                textStyle={tw`text-white`}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
