import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Compare } from "panelui-taro/compare";
import { Frame } from "panelui-taro/frame";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const GRADES = {
  before: {
    sky: "#8794a3",
    sun: "#c9cdd2",
    far: "#6b7684",
    near: "#4a545f",
    field: "#39414a",
  },
  after: {
    sky: "#f2a65a",
    sun: "#ffe9b0",
    far: "#b9683f",
    near: "#7d3f34",
    field: "#43231f",
  },
} as const;
const READOUT_START = 0.38;
function CompareScene({ grade }: { grade: keyof typeof GRADES }) {
  const tone = GRADES[grade];
  return (
    <View style={{ flex: 1, backgroundColor: tone.sky, overflow: "hidden" }}>
      <View
        style={{
          position: "absolute",
          top: "16%",
          left: "42%",
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: tone.sun,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "46%",
          bottom: "36%",
          backgroundColor: tone.far,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "64%",
          bottom: "22%",
          backgroundColor: tone.near,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "22%",
          backgroundColor: tone.field,
        }}
      />
    </View>
  );
}
function CompareBasicVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Drag the seam</Frame.Title>
          <Frame.Action>Anywhere</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Compare height={280} className="rounded-none">
            <Compare.After>
              <CompareScene grade="after" />
            </Compare.After>
            <Compare.Before>
              <CompareScene grade="before" />
            </Compare.Before>
            <Compare.Handle />
            <Compare.Label side="start">Before</Compare.Label>
            <Compare.Label side="end">After</Compare.Label>
          </Compare>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function CompareControlledVersion() {
  const [split, setSplit] = useState(0.5);
  return (
    <View className="flex-1 justify-center gap-3 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Driven from outside</Frame.Title>
          <Frame.Action>{`${Math.round(split * 100)}%`}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Compare
            height={260}
            value={split}
            onValueChange={setSplit}
            className="rounded-none"
          >
            <Compare.After>
              <CompareScene grade="after" />
            </Compare.After>
            <Compare.Before>
              <CompareScene grade="before" />
            </Compare.Before>
            <Compare.Handle />
            <Compare.Label side="start">Before</Compare.Label>
            <Compare.Label side="end">After</Compare.Label>
          </Compare>
        </Frame.Panel>
      </Frame>
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          onPress={() => setSplit(0)}
          className="flex-1"
        >
          After
        </Button>
        <Button
          variant="outline"
          onPress={() => setSplit(0.5)}
          className="flex-1"
        >
          Half
        </Button>
        <Button
          variant="outline"
          onPress={() => setSplit(1)}
          className="flex-1"
        >
          Before
        </Button>
      </View>
    </View>
  );
}
function gradeStage(percent: number): string {
  if (percent <= 0) return "Straight off the sensor";
  if (percent < 34) return "A first pass";
  if (percent < 67) return "Half graded";
  if (percent < 100) return "Nearly the full grade";
  return "The full grade";
}
function CompareReadoutVersion() {
  const [box, setBox] = useState(0);
  const [split, setSplit] = useState(READOUT_START);
  const percent = Math.round((1 - split) * 100);
  return (
    <View
      className="flex-1"
      onLayout={(event: import("../runtime/native").LayoutChangeEvent) => {
        const next = Math.round(event.nativeEvent.layout.height);
        if (next !== box) setBox(next);
      }}
    >
      {box > 0 ? (
        <Compare
          height={box}
          defaultValue={READOUT_START}
          onValueChange={setSplit}
          className="rounded-none"
        >
          <Compare.After>
            <CompareScene grade="after" />
          </Compare.After>
          <Compare.Before>
            <CompareScene grade="before" />
          </Compare.Before>

          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center"
          >
            <View className="bg-foreground/80 items-center gap-1 rounded-2xl px-6 py-4">
              <Text size="3xl" weight="semibold" className="text-background">
                {`${percent}%`}
              </Text>
              <Text size="sm" weight="medium" className="text-background/70">
                {gradeStage(percent)}
              </Text>
            </View>
          </View>

          <Compare.Handle>
            <View className="bg-background h-12 w-1.5 rounded-full" />
          </Compare.Handle>
        </Compare>
      ) : null}
    </View>
  );
}
function CompareVerticalDemo() {
  return (
    <Card className="w-full overflow-hidden">
      <Card.Content className="p-0">
        <Compare height={180} orientation="vertical" className="rounded-none">
          <Compare.After>
            <CompareScene grade="after" />
          </Compare.After>
          <Compare.Before>
            <CompareScene grade="before" />
          </Compare.Before>
          <Compare.Handle />
          <Compare.Label side="start">Before</Compare.Label>
          <Compare.Label side="end">After</Compare.Label>
        </Compare>
      </Card.Content>
    </Card>
  );
}
function CompareStartDemo() {
  return (
    <Card className="w-full overflow-hidden">
      <Card.Content className="p-0">
        <Compare height={180} defaultValue={0.15} className="rounded-none">
          <Compare.After>
            <CompareScene grade="after" />
          </Compare.After>
          <Compare.Before>
            <CompareScene grade="before" />
          </Compare.Before>
          <Compare.Handle />
          <Compare.Label side="start">Before</Compare.Label>
          <Compare.Label side="end">After</Compare.Label>
        </Compare>
      </Card.Content>
    </Card>
  );
}
function CompareFrozenDemo() {
  return (
    <Card className="w-full overflow-hidden">
      <Card.Content className="p-0">
        <Compare
          height={160}
          defaultValue={0.5}
          disabled
          className="rounded-none"
        >
          <Compare.After>
            <CompareScene grade="after" />
          </Compare.After>
          <Compare.Before>
            <CompareScene grade="before" />
          </Compare.Before>
          <Compare.Handle />
          <Compare.Label side="start">Before</Compare.Label>
          <Compare.Label side="end">After</Compare.Label>
        </Compare>
        <Text size="xs" muted className="px-4 pt-3 pb-4">
          `disabled` freezes the seam and takes it out of the accessibility
          tree.
        </Text>
      </Card.Content>
    </Card>
  );
}
export const entry: ComponentEntry = {
  slug: "compare",
  name: "Compare",
  summary: "Two versions of one picture, with a seam you drag across it",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "Drag anywhere on the frame, not just the knob. The two sides stay in place under the seam rather than scaling with it.",
      render: () => <CompareBasicVersion />,
    },
    {
      label: "Driven from outside",
      id: "controlled",
      fullPage: true,
      description:
        "A controlled seam. The buttons set it, dragging still moves it, and the prop stands back while a finger is down.",
      render: () => <CompareControlledVersion />,
    },
    {
      label: "A readout in the middle",
      id: "readout",
      fullPage: true,
      description:
        "The seam fills the screen and a panel over the middle of it names what is on show. It changes as the seam moves, so the number and the picture are never saying different things.",
      render: () => <CompareReadoutVersion />,
    },
    {
      label: "A seam that runs the other way",
      render: () => <CompareVerticalDemo />,
    },
    { label: "Where the seam starts", render: () => <CompareStartDemo /> },
    { label: "Frozen", render: () => <CompareFrozenDemo /> },
  ],
};
