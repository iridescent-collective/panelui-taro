import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { TextAnimation } from "panelui-taro/text-animation";
import { useState } from "react";

const PHRASES = ["Read", "Learn", "Grow"];
export const TextAnimationShowcase = () => {
  const [value, setValue] = useState(120);
  const [run, setRun] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [done, setDone] = useState(0);
  return (
    <View className="flex flex-col gap-[32px]">
      <TextAnimation
        key={run}
        enabled={enabled}
        className="flex-col items-start gap-[24px]"
      >
        <Text>Typing</Text>
        <TextAnimation.Typing
          text={PHRASES}
          hold={700}
          caret
          onDone={() => setDone((count) => count + 1)}
        />
        <Text>Rotating</Text>
        <TextAnimation.Rotating text={PHRASES} weight="bold" />
        <Text>Counting</Text>
        <TextAnimation.Counting value={value} weight="bold" />
        <Text>Sliding</Text>
        <TextAnimation.Sliding
          value={value + 0.25}
          decimals={2}
          padStart={4}
          weight="bold"
        />
        <Text>Scrolling</Text>
        <TextAnimation.Scrolling
          value={value}
          step={10}
          around={2}
          highlight
          weight="bold"
        />
      </TextAnimation>
      <Text size="xs">{JSON.stringify({ done, enabled, value })}</Text>
      <Button onPress={() => setValue((current) => current + 20)}>
        Add twenty
      </Button>
      <Button onPress={() => setRun((current) => current + 1)}>
        Replay text
      </Button>
      <Button onPress={() => setEnabled(!enabled)}>
        {enabled ? "Pause motion" : "Resume motion"}
      </Button>
    </View>
  );
};
