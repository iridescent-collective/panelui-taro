import { Avatar } from "panelui-taro/avatar";
import { Button } from "panelui-taro/button";
import { CheckIcon, FolderIcon, TrashIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { SelectionMode } from "panelui-taro/selection-mode";
import { Slider } from "panelui-taro/slider";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const SELECTION_MESSAGES = [
  {
    id: "m1",
    name: "Design review",
    preview: "Shipping the new empty states today",
  },
  { id: "m2", name: "Rosa Delgado", preview: "Sent over the updated figures" },
  { id: "m3", name: "Weekend plans", preview: "Anyone free on Saturday?" },
  { id: "m4", name: "Ade Okafor", preview: "Thanks — that fixed it" },
  { id: "m5", name: "Release notes", preview: "Draft is ready for a read" },
];
const SELECTION_PEOPLE = [
  { id: "p1", name: "Rosa Delgado", handle: "@rosa" },
  { id: "p2", name: "Ade Okafor", handle: "@ade" },
  { id: "p3", name: "Mei Lin", handle: "@mei" },
  { id: "p4", name: "Tomas Novak", handle: "@tomas" },
  { id: "p5", name: "Priya Raman", handle: "@priya" },
];
const SELECTION_COLORS = [
  { id: "c1", name: "Lilac", hex: "#a78bfa" },
  { id: "c2", name: "Sky", hex: "#38bdf8" },
  { id: "c3", name: "Mint", hex: "#34d399" },
  { id: "c4", name: "Amber", hex: "#fbbf24" },
  { id: "c5", name: "Coral", hex: "#fb7185" },
  { id: "c6", name: "Slate", hex: "#94a3b8" },
  { id: "c7", name: "Indigo", hex: "#818cf8" },
  { id: "c8", name: "Teal", hex: "#2dd4bf" },
  { id: "c9", name: "Lime", hex: "#a3e635" },
  { id: "c10", name: "Rose", hex: "#f472b6" },
  { id: "c11", name: "Rust", hex: "#f97316" },
  { id: "c12", name: "Stone", hex: "#d6d3d1" },
];
function SelectionModeDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const [gone, setGone] = useState<string[]>([]);
  const messages = SELECTION_MESSAGES.filter(
    (message) => !gone.includes(message.id)
  );
  return (
    <View
      style={{ height: 380 }}
      className="border-border w-full overflow-hidden rounded-xl border"
    >
      <SelectionMode
        values={messages.map((message) => message.id)}
        selected={selected}
        onSelectedChange={setSelected}
      >
        <SelectionMode.Header title="Choose" />
        <ScrollView contentContainerClassName="py-2 pb-24">
          {messages.map((message) => (
            <SelectionMode.Item key={message.id} value={message.id}>
              <Item>
                <Item.Media>
                  <Avatar fallback={message.name.slice(0, 2).toUpperCase()} />
                </Item.Media>
                <Item.Content>
                  <Item.Title>{message.name}</Item.Title>
                  <Item.Description>{message.preview}</Item.Description>
                </Item.Content>
              </Item>
            </SelectionMode.Item>
          ))}
          {messages.length === 0 ? (
            <Text size="sm" muted className="p-6 text-center">
              All gone. Reopen the demo to bring them back.
            </Text>
          ) : null}
        </ScrollView>

        <SelectionMode.Bar>
          <SelectionMode.Action
            icon={<CheckIcon size={20} />}
            exitOnPress
            onPress={demoAction("Read")}
          >
            Read
          </SelectionMode.Action>
          <SelectionMode.Action
            icon={<FolderIcon size={20} />}
            exitOnPress
            onPress={demoAction("Archive")}
          >
            Archive
          </SelectionMode.Action>
          <SelectionMode.Action
            icon={<TrashIcon size={20} />}
            destructive
            exitOnPress
            onPress={(ids) => setGone((current) => [...current, ...ids])}
          >
            Delete
          </SelectionMode.Action>
        </SelectionMode.Bar>
      </SelectionMode>
    </View>
  );
}
function SelectionModeSheetPeopleDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["p2"]);
  return (
    <View className="w-full gap-3">
      <Button onPress={() => setOpen(true)}>
        {selected.length > 0 ? `Share with ${selected.length}` : "Share with…"}
      </Button>

      <SelectionMode
        values={SELECTION_PEOPLE.map((person) => person.id)}
        selected={selected}
        onSelectedChange={setSelected}
      >
        <SelectionMode.Sheet
          open={open}
          onOpenChange={setOpen}
          title="Share with"
        >
          <SelectionMode.Group>
            {SELECTION_PEOPLE.map((person) => (
              <SelectionMode.Item key={person.id} value={person.id}>
                <Item>
                  <Item.Media>
                    <Avatar fallback={person.name.slice(0, 2).toUpperCase()} />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{person.name}</Item.Title>
                    <Item.Description>{person.handle}</Item.Description>
                  </Item.Content>
                </Item>
              </SelectionMode.Item>
            ))}
          </SelectionMode.Group>
          <SelectionMode.Bar>
            <SelectionMode.Action
              icon={<CheckIcon size={20} />}
              onPress={() => setOpen(false)}
            >
              Send
            </SelectionMode.Action>
          </SelectionMode.Bar>
        </SelectionMode.Sheet>
      </SelectionMode>
    </View>
  );
}
function SelectionModeSheetColorsDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["c1", "c3"]);
  const [opacity, setOpacity] = useState(80);
  return (
    <View className="w-full gap-3">
      <Button variant="secondary" onPress={() => setOpen(true)}>
        Pick colours
      </Button>

      <SelectionMode
        values={SELECTION_COLORS.map((color) => color.id)}
        selected={selected}
        onSelectedChange={setSelected}
      >
        <SelectionMode.Sheet open={open} onOpenChange={setOpen} title="Palette">
          <SelectionMode.Group
            horizontal
            label="Colour"
            itemWidth={44}
            gap={14}
          >
            {SELECTION_COLORS.map((color) => (
              <SelectionMode.Item
                key={color.id}
                value={color.id}
                indicator="ring"
              >
                <View
                  style={{ backgroundColor: color.hex, aspectRatio: 1 }}
                  className="w-full rounded-full"
                />
              </SelectionMode.Item>
            ))}
          </SelectionMode.Group>

          <Slider
            label="Opacity"
            showValue
            value={opacity}
            onValueChange={setOpacity}
            formatValue={(value) => `${Math.round(value)}%`}
          />

          <SelectionMode.Bar>
            <SelectionMode.Action
              icon={<CheckIcon size={20} />}
              onPress={() => setOpen(false)}
            >
              Apply
            </SelectionMode.Action>
          </SelectionMode.Bar>
        </SelectionMode.Sheet>
      </SelectionMode>
    </View>
  );
}
function SelectionModeAlwaysOnDemo() {
  const [selected, setSelected] = useState<string[]>(["m2"]);
  return (
    <View
      style={{ height: 300 }}
      className="border-border w-full overflow-hidden rounded-xl border"
    >
      <SelectionMode
        defaultActive
        max={3}
        values={SELECTION_MESSAGES.map((message) => message.id)}
        selected={selected}
        onSelectedChange={setSelected}
      >
        <SelectionMode.Header title="Attach" />
        <ScrollView contentContainerClassName="py-2">
          {SELECTION_MESSAGES.map((message) => (
            <SelectionMode.Item key={message.id} value={message.id}>
              <Item>
                <Item.Content>
                  <Item.Title>{message.name}</Item.Title>
                </Item.Content>
              </Item>
            </SelectionMode.Item>
          ))}
        </ScrollView>
      </SelectionMode>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "selection-mode",
  name: "SelectionMode",
  summary: "Pick several rows out of a list, with a count and a bar of actions",
  demos: [
    { label: "Long press to start", render: () => <SelectionModeDemo /> },
    {
      label: "In a sheet — people",
      render: () => <SelectionModeSheetPeopleDemo />,
    },
    {
      label: "In a sheet — colours",
      render: () => <SelectionModeSheetColorsDemo />,
    },
    {
      label: "Always selecting, capped at three",
      render: () => <SelectionModeAlwaysOnDemo />,
    },
  ],
};
