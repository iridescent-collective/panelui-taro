import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Soundwave } from "panelui-taro/soundwave";
import { useThemeToken } from "panelui-taro/theme";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const LEVELS = [
  0.1, 0.2, 0.7, 0.4, 0.9, 0.5, 0.2, 0.6, 1, 0.7, 0.3, 0.2, 0.4, 0.8, 0.6, 0.1,
];
export const SoundwaveShowcase = () => {
  const from = useThemeToken("chart-1");
  const to = useThemeToken("chart-2");
  const palette = [from, to];
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0.5);
  return (
    <View className="flex flex-col gap-[24px]">
      <View className="flex flex-row gap-[16px]">
        <Button
          className="panel-wave-pause"
          variant="outline"
          onPress={() => setPaused(!paused)}
        >
          {paused ? "继续" : "暂停"}
        </Button>
        <Button
          className="panel-wave-progress"
          variant="outline"
          onPress={() => setProgress(progress >= 1 ? 0 : progress + 0.25)}
        >
          播放 {Math.round(progress * 100)}%
        </Button>
      </View>
      <Typography>pills · listening</Typography>
      <Soundwave id="panel-wave-pills" paused={paused} />
      <Typography>bars · scrolling</Typography>
      <Soundwave
        id="panel-wave-bars"
        variant="bars"
        mode="scrolling"
        paused={paused}
      />
      <Typography>recording · progress + gradient</Typography>
      <Soundwave
        id="panel-wave-recording"
        variant="bars"
        levels={LEVELS}
        progress={progress}
        gradient={palette}
        fadeEdges
      />
      <Typography>line · speaking</Typography>
      <Soundwave
        id="panel-wave-line"
        variant="line"
        state="speaking"
        gradient={palette}
        paused={paused}
      />
      <View className="relative h-[260px] overflow-hidden rounded-[32px] border-[2px] border-solid border-[var(--panel-border)]">
        <Soundwave
          id="panel-wave-ambient"
          variant="ambient"
          radius={16}
          paused={paused}
        />
        <View className="relative flex h-full items-center justify-center">
          <Typography>ambient · info</Typography>
        </View>
      </View>
    </View>
  );
};
