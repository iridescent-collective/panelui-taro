import { Chip } from "panelui-taro/chip";
import { CheckIcon, SearchIcon } from "panelui-taro/icons";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ChipFilterDemo() {
  const [tags, setTags] = useState<string[]>(["design"]);
  const toggle = (id: string) =>
    setTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  return (
    <View className="w-full flex-row flex-wrap justify-center gap-2">
      {["design", "code", "research", "ops"].map((id) => (
        <Chip
          key={id}
          selected={tags.includes(id)}
          onPress={() => toggle(id)}
          haptics
        >
          {id}
        </Chip>
      ))}
    </View>
  );
}
function ChipRemovableDemo() {
  const [people, setPeople] = useState(["Ada", "Grace", "Alan", "Katherine"]);
  return (
    <View className="w-full flex-row flex-wrap justify-center gap-2">
      {people.map((name) => (
        <Chip
          key={name}
          variant="outline"
          onClose={() => setPeople((p) => p.filter((n) => n !== name))}
        >
          {name}
        </Chip>
      ))}
      {people.length === 0 ? (
        <Text size="sm" muted>
          Everyone removed — reopen the screen to reset.
        </Text>
      ) : null}
    </View>
  );
}
const people = (value: number) => value.toLocaleString();
export const entry: ComponentEntry = {
  slug: "chip",
  name: "Chip",
  summary: "Interactive pill — filter, tag, or token",
  demos: [
    {
      label: "Variants",
      render: () => (
        <View className="flex-row flex-wrap items-center justify-center gap-2">
          <Chip>Default</Chip>
          <Chip variant="primary">Primary</Chip>
          <Chip variant="outline">Outline</Chip>
          <Chip variant="success">Shipped</Chip>
          <Chip variant="warning">Beta</Chip>
          <Chip variant="info">New</Chip>
          <Chip variant="destructive">Blocked</Chip>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="flex-row flex-wrap items-center justify-center gap-2">
          <Chip size="xs">Extra small</Chip>
          <Chip size="sm">Small</Chip>
          <Chip size="md">Medium</Chip>
          <Chip size="lg">Large</Chip>
          <Chip size="xl">Extra large</Chip>
        </View>
      ),
    },
    {
      label: "With a leading icon",
      render: () => (
        <View className="flex-row flex-wrap items-center justify-center gap-2">
          <Chip variant="success" start={<CheckIcon size={13} />}>
            <Chip.Label>Available</Chip.Label>
          </Chip>
          <Chip variant="outline" start={<SearchIcon size={13} />}>
            <Chip.Label>Search</Chip.Label>
          </Chip>
        </View>
      ),
    },
    { label: "A filter bar", render: () => <ChipFilterDemo /> },
    { label: "Removable tokens", render: () => <ChipRemovableDemo /> },
  ],
};
