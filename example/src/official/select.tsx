import { Alert } from "panelui-taro/alert";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Input } from "panelui-taro/input";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { Select } from "panelui-taro/select";
import { Separator } from "panelui-taro/separator";
import { useState, type ReactNode } from "react";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { hasNativeUI } from "../runtime/native";
import { ComponentEntry } from "../types";
function SelectSizesDemo() {
  const [status, setStatus] = useState<string>("review");
  return (
    <View className="w-full gap-3">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Select
          key={size}
          size={size}
          value={status}
          onValueChange={setStatus}
          placeholder="Status"
          title="Status"
        >
          <Select.Item value="draft" label="Draft" />
          <Select.Item value="review" label="In review" />
          <Select.Item value="approved" label="Approved" />
          <Select.Item value="shipped" label="Shipped" />
        </Select>
      ))}
    </View>
  );
}
function SelectDemo() {
  const [fruit, setFruit] = useState<string>();
  return (
    <View className="w-full gap-1.5">
      <Label>Favorite fruit</Label>
      <Select
        value={fruit}
        onValueChange={setFruit}
        placeholder="Select a fruit"
        title="Favorite fruit"
      >
        <Select.Item value="apple" label="Apple" />
        <Select.Item value="banana" label="Banana" />
        <Select.Item value="cherry" label="Cherry" />
        <Select.Item value="mango" label="Mango" />
      </Select>
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
function SearchableSelectDemo({
  presentation = "sheet",
}: {
  presentation?: "sheet" | "inline" | "overlay";
}) {
  const [zone, setZone] = useState<string>();
  return (
    <View className="w-full gap-1.5">
      <Label>Time zone</Label>
      <Select
        searchable
        searchPlaceholder="Search cities"
        emptyMessage="No city by that name"
        presentation={presentation}
        value={zone}
        onValueChange={setZone}
        placeholder="Select a time zone"
        title="Time zone"
      >
        {TIMEZONES.map((tz) => (
          <Select.Item key={tz.value} value={tz.value} label={tz.label} />
        ))}
      </Select>
    </View>
  );
}
function LongSelectDemo() {
  const [zone, setZone] = useState<string>();
  return (
    <View className="w-full gap-1.5">
      <Label>Time zone</Label>
      <Select
        value={zone}
        onValueChange={setZone}
        placeholder="Select a time zone"
        title="Time zone"
      >
        {TIMEZONES.map((tz) => (
          <Select.Item key={tz.value} value={tz.value} label={tz.label} />
        ))}
      </Select>
    </View>
  );
}
function NativeSheetSelectDemo() {
  const [zone, setZone] = useState<string>();
  return (
    <NativeDemo>
      <View className="w-full gap-1.5">
        <Label>Time zone</Label>
        <Select
          value={zone}
          onValueChange={setZone}
          placeholder="Select a time zone"
          title="Time zone"
          sheetProps={{
            native: true,
            snapPoints: ["half", "full"],
            nativeBackground: true,
          }}
        >
          {TIMEZONES.map((tz) => (
            <Select.Item key={tz.value} value={tz.value} label={tz.label} />
          ))}
        </Select>
      </View>
    </NativeDemo>
  );
}
function DisabledOptionSelectDemo() {
  const [plan, setPlan] = useState<string>("starter");
  return (
    <View className="w-full gap-1.5">
      <Label>Plan</Label>
      <Select value={plan} onValueChange={setPlan} title="Plan">
        <Select.Item value="starter" label="Starter" />
        <Select.Item value="team" label="Team" />

        <Select.Item
          value="enterprise"
          label="Enterprise — contact sales"
          disabled
        />
      </Select>
    </View>
  );
}
function GroupedSelectDemo() {
  const [zone, setZone] = useState<string>();
  return (
    <View className="w-full gap-1.5">
      <Label>Time zone</Label>
      <Select
        searchable
        searchPlaceholder="Search cities"
        emptyMessage="No city by that name"
        value={zone}
        onValueChange={setZone}
        placeholder="Select a time zone"
        title="Time zone"
      >
        <Select.Group label="Europe">
          <Select.Item value="europe/london" label="London" />
          <Select.Item value="europe/paris" label="Paris" />
          <Select.Item value="europe/berlin" label="Berlin" />
        </Select.Group>
        <Select.Group label="Asia">
          <Select.Item value="asia/dubai" label="Dubai" />
          <Select.Item value="asia/tokyo" label="Tokyo" />
          <Select.Item value="asia/singapore" label="Singapore" />
        </Select.Group>
        <Select.Group label="Americas">
          <Select.Item value="america/new_york" label="New York" />
          <Select.Item value="america/los_angeles" label="Los Angeles" />
        </Select.Group>
      </Select>
    </View>
  );
}
function NativeDemo({ children }: { children: ReactNode }) {
  return (
    <View className="w-full gap-5">
      <Alert variant={hasNativeUI() ? "info" : "warning"}>
        <Alert.Content>
          <Alert.Title>
            {hasNativeUI()
              ? "Rendering the platform control"
              : "@expo/ui not available"}
          </Alert.Title>
          <Alert.Description>
            {hasNativeUI()
              ? "Theme tokens do not apply here — the platform draws this."
              : "The `native` prop is a no-op, so the styled component renders instead."}
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Separator />
      <View className="w-full gap-4">{children}</View>
    </View>
  );
}
function NativeWheelPickerDemo() {
  const [size, setSize] = useState("m");
  return (
    <NativeDemo>
      <Select
        native
        nativeAppearance="wheel"
        value={size}
        onValueChange={setSize}
      >
        <Select.Item value="s" label="Small" />
        <Select.Item value="m" label="Medium" />
        <Select.Item value="l" label="Large" />
        <Select.Item value="xl" label="X-Large" />
      </Select>
      <Text size="sm" muted>
        Selected: {size}
      </Text>
    </NativeDemo>
  );
}
function NativeSelectDemo() {
  const [fruit, setFruit] = useState("apple");
  return (
    <NativeDemo>
      <Select native value={fruit} onValueChange={setFruit}>
        <Select.Item value="apple" label="Apple" />
        <Select.Item value="banana" label="Banana" />
        <Select.Item value="cherry" label="Cherry" />
      </Select>
      <Text size="sm" muted>
        Selected: {fruit}
      </Text>
    </NativeDemo>
  );
}
function RegionSelectDemo({
  presentation,
  contentWidth,
}: {
  presentation?: "sheet" | "inline" | "overlay";
  contentWidth?: "trigger" | "content" | number;
}) {
  const [region, setRegion] = useState<string>();
  return (
    <View className="w-full gap-1.5">
      <Label>Region</Label>
      <Select
        value={region}
        onValueChange={setRegion}
        placeholder="Select a region"
        presentation={presentation}
        contentWidth={contentWidth}
      >
        <Select.Item value="us" label="United States" />
        <Select.Item value="eu" label="Europe" />
        <Select.Item value="apac" label="Asia Pacific" />
      </Select>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "select",
  name: "Select",
  summary: "Picker shown in a sheet, in place, or floating over the page",
  demos: [
    { label: "Sheet (default)", render: () => <SelectDemo /> },
    { label: "Sizes", render: () => <SelectSizesDemo /> },
    { label: "Sheet — a long list", render: () => <LongSelectDemo /> },
    {
      label: "Inline — the row grows",
      render: () => (
        <View className="w-full gap-4">
          <RegionSelectDemo presentation="inline" />
          <Text size="sm" muted>
            The list expands in layout flow, so this paragraph is pushed down by
            its height. Right inside a settings list, where that reads as the
            row growing.
          </Text>
        </View>
      ),
    },
    {
      label: "Overlay — nothing below moves",
      render: () => (
        <View className="w-full gap-4">
          <RegionSelectDemo presentation="overlay" />
          <Text size="sm" muted>
            This paragraph stays exactly where it is when the list above opens.
            With `inline` it would be pushed down by the height of the list.
          </Text>
          <Button
            variant="outline"
            fullWidth
            onPress={demoAction("And so does this button")}
          >
            And so does this button
          </Button>
        </View>
      ),
    },
    {
      label: "Overlay width",
      render: () => (
        <View className="w-full gap-4">
          <RegionSelectDemo presentation="overlay" contentWidth="content" />
          <RegionSelectDemo presentation="overlay" contentWidth={220} />
        </View>
      ),
    },
    {
      label: "In a form",
      render: () => (
        <Card className="w-full">
          <Card.Content className="gap-4 p-4">
            <Input label="Full name" placeholder="Khalid Abdi" />
            <SelectDemo />
            <RegionSelectDemo presentation="overlay" />
          </Card.Content>
        </Card>
      ),
    },
    {
      label: "Searchable",
      render: () => (
        <View className="w-full gap-4">
          <SearchableSelectDemo />
          <Text size="sm" muted>
            Twenty cities. The filter matches any part of a label, so “lo” finds
            both London and Los Angeles.
          </Text>
        </View>
      ),
    },
    {
      label: "Searchable — overlay",
      render: () => <SearchableSelectDemo presentation="overlay" />,
    },
    {
      label: "Grouped options",
      render: () => (
        <View className="w-full gap-4">
          <GroupedSelectDemo />
          <Text size="sm" muted>
            Filter for “lo” and Asia disappears with its heading — a heading
            over no options reads as a section that failed to load.
          </Text>
        </View>
      ),
    },
    { label: "Disabled option", render: () => <DisabledOptionSelectDemo /> },
    { label: "Native sheet", render: () => <NativeSheetSelectDemo /> },
    { label: "Native — menu", render: () => <NativeSelectDemo /> },
    { label: "Native — wheel", render: () => <NativeWheelPickerDemo /> },
  ],
};
