import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { ScatterChart } from "panelui-taro/scatter-chart";
import type {
  ScatterChartHandle,
  ScatterChartPoint,
} from "panelui-taro/scatter-chart";
import { useRef, useState } from "react";

const DATA = [
  { cost: 10, people: 5, revenue: 20, x: 10 },
  { cost: 25, people: 12, revenue: 50, x: 20 },
  { cost: 40, people: 30, revenue: 70, x: 35 },
  { cost: 55, people: 18, revenue: 90, x: 50 },
  { cost: 75, people: 24, revenue: 85, x: 60 },
];
export const ScatterChartShowcase = () => {
  const ref = useRef<ScatterChartHandle>(null);
  const [loading, setLoading] = useState(false);
  const [sized, setSized] = useState(false);
  const [active, setActive] = useState<ScatterChartPoint | null>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <ScatterChart
        ref={ref}
        data={DATA}
        status={loading ? "loading" : "ready"}
        onActivePointChange={setActive}
      >
        <ScatterChart.Header
          title="Session outcomes"
          value={active ? `${active.x} · ${active.y}` : "Two series"}
          legend
        />
        <ScatterChart.Grid />
        <ScatterChart.Points
          dataKey="revenue"
          sizeKey={sized ? "people" : undefined}
        />
        <ScatterChart.Points
          dataKey="cost"
          colorIndex={2}
          sizeKey={sized ? "people" : undefined}
        />
        <ScatterChart.XAxis />
        <ScatterChart.YAxis />
        <ScatterChart.Tooltip />
        <ScatterChart.Skeleton />
      </ScatterChart>
      <Text size="xs">{JSON.stringify(active)}</Text>
      <Button onPress={() => ref.current?.replay()}>Replay scatter</Button>
      <Button onPress={() => setLoading(!loading)}>
        {loading ? "Show points" : "Load scatter"}
      </Button>
      <Button onPress={() => setSized(!sized)}>
        {sized ? "Fixed points" : "Size by people"}
      </Button>
    </View>
  );
};
