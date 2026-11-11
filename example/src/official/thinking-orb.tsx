import { Avatar } from "panelui-taro/avatar";
import { Item } from "panelui-taro/item";
import { Message } from "panelui-taro/message";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";
import { Shimmer } from "panelui-taro/shimmer";
import { Slider } from "panelui-taro/slider";
import { Switch } from "panelui-taro/switch";
import { ThinkingOrb } from "panelui-taro/thinking-orb";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const ORB_STATES = [
  ["working", "Running a task"],
  ["searching", "Looking something up"],
  ["solving", "Working a problem out"],
  ["listening", "Taking input"],
  ["composing", "Writing a reply"],
  ["shaping", "Forming a structure"],
] as const;
function ThinkingOrbStatesVersion() {
  return (
    <ScrollView
      contentContainerClassName="px-5 py-4"
      showsVerticalScrollIndicator={false}
    >
      <Item.Group>
        {ORB_STATES.map(([state, caption], index) => (
          <View key={state}>
            {index > 0 ? <Item.Separator /> : null}
            <Item>
              <Item.Media>
                <ThinkingOrb state={state} size={56} />
              </Item.Media>
              <Item.Content>
                <Item.Title>{state}</Item.Title>
                <Item.Description>{caption}</Item.Description>
              </Item.Content>
            </Item>
          </View>
        ))}
      </Item.Group>
    </ScrollView>
  );
}
function ThinkingOrbInlineVersion() {
  return (
    <ScrollView contentContainerClassName="gap-4 px-5 py-4">
      <Message>
        <Message.Avatar>
          <Avatar size="sm" fallback="AI" />
        </Message.Avatar>
        <Message.Content>
          <Message.Bubble>
            <View className="flex-row items-center gap-2">
              <ThinkingOrb state="searching" size={20} />
              <Shimmer>Searching the docs…</Shimmer>
            </View>
          </Message.Bubble>
        </Message.Content>
      </Message>

      {ORB_STATES.map(([state]) => (
        <View key={state} className="flex-row items-center gap-2">
          <ThinkingOrb state={state} size={20} />
          <Text size="sm" muted>
            {state}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
function ThinkingOrbControlsVersion() {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  return (
    <View className="flex-1 justify-center gap-8 px-5">
      <View className="items-center">
        <ThinkingOrb state="working" size={140} speed={speed} paused={paused} />
      </View>
      <Slider
        label="Speed"
        showValue
        formatValue={(value) => `${value.toFixed(1)}×`}
        min={0.2}
        max={3}
        step={0.1}
        value={speed}
        onValueChange={setSpeed}
      />
      <View className="flex-row items-center justify-between">
        <Text>Paused</Text>

        <Switch value={paused} onValueChange={setPaused} />
      </View>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "thinking-orb",
  name: "ThinkingOrb",
  summary: "Dotted orb saying which kind of busy an agent is",
  demos: [
    {
      label: "The six states",
      id: "states",
      fullPage: true,
      description: "Each one side by side, at the large tuning.",
      render: () => <ThinkingOrbStatesVersion />,
    },
    {
      label: "Inline in a reply",
      id: "inline",
      fullPage: true,
      description: "The small tuning, sitting in a line of chat text.",
      render: () => <ThinkingOrbInlineVersion />,
    },
    {
      label: "Speed and pause",
      id: "controls",
      fullPage: true,
      description: "What `speed` and `paused` do to a running orb.",
      render: () => <ThinkingOrbControlsVersion />,
    },
  ],
};
