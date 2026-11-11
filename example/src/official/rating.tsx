import { Rating } from "panelui-taro/rating";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function RatingDemo() {
  const [score, setScore] = useState(3);
  return (
    <View className="w-full gap-6">
      <Rating
        label="Rate your stay"
        showValue
        formatValue={(v) => `${v} / 5`}
        value={score}
        onValueChange={setScore}
      />

      <Rating precision={0.5} defaultValue={2.5} color="primary" />

      <Rating value={4.3} precision={0.5} readOnly size="sm" />
    </View>
  );
}
function RatingHapticsDemo() {
  const [score, setScore] = useState(4);
  return (
    <View className="w-full gap-6">
      <Rating
        label="Drag across the stars"
        showValue
        haptics
        allowClear
        value={score}
        onValueChange={setScore}
      />

      <Rating
        label="Half stars, same ticks"
        showValue
        haptics
        precision={0.5}
        defaultValue={2.5}
        color="primary"
      />
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "rating",
  name: "Rating",
  summary: "A row of stars to read or set a score",
  demos: [
    { label: "Interactive", render: () => <RatingDemo /> },
    { label: "Haptics", render: () => <RatingHapticsDemo /> },
    {
      label: "Half stars",
      render: () => (
        <View className="w-full gap-5">
          <Rating precision={0.5} defaultValue={3.5} />
          <Rating precision={0.5} defaultValue={2.5} color="primary" />
        </View>
      ),
    },
    {
      label: "Colors",
      render: () => (
        <View className="w-full gap-4">
          <Rating defaultValue={4} color="warning" />
          <Rating defaultValue={4} color="success" />
          <Rating defaultValue={4} color="destructive" />
          <Rating defaultValue={4} color="info" />
          <Rating defaultValue={4} color="foreground" />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-4">
          <Rating defaultValue={3} size="sm" />
          <Rating defaultValue={3} size="md" />
          <Rating defaultValue={3} size="lg" />
        </View>
      ),
    },
    {
      label: "Read-only & disabled",
      render: () => (
        <View className="w-full gap-4">
          <Rating value={4.3} precision={0.5} readOnly />
          <Rating max={10} defaultValue={7} size="sm" />
          <Rating defaultValue={3} disabled />
        </View>
      ),
    },
  ],
};
