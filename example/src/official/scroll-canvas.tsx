import { Text } from "panelui-taro/primitives/text";
import { ScrollCanvas } from "panelui-taro/scroll-canvas";
import { useMemo } from "react";

import { ScrollView, View } from "../runtime/native";
import { ScrollProgress } from "../runtime/native";
import { ComponentEntry } from "../types";
function ScrollGap({ label }: { label?: string }) {
  return (
    <View className="h-72 items-center justify-center">
      {label ? (
        <Text size="xs" muted className="tracking-wider uppercase">
          {label}
        </Text>
      ) : null}
    </View>
  );
}
const CANVAS_PHOTOS = [
  "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=900&q=60",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=60",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=60",
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=900&q=60",
];
function ScrollCanvasVersion({
  effect,
}: {
  effect: "parallax" | "zoom" | "reveal";
}) {
  return (
    <ScrollProgress className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollGap label={`scroll down — ${effect}`} />
        {CANVAS_PHOTOS.map((uri) => (
          <View key={uri} className="px-6">
            <ScrollCanvas source={{ uri }} effect={effect} />
            <ScrollGap />
          </View>
        ))}
        <ScrollGap label="that is all of them" />
      </ScrollView>
    </ScrollProgress>
  );
}
function ScrollCanvasSequenceVersion() {
  const sources = useMemo(() => CANVAS_PHOTOS.map((uri) => ({ uri })), []);
  return (
    <ScrollProgress className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollGap label="scroll slowly" />
        <View className="px-6">
          <ScrollCanvas
            effect="sequence"
            sources={sources}
            start={0.95}
            end={0.1}
          />
          <Text size="sm" muted className="pt-3">
            Four frames across one screen of scroll. Every frame stays mounted,
            so scrubbing back up never waits on a decode.
          </Text>
        </View>
        <ScrollGap label="that is all of it" />
      </ScrollView>
    </ScrollProgress>
  );
}
export const entry: ComponentEntry = {
  slug: "scroll-canvas",
  name: "ScrollCanvas",
  summary: "Image frame whose contents move as you scroll",
  demos: [
    {
      label: "Parallax",
      id: "parallax",
      fullPage: true,
      description:
        "The image drifts against the scroll inside a frame that stays put.",
      render: () => <ScrollCanvasVersion effect="parallax" />,
    },
    {
      label: "Zoom",
      id: "zoom",
      fullPage: true,
      description: "It settles from slightly oversized to its natural size.",
      render: () => <ScrollCanvasVersion effect="zoom" />,
    },
    {
      label: "Reveal",
      id: "reveal",
      fullPage: true,
      description: "A wipe uncovers it from the bottom edge up.",
      render: () => <ScrollCanvasVersion effect="reveal" />,
    },
    {
      label: "Sequence",
      id: "sequence",
      fullPage: true,
      description:
        "The scroll position picks a frame, so the thumb scrubs the animation.",
      render: () => <ScrollCanvasSequenceVersion />,
    },
  ],
};
