import { View } from "@tarojs/components";
import { AreaChart } from "panelui-taro/area-chart";
import type { AreaChartHandle } from "panelui-taro/area-chart";
import { Button } from "panelui-taro/button";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const DATA = [
  { date: "Mon", practice: 14, reading: 24 },
  { date: "Tue", practice: 28, reading: 36 },
  { date: "Wed", practice: 34, reading: 30 },
  { date: "Thu", practice: 26, reading: null },
  { date: "Fri", practice: 44, reading: 52 },
  { date: "Sat", practice: 38, reading: 42 },
  { date: "Sun", practice: 54, reading: 64 },
];
const LABELS = { practice: "Practice", reading: "Reading" };
export const AreaChartShowcase = () => {
  const ref = useRef<AreaChartHandle>(null);
  const [stacked, setStacked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [linear, setLinear] = useState(false);
  const [lastSelected, setLastSelected] = useState(-1);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography
        id="panel-area-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({ lastSelected, linear, loading, stacked })}
      </Typography>
      <AreaChart
        ref={ref}
        data={DATA}
        stacked={stacked}
        status={loading ? "loading" : "ready"}
        curve={linear ? "linear" : "monotone"}
        onActiveIndexChange={(index) => {
          if (index >= 0) {
            setLastSelected(index);
          }
        }}
        className="rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px]"
      >
        <AreaChart.Header
          title="Weekly learning"
          value="118 min"
          caption="Learning mix"
          labels={LABELS}
          legend
        />
        <AreaChart.Grid />
        <AreaChart.Area dataKey="reading" />
        <AreaChart.Area dataKey="practice" colorIndex={2} />
        <AreaChart.Skeleton />
        <AreaChart.XAxis />
        <AreaChart.YAxis />
        <AreaChart.Tooltip formatValue={(value) => `${value} min`} />
      </AreaChart>
      <Button
        id="panel-area-stack"
        variant="outline"
        onPress={() => setStacked((value) => !value)}
      >
        {stacked ? "Overlay bands" : "Stack bands"}
      </Button>
      <Button
        id="panel-area-loading"
        variant="outline"
        onPress={() => setLoading((value) => !value)}
      >
        {loading ? "Show bands" : "Loading state"}
      </Button>
      <Button
        id="panel-area-replay"
        variant="outline"
        onPress={() => ref.current?.replay()}
      >
        Replay reveal
      </Button>
      <Button
        id="panel-area-curve"
        variant="outline"
        onPress={() => setLinear((value) => !value)}
      >
        {linear ? "Monotone curve" : "Linear curve"}
      </Button>
    </View>
  );
};
