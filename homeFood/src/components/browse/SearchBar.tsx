import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/src/constants/theme";
import tw from "@/src/lib/tailwind";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search dishes, cravings, a home chef…",
  style,
}: SearchBarProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View
      style={[
        tw`w-full flex-row items-center gap-2 rounded-full border bg-card px-4 py-1.5 shadow-sm`,
        focused ? tw`border-primary` : tw`border-borderStrong`,
        style,
      ]}
    >
      <Ionicons
        name="search"
        size={16}
        color={colors.textFaint}
        accessibilityElementsHidden
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        cursorColor={colors.primary}
        selectionColor={colors.primary}
        returnKeyType="search"
        accessibilityLabel="Search dishes"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={tw`h-8 flex-1 text-sm text-text`}
      />
      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={16}
          color={colors.textFaint}
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        />
      )}
    </View>
  );
}
