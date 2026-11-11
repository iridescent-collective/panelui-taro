import { Text } from "panelui-taro/primitives/text";
import { ScrollText } from "panelui-taro/scroll-text";

import { ScrollView, View } from "../runtime/native";
import { ScrollProgress } from "../runtime/native";
import { ComponentEntry } from "../types";
const SCROLL_LINES = [
  "Every control ships with its accessibility wiring already done.",
  "Animations run on the UI thread, so a busy list never drops them.",
  "Semantic tokens mean a theme swap moves every component at once.",
  "Overlays mount lazily and unmount once they have finished leaving.",
];
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
function ScrollTextVersion({
  effect,
}: {
  effect: "color" | "fade" | "rise" | "highlight";
}) {
  return (
    <ScrollProgress className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollGap label={`scroll down — ${effect}`} />
        {SCROLL_LINES.map((line) => (
          <View key={line} className="px-6">
            <ScrollText effect={effect} size="2xl" weight="semibold">
              {line}
            </ScrollText>
            <ScrollGap />
          </View>
        ))}
        <ScrollGap label="that is all of them" />
      </ScrollView>
    </ScrollProgress>
  );
}
function ScrollTextCharactersVersion() {
  return (
    <ScrollProgress className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollGap label="scroll down" />
        <View className="px-6">
          <ScrollText by="character" stagger={0.12} size="3xl" weight="bold">
            One character at a time.
          </ScrollText>
        </View>
        <ScrollGap />
        <View className="px-6">
          <ScrollText stagger={0.9} size="3xl" weight="bold">
            And one where the whole line arrives at once.
          </ScrollText>
        </View>
        <ScrollGap label="that is all of them" />
      </ScrollView>
    </ScrollProgress>
  );
}
export const entry: ComponentEntry = {
  slug: "scroll-text",
  name: "ScrollText",
  summary: "Text that resolves word by word as you scroll",
  demos: [
    {
      label: "Colour",
      id: "color",
      fullPage: true,
      description:
        "Each word crossfades from muted to foreground as the line passes.",
      render: () => <ScrollTextVersion effect="color" />,
    },
    {
      label: "Fade",
      id: "fade",
      fullPage: true,
      description:
        "Words come up from nearly transparent, without reflowing the line.",
      render: () => <ScrollTextVersion effect="fade" />,
    },
    {
      label: "Rise",
      id: "rise",
      fullPage: true,
      description:
        "Words lift into place — a wrapping row, since nested text cannot transform.",
      render: () => <ScrollTextVersion effect="rise" />,
    },
    {
      label: "Highlight",
      id: "highlight",
      fullPage: true,
      description: "A background sweeps behind the line as it resolves.",
      render: () => <ScrollTextVersion effect="highlight" />,
    },
    {
      label: "Splitting and stagger",
      id: "splitting",
      fullPage: true,
      description:
        "By character, and with a stagger wide enough to arrive all at once.",
      render: () => <ScrollTextCharactersVersion />,
    },
  ],
};
