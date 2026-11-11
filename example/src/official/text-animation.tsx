import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { TextAnimation } from "panelui-taro/text-animation";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const price = (value: number) => `$${value.toFixed(2)}`;
function Replay({ children }: { children: (run: number) => ReactNode }) {
  const [run, setRun] = useState(0);
  return (
    <View className="w-full items-center gap-4">
      {children(run)}
      <Button variant="outline" size="sm" onPress={() => setRun((n) => n + 1)}>
        Play again
      </Button>
    </View>
  );
}
function TypingDemo() {
  return (
    <Replay>
      {(run) => (
        <View key={run} className="h-16 w-full justify-center">
          <TextAnimation.Typing
            text="Everything ships with its accessibility wiring already done."
            size="lg"
            weight="medium"
            caret
          />
        </View>
      )}
    </Replay>
  );
}
function TypingCycleDemo() {
  return (
    <View className="h-16 w-full justify-center">
      <TextAnimation.Typing
        text={["fast by default", "native where it counts", "yours to change"]}
        size="lg"
        weight="medium"
        caret
        loop
      />
    </View>
  );
}
function RotatingDemo() {
  return (
    <View className="w-full flex-row items-center justify-center gap-2">
      <Text size="xl" weight="semibold">
        Built for
      </Text>
      <TextAnimation.Rotating
        text={["Expo", "React Native", "you"]}
        size="xl"
        weight="semibold"
        className="text-info-foreground"
      />
    </View>
  );
}
function CountingDemo() {
  return (
    <Replay>
      {(run) => (
        <View key={run} className="w-full flex-row justify-around">
          <View className="items-center gap-1">
            <TextAnimation.Counting value={2048} size="3xl" weight="semibold" />
            <Text size="sm" muted>
              Installs
            </Text>
          </View>
          <View className="items-center gap-1">
            <TextAnimation.Counting
              value={99.4}
              decimals={1}
              size="3xl"
              weight="semibold"
              formatOptions={{ style: "percent", maximumFractionDigits: 1 }}
            />
            <Text size="sm" muted>
              Uptime
            </Text>
          </View>
        </View>
      )}
    </Replay>
  );
}
function SlidingDemo() {
  const [total, setTotal] = useState(1024);
  return (
    <View className="w-full items-center gap-4">
      <TextAnimation.Sliding
        value={total}
        thousandSeparator=","
        size="3xl"
        weight="semibold"
      />
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onPress={() => setTotal((n) => Math.max(0, n - 137))}
        >
          −137
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() => setTotal((n) => n + 137)}
        >
          +137
        </Button>
        <Button variant="outline" size="sm" onPress={() => setTotal(1024)}>
          Reset
        </Button>
      </View>
    </View>
  );
}
function SlidingPriceDemo() {
  const [price, setPrice] = useState(24.99);
  return (
    <View className="w-full items-center gap-4">
      <View className="flex-row items-center">
        <Text size="2xl" weight="semibold">
          $
        </Text>
        <TextAnimation.Sliding
          value={price}
          decimals={2}
          size="2xl"
          weight="semibold"
        />
        <Text size="sm" muted className="ms-2">
          /month
        </Text>
      </View>
      <ToggleButtonGroup
        selectionMode="single"
        value={[price === 24.99 ? "monthly" : "yearly"]}
        onValueChange={(next) => setPrice(next[0] === "yearly" ? 19.16 : 24.99)}
      >
        <ToggleButton id="monthly">Monthly</ToggleButton>
        <ToggleButton id="yearly">Yearly</ToggleButton>
      </ToggleButtonGroup>
    </View>
  );
}
function ScrollingDemo() {
  return (
    <Replay>
      {(run) => (
        <View key={run} className="w-full items-center gap-3">
          <TextAnimation.Scrolling
            value={120}
            step={10}
            size="2xl"
            weight="semibold"
            highlight
            className="w-28"
          />
          <Text size="sm" muted>
            Minutes this week
          </Text>
        </View>
      )}
    </Replay>
  );
}
function TextAnimationGroupDemo() {
  return (
    <Replay>
      {(run) => (
        <TextAnimation key={run} duration={900} delay={200} className="gap-2">
          <TextAnimation.Counting value={48} size="2xl" weight="semibold" />
          <Text size="2xl" weight="semibold">
            of
          </Text>
          <TextAnimation.Counting value={60} size="2xl" weight="semibold" />
          <Text size="2xl" muted>
            done
          </Text>
        </TextAnimation>
      )}
    </Replay>
  );
}
export const entry: ComponentEntry = {
  slug: "text-animation",
  name: "TextAnimation",
  summary: "Five ways a piece of text or a number arrives",
  demos: [
    { label: "Typing", render: () => <TypingDemo /> },
    { label: "Typing a cycle", render: () => <TypingCycleDemo /> },
    { label: "Rotating", render: () => <RotatingDemo /> },
    { label: "Counting", render: () => <CountingDemo /> },
    { label: "Sliding", render: () => <SlidingDemo /> },
    { label: "Sliding a price", render: () => <SlidingPriceDemo /> },
    { label: "Scrolling", render: () => <ScrollingDemo /> },
    { label: "Shared configuration", render: () => <TextAnimationGroupDemo /> },
  ],
};
