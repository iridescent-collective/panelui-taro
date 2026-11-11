import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { RingChart } from "panelui-taro/ring-chart";
import type { RingChartHandle } from "panelui-taro/ring-chart";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const DATA = [
  { label: "Reading", maxValue: 60, value: 42 },
  { label: "Practice", maxValue: 20, value: 12 },
  { label: "Walk", maxValue: 60, value: 30 },
];
export const RingChartShowcase = () => {
  const ref = useRef<RingChartHandle>(null);
  const [active, setActive] = useState(-1);
  const [gauge, setGauge] = useState(false);
  const [segmented, setSegmented] = useState(false);
  const [compact, setCompact] = useState(false);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography
        id="panel-ring-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({ active, compact, gauge, segmented })}
      </Typography>
      <RingChart
        ref={ref}
        data={DATA}
        size={compact ? 160 : 240}
        startAngle={gauge ? -90 : 0}
        endAngle={gauge ? 90 : 360}
        onActiveIndexChange={setActive}
        className="rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px] pb-[180px]"
      >
        <RingChart.Header
          title="Today’s goals"
          value="42 min"
          caption="Each target is independent"
        />
        <RingChart.Ring index={0} segments={segmented ? 12 : undefined} />
        <RingChart.Ring index={1} segments={segmented ? 12 : undefined} />
        <RingChart.Ring index={2} segments={segmented ? 12 : undefined} />
        <RingChart.Center />
        <RingChart.Legend className="top-full bottom-auto pt-[24px]" />
      </RingChart>
      <Button
        id="panel-ring-gauge"
        variant="outline"
        onPress={() => setGauge((value) => !value)}
      >
        {gauge ? "Closed rings" : "Open gauge"}
      </Button>
      <Button
        id="panel-ring-segments"
        variant="outline"
        onPress={() => setSegmented((value) => !value)}
      >
        {segmented ? "Smooth arcs" : "Segmented rings"}
      </Button>
      <Button
        id="panel-ring-size"
        variant="outline"
        onPress={() => setCompact((value) => !value)}
      >
        Toggle small hole
      </Button>
      <Button
        id="panel-ring-replay"
        variant="outline"
        onPress={() => ref.current?.replay()}
      >
        Replay sweep
      </Button>
    </View>
  );
};
