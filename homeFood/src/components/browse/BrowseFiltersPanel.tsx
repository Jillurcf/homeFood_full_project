import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import tw from "@/src/lib/tailwind";
import {
  PRICE_OPTIONS,
  RATING_OPTIONS,
} from "@/src/lib/browse";
import type { BrowseFilters, CategoryCount } from "@/src/types/food";
import { Chip } from "@/src/components/ui";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={tw`gap-2`}>
      <Text
        style={tw`text-xs font-semibold uppercase tracking-wider text-textFaint`}
      >
        {label}
      </Text>
      <View style={tw`flex-row flex-wrap gap-2`}>{children}</View>
    </View>
  );
}

interface BrowseFiltersPanelProps {
  filters: BrowseFilters;
  categories: CategoryCount[];
  areas: string[];
  tags: string[];
  onChange: (patch: Partial<BrowseFilters>) => void;
  onClear: () => void;
}

export function BrowseFiltersPanel({
  filters,
  categories,
  areas,
  tags,
  onChange,
  onClear,
}: BrowseFiltersPanelProps) {
  const toggleDietary = (tag: string) => {
    onChange({
      dietary: filters.dietary.includes(tag)
        ? filters.dietary.filter((t) => t !== tag)
        : [...filters.dietary, tag],
    });
  };

  const totalCategoryCount = categories.reduce(
    (sum, c) => sum + c.count,
    0,
  );

  return (
    <View
      style={tw`rounded-2xl border border-border bg-card p-4 shadow-sm`}
    >
      <View style={tw`mb-4 flex-row items-center justify-between`}>
        <Text style={tw`text-lg font-semibold text-text`}>Filters</Text>
        <TouchableOpacity
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
          hitSlop={8}
        >
          <Text style={tw`text-sm font-semibold text-primaryDark`}>
            Clear all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={tw`max-h-96`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`gap-5`}
      >
        <Group label="Category">
          <Chip
            active={filters.category === "All"}
            onPress={() => onChange({ category: "All" })}
          >
            All ({totalCategoryCount})
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.name}
              active={filters.category === category.name}
              onPress={() => onChange({ category: category.name })}
            >
              {category.name} ({category.count})
            </Chip>
          ))}
        </Group>

        <Group label="Price">
          {PRICE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              active={filters.price === option.value}
              onPress={() => onChange({ price: option.value })}
            >
              {option.label}
            </Chip>
          ))}
        </Group>

        <Group label="Rating">
          {RATING_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              active={filters.rating === option.value}
              onPress={() => onChange({ rating: option.value })}
            >
              {option.label}
            </Chip>
          ))}
        </Group>

        <Group label="Location">
          <Chip
            active={filters.area === "All"}
            onPress={() => onChange({ area: "All" })}
          >
            All areas
          </Chip>
          {areas.map((area) => (
            <Chip
              key={area}
              active={filters.area === area}
              onPress={() => onChange({ area })}
            >
              {area}
            </Chip>
          ))}
        </Group>

        {tags.length > 0 && (
          <Group label="Dietary">
            {tags.map((tag) => (
              <Chip
                key={tag}
                active={filters.dietary.includes(tag)}
                onPress={() => toggleDietary(tag)}
              >
                {tag}
              </Chip>
            ))}
          </Group>
        )}

        <Group label="Availability">
          <Chip
            active={filters.inStockOnly}
            onPress={() => onChange({ inStockOnly: !filters.inStockOnly })}
          >
            In stock only
          </Chip>
        </Group>
      </ScrollView>
    </View>
  );
}
