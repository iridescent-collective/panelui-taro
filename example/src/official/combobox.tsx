import { Combobox } from "panelui-taro/combobox";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const FRAMEWORKS = [
  { value: "expo", label: "Expo" },
  { value: "react-native", label: "React Native" },
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "svelte-kit", label: "SvelteKit" },
  { value: "solid-start", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
];
function ComboboxDemo() {
  const [framework, setFramework] = useState<string>();
  return (
    <View className="w-full gap-1.5">
      <Label>Framework</Label>
      <Combobox
        value={framework}
        onValueChange={setFramework}
        placeholder="Search frameworks"
        clearable
      >
        {FRAMEWORKS.map((item) => (
          <Combobox.Item
            key={item.value}
            value={item.value}
            label={item.label}
          />
        ))}
      </Combobox>
    </View>
  );
}
function ComboboxGroupedDemo() {
  const [framework, setFramework] = useState<string>();
  return (
    <View className="w-full gap-1.5">
      <Label>Framework</Label>
      <Combobox
        value={framework}
        onValueChange={setFramework}
        placeholder="Search frameworks"
        openOnFocus
      >
        <Combobox.Group label="Native">
          <Combobox.Item value="expo" label="Expo" />
          <Combobox.Item value="react-native" label="React Native" />
        </Combobox.Group>
        <Combobox.Group label="Web">
          <Combobox.Item value="next" label="Next.js" />
          <Combobox.Item value="remix" label="Remix" />
          <Combobox.Item value="astro" label="Astro" />
        </Combobox.Group>
      </Combobox>
    </View>
  );
}
function ComboboxMultipleDemo() {
  const [picked, setPicked] = useState<string[]>(["expo"]);
  return (
    <View className="w-full gap-1.5">
      <Label>Stack</Label>
      <Combobox
        mode="multiple"
        value={picked}
        onValueChange={setPicked}
        placeholder="Add a framework"
        clearable
      >
        {FRAMEWORKS.map((item) => (
          <Combobox.Item
            key={item.value}
            value={item.value}
            label={item.label}
          />
        ))}
      </Combobox>
      <Text size="sm" muted>
        Each pick becomes a chip. Backspace on the empty field takes the last
        one back.
      </Text>
    </View>
  );
}
function ComboboxTagsDemo() {
  const [tags, setTags] = useState<string[]>(["design"]);
  return (
    <View className="w-full gap-1.5">
      <Label>Tags</Label>
      <Combobox
        mode="multiple"
        value={tags}
        onValueChange={setTags}
        allowCustomValue
        placeholder="Add a tag"
        emptyMessage="No tag by that name yet"
      >
        <Combobox.Item value="design" label="design" />
        <Combobox.Item value="engineering" label="engineering" />
        <Combobox.Item value="research" label="research" />
      </Combobox>
      <Text size="sm" muted>
        Type something that is not on the list and press return to keep it.
      </Text>
    </View>
  );
}
function ComboboxAsyncDemo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<string>();
  useEffect(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setResults(
        TIMEZONES.filter((tz) => tz.label.toLowerCase().includes(needle)).slice(
          0,
          6
        )
      );
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <View className="w-full gap-1.5">
      <Label>City</Label>
      <Combobox
        value={city}
        onValueChange={setCity}
        inputValue={query}
        onInputValueChange={setQuery}
        filter={false}
        loading={loading}
        loadingMessage="Looking up cities"
        emptyMessage="No city by that name"
        placeholder="Search cities"
        clearable
      >
        {results.map((item) => (
          <Combobox.Item
            key={item.value}
            value={item.value}
            label={item.label}
          />
        ))}
      </Combobox>
    </View>
  );
}
function ComboboxInlineDemo() {
  const [framework, setFramework] = useState<string>();
  return (
    <View className="w-full gap-4">
      <View className="w-full gap-1.5">
        <Label>Framework</Label>
        <Combobox
          presentation="inline"
          value={framework}
          onValueChange={setFramework}
          placeholder="Search frameworks"
        >
          {FRAMEWORKS.map((item) => (
            <Combobox.Item
              key={item.value}
              value={item.value}
              label={item.label}
            />
          ))}
        </Combobox>
      </View>
      <Text size="sm" muted>
        The list expands in layout flow, so this paragraph is pushed down by its
        height instead of being covered by it.
      </Text>
    </View>
  );
}
const TIMEZONES = [
  { value: "utc", label: "UTC" },
  { value: "europe/london", label: "London" },
  { value: "europe/paris", label: "Paris" },
  { value: "europe/berlin", label: "Berlin" },
  { value: "europe/madrid", label: "Madrid" },
  { value: "europe/istanbul", label: "Istanbul" },
  { value: "africa/cairo", label: "Cairo" },
  { value: "africa/lagos", label: "Lagos" },
  { value: "africa/nairobi", label: "Nairobi" },
  { value: "asia/dubai", label: "Dubai" },
  { value: "asia/karachi", label: "Karachi" },
  { value: "asia/kolkata", label: "Kolkata" },
  { value: "asia/singapore", label: "Singapore" },
  { value: "asia/tokyo", label: "Tokyo" },
  { value: "australia/sydney", label: "Sydney" },
  { value: "america/sao_paulo", label: "São Paulo" },
  { value: "america/new_york", label: "New York" },
  { value: "america/chicago", label: "Chicago" },
  { value: "america/denver", label: "Denver" },
  { value: "america/los_angeles", label: "Los Angeles" },
];
export const entry: ComponentEntry = {
  slug: "combobox",
  name: "Combobox",
  summary: "A text field that filters a list as you type",
  demos: [
    { label: "Filter as you type", render: () => <ComboboxDemo /> },
    { label: "Grouped options", render: () => <ComboboxGroupedDemo /> },
    { label: "Several at once", render: () => <ComboboxMultipleDemo /> },
    {
      label: "Values it does not know about",
      render: () => <ComboboxTagsDemo />,
    },
    { label: "Fetched for the query", render: () => <ComboboxAsyncDemo /> },
    {
      label: "Inline — nothing is covered",
      render: () => <ComboboxInlineDemo />,
    },
  ],
};
