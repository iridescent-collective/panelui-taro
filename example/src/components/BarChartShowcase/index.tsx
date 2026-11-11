import { View } from "@tarojs/components";
import { BarChart } from "panelui-taro/bar-chart";
import type { BarChartHandle } from "panelui-taro/bar-chart";
import { Button } from "panelui-taro/button";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const DATA = [
  { name: "Mon", practice: 14, reading: 24 },
  { name: "Tue", practice: 28, reading: 36 },
  { name: "Wed", practice: 34, reading: 30 },
  { name: "Thu", practice: 26, reading: null },
  { name: "Fri", practice: 44, reading: 52 },
];
const LABELS = { practice: "Practice", reading: "Reading" };
export const BarChartShowcase = () => {
  const ref = useRef<BarChartHandle>(null);
  const [stacked, setStacked] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSelected, setLastSelected] = useState(-1);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography
        id="panel-bar-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({ horizontal, lastSelected, loading, stacked })}
      </Typography>
      <BarChart
        ref={ref}
        data={DATA}
        stacked={stacked}
        orientation={horizontal ? "horizontal" : "vertical"}
        status={loading ? "loading" : "ready"}
        onActiveIndexChange={(index) => {
          if (index >= 0) {
            setLastSelected(index);
          }
        }}
        className="rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px]"
      >
        <BarChart.Header
          title="Learning by day"
          value="52 min"
          caption="Category comparison"
          labels={LABELS}
          legend
        />
        <BarChart.Grid />
        <BarChart.Bar dataKey="reading" />
        <BarChart.Bar dataKey="practice" colorIndex={2} />
        <BarChart.Skeleton />
        <BarChart.XAxis />
        <BarChart.YAxis />
        <BarChart.Tooltip formatValue={(value) => `${value} min`} />
      </BarChart>
      <Button
        id="panel-bar-stack"
        variant="outline"
        onPress={() => setStacked((value) => !value)}
      >
        {stacked ? "Group bars" : "Stack bars"}
      </Button>
      <Button
        id="panel-bar-orientation"
        variant="outline"
        onPress={() => setHorizontal((value) => !value)}
      >
        {horizontal ? "Vertical bars" : "Horizontal bars"}
      </Button>
      <Button
        id="panel-bar-loading"
        variant="outline"
        onPress={() => setLoading((value) => !value)}
      >
        {loading ? "Show bars" : "Loading state"}
      </Button>
      <Button
        id="panel-bar-replay"
        variant="outline"
        onPress={() => ref.current?.replay()}
      >
        Replay grow-in
      </Button>
    </View>
  );
};
