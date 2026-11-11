import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Loader } from "panelui-taro/loader";
import type { LoaderVariant } from "panelui-taro/loader";
import { PanelUIProvider } from "panelui-taro/provider";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const VARIANTS: LoaderVariant[] = [
  "pulse-dots",
  "bounce-dots",
  "pulsating-dots",
  "liquid-dots",
  "bar-cascade",
  "bouncing-bars",
  "symmetric-wave",
  "morph-ring",
  "wave-physics",
];
export const LoaderShowcase = () => {
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const variant = VARIANTS[index] ?? "pulse-dots";
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">Loader · 九种源动画</Typography.Heading>
      <View className="flex flex-row gap-[16px]">
        <Button
          variant="outline"
          onPress={() => setIndex((index + 1) % VARIANTS.length)}
        >
          下一种动画
        </Button>
        <Button variant="outline" onPress={() => setSpeed(speed === 1 ? 2 : 1)}>
          当前速度 {speed}×
        </Button>
      </View>
      <Typography id="panel-loader-variant">{variant}</Typography>
      <View className="flex h-[240px] items-center justify-center rounded-xl bg-[var(--panel-muted)]">
        <Loader variant={variant} size="lg" speed={speed} label={variant} />
      </View>
      <Typography.Heading type="h4">减少动态时的固定形态</Typography.Heading>
      <PanelUIProvider reducedMotion background={false}>
        <View className="grid grid-cols-2 gap-[24px]">
          {VARIANTS.map((item) => (
            <View
              key={item}
              className="flex min-h-[200px] flex-col items-center justify-center gap-[24px] rounded-xl border-[2px] border-solid border-[var(--panel-border)] p-[16px]"
            >
              <Loader variant={item} label={item} />
              <Typography className="text-[20px]">{item}</Typography>
            </View>
          ))}
        </View>
      </PanelUIProvider>
    </View>
  );
};
