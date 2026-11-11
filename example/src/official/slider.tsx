import { Alert } from "panelui-taro/alert";
import { Separator } from "panelui-taro/separator";
import { Slider } from "panelui-taro/slider";
import { useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { hasNativeUI } from "../runtime/native";
import { ComponentEntry } from "../types";
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
function NativeSliderDemo() {
  const [level, setLevel] = useState(40);
  return (
    <NativeDemo>
      <Slider
        native
        label="Brightness"
        showValue
        formatValue={(v) => `${Math.round(v)}%`}
        value={level}
        onValueChange={setLevel}
      />

      <Slider
        label="For comparison, the styled one"
        showValue
        formatValue={(v) => `${Math.round(v)}%`}
        value={level}
        onValueChange={setLevel}
      />
    </NativeDemo>
  );
}
function SliderDemo() {
  const [volume, setVolume] = useState(40);
  return (
    <View className="w-full gap-6">
      <Slider
        label="Volume"
        showValue
        formatValue={(v) => `${Math.round(v)}%`}
        value={volume}
        onValueChange={setVolume}
      />
      <Slider defaultValue={70} color="success" size="sm" />
      <Slider
        defaultValue={5}
        min={0}
        max={10}
        step={1}
        color="warning"
        size="lg"
      />
      <Slider label="Locked" showValue defaultValue={30} disabled />
    </View>
  );
}
function RangeSliderDemo() {
  const [price, setPrice] = useState<[number, number]>([220, 680]);
  return (
    <View className="w-full gap-6">
      <Slider
        label="Price"
        showValue
        formatValue={(v) => `$${Math.round(v)}`}
        range={price}
        onRangeChange={setPrice}
        min={0}
        max={1000}
        step={20}
        color="success"
      />

      <Slider
        label="Nights"
        showValue
        defaultRange={[2, 6]}
        min={1}
        max={14}
        step={1}
        minStepsBetweenThumbs={1}
      />
      <Slider label="Locked" showValue defaultRange={[30, 60]} disabled />
    </View>
  );
}
const price = (value: number) => `$${value.toFixed(2)}`;
export const entry: ComponentEntry = {
  slug: "slider",
  name: "Slider",
  summary: "Pick a value by dragging a thumb along a track",
  demos: [
    { label: "Interactive", render: () => <SliderDemo /> },
    { label: "Range", render: () => <RangeSliderDemo /> },
    { label: "Native", render: () => <NativeSliderDemo /> },
    {
      label: "Colors",
      render: () => (
        <View className="w-full gap-5">
          <Slider defaultValue={40} color="primary" />
          <Slider defaultValue={55} color="success" />
          <Slider defaultValue={70} color="warning" />
          <Slider defaultValue={85} color="destructive" />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-5">
          <Slider defaultValue={40} size="sm" />
          <Slider defaultValue={40} size="md" />
          <Slider defaultValue={40} size="lg" />
        </View>
      ),
    },
    {
      label: "Stepped",
      render: () => (
        <View className="w-full gap-5">
          <Slider defaultValue={2} min={0} max={5} step={1} />
          <Slider defaultValue={30} disabled />
        </View>
      ),
    },
    {
      label: "Labelled",
      render: () => (
        <View className="w-full gap-6">
          <Slider label="Brightness" showValue defaultValue={62} />

          <Slider
            label="Budget"
            showValue
            formatValue={(v) => `$${Math.round(v)}`}
            defaultValue={340}
            min={0}
            max={1000}
            step={20}
            color="success"
          />
        </View>
      ),
    },
  ],
};
