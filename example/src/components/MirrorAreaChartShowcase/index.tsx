import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { MirrorAreaChart } from "panelui-taro/mirror-area-chart";
import type { MirrorAreaChartHandle } from "panelui-taro/mirror-area-chart";
import { useRef, useState } from "react";

const FIRST = [
  { date: "Mon", high: 65, share: 40, total: 100 },
  { date: "Tue", high: 90, share: 65, total: 140 },
  { date: "Wed", high: 55, share: 50, total: 110 },
  { date: "Thu", high: 110, share: 75, total: 165 },
  { date: "Fri", high: 70, share: 56, total: 125 },
];
const SECOND = FIRST.map((row, i) => ({
  ...row,
  high: i === 2 ? null : row.high * 0.6,
  share: row.share * 0.8,
  total: row.total * 0.7,
}));
export const MirrorAreaChartShowcase = () => {
  const ref = useRef<MirrorAreaChartHandle>(null);
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState(false);
  const [summary, setSummary] = useState(false);
  const [split, setSplit] = useState(0.55);
  return (
    <View className="flex flex-col gap-[24px]">
      <MirrorAreaChart
        ref={ref}
        data={changed ? SECOND : FIRST}
        split={split}
        status={loading ? "loading" : "ready"}
        bottomDomain={[0, 100]}
      >
        <MirrorAreaChart.Header
          title="Queue load"
          value="125 jobs · 56% high"
          caption="Independent scales · same timeline"
        />
        <MirrorAreaChart.Grid variant={lines ? "lines" : "dots"} />
        <MirrorAreaChart.Area dataKey="total" label="Total jobs" muted />
        <MirrorAreaChart.Area dataKey="high" label="High priority" />
        <MirrorAreaChart.Area
          dataKey="share"
          label="High %"
          side="bottom"
          colorIndex={2}
        />
        <MirrorAreaChart.Baseline />
        <MirrorAreaChart.Skeleton />
        <MirrorAreaChart.XAxis />
        <MirrorAreaChart.YAxis
          formatBottom={(value) => `${Math.round(value)}%`}
        />
        <MirrorAreaChart.Tooltip
          formatSummary={
            summary
              ? (row) => `${row.total} jobs · ${row.share}% high`
              : undefined
          }
        />
      </MirrorAreaChart>
      <View className="flex flex-row flex-wrap gap-[16px]">
        <Button onPress={() => setChanged((value) => !value)}>
          Change data
        </Button>
        <Button
          variant="secondary"
          onPress={() => setLoading((value) => !value)}
        >
          Loading
        </Button>
        <Button variant="secondary" onPress={() => setLines((value) => !value)}>
          Grid
        </Button>
        <Button
          variant="secondary"
          onPress={() => setSummary((value) => !value)}
        >
          Summary
        </Button>
        <Button
          variant="secondary"
          onPress={() => setSplit((value) => (value === 0.55 ? 0.7 : 0.55))}
        >
          Split
        </Button>
        <Button variant="ghost" onPress={() => ref.current?.replay()}>
          Replay
        </Button>
      </View>
    </View>
  );
};
