import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { ColorPicker } from "panelui-taro/color-picker";
import { Field } from "panelui-taro/field";
import { Text } from "panelui-taro/primitives/text";
import { Surface } from "panelui-taro/surface";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ColorPickerDemo() {
  const [color, setColor] = useState("#22c55e");
  return (
    <View className="w-full gap-4">
      <ColorPicker value={color} onValueChange={setColor}>
        <ColorPicker.Area />
        <ColorPicker.Hue />
        <ColorPicker.Preview showValue />
      </ColorPicker>

      <Button
        className="w-full"
        style={{ backgroundColor: color }}
        onPress={demoAction("Save theme")}
      >
        Save theme
      </Button>
    </View>
  );
}
function ColorPickerCardVersion() {
  const [accent, setAccent] = useState("#3b82f6");
  const [surface, setSurface] = useState("#0f172a");
  return (
    <View className="w-full gap-3 p-4">
      <Text size="sm" muted>
        Press a row to open its picker.
      </Text>

      <ColorPicker
        value={accent}
        onValueChange={setAccent}
        presentation="popover"
      >
        <ColorPicker.Trigger>
          <ColorPicker.Field label="Accent" />
        </ColorPicker.Trigger>
        <ColorPicker.Content>
          <ColorPicker.Area height={220} />
          <ColorPicker.Channel channel="hue" />
          <ColorPicker.Hue />
        </ColorPicker.Content>
      </ColorPicker>

      <ColorPicker
        value={surface}
        onValueChange={setSurface}
        presentation="popover"
      >
        <ColorPicker.Trigger>
          <ColorPicker.Field label="Surface" />
        </ColorPicker.Trigger>
        <ColorPicker.Content>
          <ColorPicker.Area height={220} />
          <ColorPicker.Channel channel="hue" />
          <ColorPicker.Hue />
        </ColorPicker.Content>
      </ColorPicker>
    </View>
  );
}
function ColorPickerInlineVersion() {
  const [color, setColor] = useState("#3b82f6");
  return (
    <View className="w-full gap-3 p-4">
      <ColorPicker value={color} onValueChange={setColor}>
        <ColorPicker.Field label="Accent" />
        <Surface variant="secondary" padding="sm" className="gap-3 rounded-2xl">
          <ColorPicker.Area height={280} />
          <ColorPicker.Channel channel="hue" />
          <ColorPicker.Hue />
        </Surface>
      </ColorPicker>
    </View>
  );
}
function ColorPickerSheetVersion() {
  const [color, setColor] = useState("#22c55e");
  return (
    <View className="w-full gap-3 p-4">
      <Text size="sm" muted>
        The same picker, brought up from the bottom edge instead.
      </Text>
      <ColorPicker
        value={color}
        onValueChange={setColor}
        presentation="bottom-sheet"
      >
        <ColorPicker.Trigger>
          <ColorPicker.Field label="Highlight" />
        </ColorPicker.Trigger>
        <ColorPicker.Content>
          <ColorPicker.Area height={240} />
          <ColorPicker.Channel channel="hue" />
          <ColorPicker.Hue />
          <ColorPicker.Channel channel="alpha" />
          <ColorPicker.Alpha />
        </ColorPicker.Content>
      </ColorPicker>
    </View>
  );
}
function ColorPickerWheelVersion() {
  const [color, setColor] = useState("#f97316");
  return (
    <View className="w-full gap-3 p-4">
      <Text size="sm" muted>
        Press the row to open its picker.
      </Text>

      <ColorPicker
        value={color}
        onValueChange={setColor}
        presentation="popover"
      >
        <ColorPicker.Trigger>
          <ColorPicker.Field label="Brand" />
        </ColorPicker.Trigger>
        <ColorPicker.Content>
          <View className="items-center py-2">
            <ColorPicker.Wheel />
          </View>
          <ColorPicker.Channel channel="brightness" />
          <ColorPicker.Brightness />
          <ColorPicker.Channel channel="alpha" />
          <ColorPicker.Alpha />
        </ColorPicker.Content>
      </ColorPicker>
    </View>
  );
}
function ColorPickerAlphaDemo() {
  const [color, setColor] = useState("rgba(59, 130, 246, 0.6)");
  return (
    <View className="w-full gap-4">
      <ColorPicker value={color} onValueChange={setColor} format="rgb">
        <ColorPicker.Area height={150} />
        <ColorPicker.Hue />
        <ColorPicker.Alpha />
        <ColorPicker.Preview showValue />
      </ColorPicker>
      <Card className="w-full">
        <Card.Content className="gap-2 p-4">
          <Text size="sm" muted>
            Overlay
          </Text>
          <View
            className="h-16 w-full rounded-lg"
            style={{ backgroundColor: color }}
          />
        </Card.Content>
      </Card>
    </View>
  );
}
function ColorPickerSwatchesDemo() {
  const [color, setColor] = useState("#f97316");
  return (
    <ColorPicker value={color} onValueCommit={setColor} size="sm">
      <ColorPicker.Swatches
        colors={[
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e",
          "#06b6d4",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#0f172a",
        ]}
      />
      <ColorPicker.Area height={120} />
      <ColorPicker.Hue />
      <ColorPicker.Preview showValue />
    </ColorPicker>
  );
}
export const entry: ComponentEntry = {
  slug: "color-picker",
  name: "ColorPicker",
  summary: "A colour chosen by dragging, not by typing",
  demos: [
    {
      label: "Accent card",
      id: "card",
      fullPage: true,
      description:
        "Rows that read out a colour and open the picker over themselves when pressed.",
      render: () => <ColorPickerCardVersion />,
    },
    {
      label: "In a sheet",
      id: "sheet",
      fullPage: true,
      description:
        "The same folded-away picker, brought up from the bottom edge.",
      render: () => <ColorPickerSheetVersion />,
    },
    {
      label: "Inline panel",
      id: "inline",
      fullPage: true,
      description:
        "A labelled strip over the square, and a readout naming the track under it.",
      render: () => <ColorPickerInlineVersion />,
    },
    {
      label: "Wheel",
      id: "wheel",
      fullPage: true,
      description:
        "Hue around and saturation out, with brightness on a track of its own.",
      render: () => <ColorPickerWheelVersion />,
    },
    { label: "Interactive", render: () => <ColorPickerDemo /> },
    { label: "With opacity", render: () => <ColorPickerAlphaDemo /> },
    { label: "Presets first", render: () => <ColorPickerSwatchesDemo /> },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-6">
          <ColorPicker defaultValue="#8b5cf6" size="sm">
            <ColorPicker.Area />
            <ColorPicker.Hue />
          </ColorPicker>
          <ColorPicker defaultValue="#f59e0b" size="lg">
            <ColorPicker.Area />
            <ColorPicker.Hue />
          </ColorPicker>
        </View>
      ),
    },
    {
      label: "Disabled",
      render: () => (
        <ColorPicker defaultValue="#64748b" disabled>
          <ColorPicker.Area height={110} />
          <ColorPicker.Hue />
          <ColorPicker.Preview showValue />
        </ColorPicker>
      ),
    },
  ],
};
