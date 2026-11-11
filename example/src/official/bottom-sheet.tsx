import { Alert } from "panelui-taro/alert";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { Checkbox } from "panelui-taro/checkbox";
import { ChevronRightIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { RadioGroup } from "panelui-taro/radio-group";
import { Separator } from "panelui-taro/separator";
import { Slider } from "panelui-taro/slider";
import { Switch } from "panelui-taro/switch";
import { useState, type ReactNode } from "react";

import { demoAction } from "../runtime/demo-action";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "../runtime/motion";
import { View } from "../runtime/native";
import { hasNativeUI } from "../runtime/native";
import { ComponentEntry } from "../types";
function DetachedSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheet.Trigger>
        <Button variant="outline">Open detached</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Content detached>
        <Text size="lg" weight="semibold" className="mb-1">
          Rate your order
        </Text>
        <Text size="sm" muted className="mb-4">
          How was the delivery?
        </Text>
        <View className="flex-row gap-2 pb-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={demoAction("Bad")}
          >
            Bad
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onPress={demoAction("Fine")}
          >
            Fine
          </Button>
          <Button className="flex-1" onPress={demoAction("Great")}>
            Great
          </Button>
        </View>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
function BlurredSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheet.Trigger>
        <Button variant="outline">Open over a frosted screen</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Content detached blur>
        <Text size="lg" weight="semibold" className="mb-1">
          Move to trash
        </Text>
        <Text size="sm" muted className="mb-4">
          The file stays recoverable for 30 days.
        </Text>
        <View className="flex-row gap-2 pb-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={demoAction("Cancel")}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onPress={demoAction("Move to trash")}
          >
            Move to trash
          </Button>
        </View>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
const SORT_OPTIONS = [
  { value: "relevance", label: "Most relevant" },
  { value: "recent", label: "Newest first" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];
const BRANDS = [
  { id: "aurora", name: "Aurora", count: 128 },
  { id: "basin", name: "Basin", count: 94 },
  { id: "cadence", name: "Cadence", count: 61 },
  { id: "dovetail", name: "Dovetail", count: 47 },
  { id: "ember", name: "Ember", count: 33 },
  { id: "fathom", name: "Fathom", count: 21 },
];
function FullHeightSheetDemo() {
  const [sort, setSort] = useState("relevance");
  const [budget, setBudget] = useState(240);
  const [inStock, setInStock] = useState(true);
  const [freeReturns, setFreeReturns] = useState(false);
  const [brands, setBrands] = useState<string[]>(["aurora"]);
  const toggleBrand = (id: string) =>
    setBrands((was) =>
      was.includes(id) ? was.filter((b) => b !== id) : [...was, id]
    );
  const active = brands.length + (inStock ? 1 : 0) + (freeReturns ? 1 : 0);
  return (
    <BottomSheet>
      <BottomSheet.Trigger>
        <Button variant="outline">Open filters</Button>
      </BottomSheet.Trigger>

      <BottomSheet.Content size="full">
        <BottomSheet.Header
          title="Filters"
          description={`${active} applied · 384 results`}
        />

        <BottomSheet.Body contentContainerClassName="gap-6 pb-6">
          <View className="gap-2">
            <Label>Sort by</Label>
            <RadioGroup value={sort} onValueChange={setSort}>
              {SORT_OPTIONS.map((option) => (
                <RadioGroup.Item
                  key={option.value}
                  value={option.value}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </View>

          <Separator />

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label>Budget</Label>
              <Text size="sm" muted>
                Up to ${budget}
              </Text>
            </View>
            <Slider
              value={budget}
              onValueChange={setBudget}
              min={20}
              max={500}
              step={10}
            />
          </View>

          <Separator />

          <View className="gap-2">
            <Label>Brand</Label>
            {BRANDS.map((brand) => (
              <Item key={brand.id} onPress={() => toggleBrand(brand.id)}>
                <Item.Content>
                  <Item.Title>{brand.name}</Item.Title>
                  <Item.Description>{brand.count} items</Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Checkbox checked={brands.includes(brand.id)} />
                </Item.Actions>
              </Item>
            ))}
          </View>

          <Separator />

          <View className="gap-2">
            <Label>Availability</Label>
            <Item>
              <Item.Content>
                <Item.Title>In stock only</Item.Title>
                <Item.Description>Hide anything on backorder</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Switch value={inStock} onValueChange={setInStock} />
              </Item.Actions>
            </Item>
            <Item>
              <Item.Content>
                <Item.Title>Free returns</Item.Title>
                <Item.Description>Within 30 days of delivery</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Switch value={freeReturns} onValueChange={setFreeReturns} />
              </Item.Actions>
            </Item>
          </View>
        </BottomSheet.Body>

        <BottomSheet.Footer className="flex-row">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => {
              setSort("relevance");
              setBudget(240);
              setInStock(true);
              setFreeReturns(false);
              setBrands([]);
            }}
          >
            Reset
          </Button>
          <Button className="flex-[2]" onPress={demoAction("Show 384 results")}>
            Show 384 results
          </Button>
        </BottomSheet.Footer>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
function FormSheetDemo() {
  const keyboard = useAnimatedKeyboard();
  const style = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));
  return (
    <BottomSheet>
      <BottomSheet.Trigger>
        <Button variant="outline">Open form</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Content>
        <Animated.View style={style}>
          <Text size="lg" weight="semibold" className="mb-1">
            Invite a teammate
          </Text>
          <Text size="sm" muted className="mb-4">
            They will get an email with a join link.
          </Text>
          <View className="gap-3 pb-2">
            <Input label="Email" placeholder="teammate@example.com" />
            <Input label="Message" placeholder="Optional note" />
            <Button fullWidth onPress={demoAction("Send invite")}>
              Send invite
            </Button>
          </View>
        </Animated.View>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
function ScrollableSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheet.Trigger>
        <Button variant="outline">Open list</Button>
      </BottomSheet.Trigger>
      <BottomSheet.Content style={{ maxHeight: 420 }}>
        <BottomSheet.Header
          title="Choose a country"
          description="The list scrolls under the fixed heading. The sheet itself still drags."
        />
        <BottomSheet.Body contentContainerClassName="pb-4">
          {COUNTRIES.map((country, index) => (
            <View
              key={country}
              className={
                index > 0
                  ? "border-border flex-row items-center border-t py-3.5"
                  : "flex-row items-center py-3.5"
              }
            >
              <Text className="flex-1">{country}</Text>
              <ChevronRightIcon size={16} />
            </View>
          ))}
        </BottomSheet.Body>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
const COUNTRIES = [
  "Somalia",
  "Kenya",
  "Ethiopia",
  "Djibouti",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Egypt",
  "Morocco",
  "Nigeria",
  "Ghana",
  "South Africa",
];
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
function NativeBottomSheetDemo({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <NativeDemo>
      <BottomSheet
        native
        nativeBackground={solid}
        snapPoints={["half"]}
        open={open}
        onOpenChange={setOpen}
      >
        <BottomSheet.Trigger>
          <Button variant="outline" fullWidth>
            {solid ? "Open the solid sheet" : "Open the platform sheet"}
          </Button>
        </BottomSheet.Trigger>
        <BottomSheet.Content className="gap-3">
          <Text size="lg" weight="semibold">
            {solid ? "The theme’s surface" : "Platform chrome, your content"}
          </Text>
          <Text size="sm" muted>
            {solid
              ? "Painted with the theme’s popover surface instead of the material the platform draws it in, so what is behind the sheet stops showing through it."
              : "The container, corner radius, grabber and dismiss gesture belong to the platform. Everything in here is still themed — and it starts at the top of the sheet rather than floating in the middle of it."}
          </Text>
          <Item.Group className="mt-1">
            <Item size="sm">
              <Item.Content>
                <Item.Title>Detent</Item.Title>
                <Item.Description>
                  Half height, set by snapPoints.
                </Item.Description>
              </Item.Content>
            </Item>
            <Item.Separator />
            <Item size="sm">
              <Item.Content>
                <Item.Title>Surface</Item.Title>
                <Item.Description>
                  {solid
                    ? "Solid, from the theme."
                    : "The platform’s own material."}
                </Item.Description>
              </Item.Content>
            </Item>
            <Item.Separator />
            <Item size="sm">
              <Item.Content>
                <Item.Title>Dismiss</Item.Title>
                <Item.Description>
                  Swipe down, or the button below.
                </Item.Description>
              </Item.Content>
            </Item>
          </Item.Group>
          <Button fullWidth onPress={() => setOpen(false)}>
            Close
          </Button>
        </BottomSheet.Content>
      </BottomSheet>
    </NativeDemo>
  );
}
export const entry: ComponentEntry = {
  slug: "bottom-sheet",
  name: "BottomSheet",
  summary: "Draggable sheet anchored to the bottom",
  demos: [
    {
      label: "Basic",
      render: () => (
        <BottomSheet>
          <BottomSheet.Trigger>
            <Button variant="outline">Open sheet</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <Text size="lg" weight="semibold" className="mb-1">
              Share project
            </Text>
            <Text size="sm" muted className="mb-4">
              Anyone with the link can view this project.
            </Text>
            <View className="gap-3 pb-2">
              <Input placeholder="https://panelui.dev/p/xK2f9" />
              <Button onPress={demoAction("Copy link")}>Copy link</Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet>
      ),
    },
    {
      label: "Without the close button",
      render: () => (
        <BottomSheet>
          <BottomSheet.Trigger>
            <Button variant="outline">Open, no X</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content showClose={false}>
            <Text size="lg" weight="semibold" className="mb-1">
              Drag to dismiss
            </Text>
            <Text size="sm" muted className="mb-4 pb-2">
              Pull the sheet down, or tap the backdrop.
            </Text>
          </BottomSheet.Content>
        </BottomSheet>
      ),
    },
    { label: "Detached", render: () => <DetachedSheetDemo /> },
    { label: "Frosted backdrop", render: () => <BlurredSheetDemo /> },
    {
      label: "Full height",
      id: "full-height",
      fullPage: true,
      description:
        "A heading that stays put, a body that scrolls under it, and the action pinned within reach.",
      render: () => (
        <View className="flex-1 items-center justify-center p-5">
          <FullHeightSheetDemo />
        </View>
      ),
    },
    { label: "Form", render: () => <FormSheetDemo /> },
    { label: "Scrollable list", render: () => <ScrollableSheetDemo /> },
    {
      label: "Action list",
      render: () => (
        <BottomSheet>
          <BottomSheet.Trigger>
            <Button variant="outline">Open actions</Button>
          </BottomSheet.Trigger>
          <BottomSheet.Content>
            <Text size="lg" weight="semibold" className="mb-3">
              Project
            </Text>
            <View className="gap-2 pb-2">
              <Button variant="ghost" fullWidth onPress={demoAction("Rename")}>
                Rename
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onPress={demoAction("Duplicate")}
              >
                Duplicate
              </Button>
              <Button variant="ghost" fullWidth onPress={demoAction("Archive")}>
                Archive
              </Button>
              <Button
                variant="destructive"
                fullWidth
                onPress={demoAction("Delete")}
              >
                Delete
              </Button>
            </View>
          </BottomSheet.Content>
        </BottomSheet>
      ),
    },
    { label: "Native", render: () => <NativeBottomSheetDemo /> },
    { label: "Native, solid", render: () => <NativeBottomSheetDemo solid /> },
  ],
};
