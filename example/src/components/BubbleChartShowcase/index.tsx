import { View } from "@tarojs/components";
import { BubbleChart } from "panelui-taro/bubble-chart";
import type {
  BubbleChartHandle,
  BubbleChartPoint,
} from "panelui-taro/bubble-chart";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { useRef, useState } from "react";

const DATA = [
  { efficiency: 20, people: 12, performance: 30, team: "A" },
  { efficiency: 60, people: 40, performance: 75, team: "B" },
  { efficiency: 40, people: 24, performance: 55, team: "C" },
  { efficiency: 75, people: 16, performance: 40, team: "D" },
  { efficiency: 30, people: 32, performance: 70, team: "E" },
];
export const BubbleChartShowcase = () => {
  const ref = useRef<BubbleChartHandle>(null);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState(true);
  const [active, setActive] = useState<BubbleChartPoint | null>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <BubbleChart
        ref={ref}
        data={DATA}
        xDataKey="efficiency"
        yDataKey="performance"
        sizeKey="people"
        labelKey="team"
        status={loading ? "loading" : "ready"}
        onActivePointChange={setActive}
      >
        <BubbleChart.Header
          title="Team comparison"
          value={active?.label ?? "Five teams"}
          caption="Circle area = people"
        />
        <BubbleChart.Grid />
        <BubbleChart.Quadrants
          labels={{
            bottomLeft: "Develop",
            bottomRight: "Efficient",
            topLeft: "Potential",
            topRight: "Leaders",
          }}
        />
        <BubbleChart.Trend />
        <BubbleChart.Bubbles />
        {labels ? <BubbleChart.Labels /> : null}
        <BubbleChart.SizeKey label="People" />
        <BubbleChart.XAxis label="Efficiency" />
        <BubbleChart.YAxis label="Performance" />
        <BubbleChart.Tooltip />
        <BubbleChart.Skeleton />
        {labels ? null : <BubbleChart.Legend />}
      </BubbleChart>
      <Text size="xs">{JSON.stringify(active)}</Text>
      <Button onPress={() => ref.current?.replay()}>Replay bubbles</Button>
      <Button onPress={() => setLoading(!loading)}>
        {loading ? "Show teams" : "Load bubbles"}
      </Button>
      <Button onPress={() => setLabels(!labels)}>
        {labels ? "Legend names" : "Circle names"}
      </Button>
    </View>
  );
};
