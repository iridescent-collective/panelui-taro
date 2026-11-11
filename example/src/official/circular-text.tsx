import { Button } from "panelui-taro/button";
import { CircularText } from "panelui-taro/circular-text";
import { Text } from "panelui-taro/primitives/text";
import { Spinner } from "panelui-taro/spinner";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function CircularTextSealVersion() {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center justify-center">
        <CircularText
          radius={110}
          textClassName="text-base font-bold tracking-[0.2em]"
        >
          PANELUI · COMPONENTS FOR REACT NATIVE ·
        </CircularText>

        <Text size="3xl" weight="bold" className="absolute">
          P
        </Text>
      </View>
    </View>
  );
}
function CircularTextRingsVersion() {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center justify-center">
        <CircularText
          radius={130}
          textClassName="text-base font-bold tracking-[0.25em]"
        >
          OUTER RING · OUTER RING · OUTER RING ·
        </CircularText>
        <View className="absolute">
          <CircularText
            reverse
            radius={86}
            spinDuration={14000}
            textClassName="text-sm font-medium tracking-widest"
          >
            INNER · INNER · INNER ·
          </CircularText>
        </View>
      </View>
    </View>
  );
}
function CircularTextArcVersion() {
  return (
    <View className="flex-1 items-center justify-center gap-10">
      <CircularText
        radius={100}
        spread={200}
        startAngle={-100}
        textClassName="text-lg font-semibold tracking-wider"
      >
        ARRIVING SHORTLY
      </CircularText>
    </View>
  );
}
function CircularTextBadgeVersion() {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center justify-center">
        <CircularText
          radius={62}
          spinDuration={16000}
          textClassName="text-[10px] font-bold tracking-[0.18em]"
        >
          NEW THIS WEEK ·
        </CircularText>
        <Text size="2xl" weight="bold" className="absolute">
          12
        </Text>
      </View>
    </View>
  );
}
function CircularTextLoadingVersion() {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center justify-center">
        <CircularText
          radius={78}
          spinDuration={9000}
          textClassName="text-xs font-semibold tracking-[0.3em]"
        >
          GENERATING · GENERATING ·
        </CircularText>
        <View className="absolute">
          <Spinner size="lg" label="Generating" />
        </View>
      </View>
    </View>
  );
}
function CircularTextPausedDemo() {
  const [paused, setPaused] = useState(false);
  return (
    <View className="w-full items-center gap-4">
      <CircularText
        paused={paused}
        radius={82}
        textClassName="text-sm font-semibold tracking-widest"
      >
        HOLD TO STOP · HOLD TO STOP ·
      </CircularText>
      <Button variant="outline" onPress={() => setPaused((value) => !value)}>
        {paused ? "Resume" : "Pause"}
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "circular-text",
  name: "CircularText",
  summary: "Text set around a circle, turning",
  demos: [
    {
      label: "A seal",
      id: "seal",
      fullPage: true,
      description:
        "A full turn, with a mark stacked in the centre the ring leaves empty.",
      render: () => <CircularTextSealVersion />,
    },
    {
      label: "Two rings",
      id: "rings",
      fullPage: true,
      description: "An outer ring and an inner one turning against each other.",
      render: () => <CircularTextRingsVersion />,
    },
    {
      label: "An arc",
      id: "arc",
      fullPage: true,
      description: "Less than a full turn, starting where you put it.",
      render: () => <CircularTextArcVersion />,
    },
    {
      label: "A badge",
      id: "badge",
      fullPage: true,
      description: "The ring at badge size, wrapped round a count.",
      render: () => <CircularTextBadgeVersion />,
    },
    {
      label: "A loading ring",
      id: "loading",
      fullPage: true,
      description: "A slow ring of text around a spinner that is not slow.",
      render: () => <CircularTextLoadingVersion />,
    },
    { label: "Holding it still", render: () => <CircularTextPausedDemo /> },
  ],
};
