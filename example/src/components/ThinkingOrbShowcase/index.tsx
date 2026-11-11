import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { ThinkingOrb } from "panelui-taro/thinking-orb";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const STATES = [
  "working",
  "searching",
  "solving",
  "listening",
  "composing",
  "shaping",
] as const;
export const ThinkingOrbShowcase = () => {
  const [paused, setPaused] = useState(false);
  const [small, setSmall] = useState(false);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography.Heading type="h3">ThinkingOrb · 六种状态</Typography.Heading>
      <View className="flex flex-row gap-[16px]">
        <Button
          className="panel-orb-pause"
          variant="outline"
          onPress={() => setPaused(!paused)}
        >
          {paused ? "继续" : "暂停"}
        </Button>
        <Button variant="outline" onPress={() => setSmall(!small)}>
          {small ? "64px" : "20px"}
        </Button>
      </View>
      <View className="grid grid-cols-3 gap-[32px]">
        {STATES.map((state) => (
          <View
            key={state}
            className="flex h-[220px] flex-col items-center justify-center gap-[16px]"
          >
            <ThinkingOrb
              id={`panel-orb-${state}`}
              state={state}
              size={small ? 20 : 64}
              paused={paused}
            />
            <Typography>{state}</Typography>
          </View>
        ))}
      </View>
      <View className="flex flex-row items-center gap-[24px]">
        <ThinkingOrb state="listening" size={32} paused />
        <ThinkingOrb state="shaping" size={33} paused />
        <ThinkingOrb state="searching" size={96} paused />
      </View>
    </View>
  );
};
