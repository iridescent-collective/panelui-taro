import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { WaterfallChart } from "panelui-taro/waterfall-chart";
import type {
  WaterfallChartHandle,
  WaterfallStep,
} from "panelui-taro/waterfall-chart";
import { useRef, useState } from "react";

const DATA = [
  { label: "Opening", total: true, value: 100 },
  { label: "Sales", value: 40 },
  { label: "Expenses", value: -70 },
  { label: "Closing", total: true, value: 0 },
];
export const WaterfallChartShowcase = () => {
  const ref = useRef<WaterfallChartHandle>(null);
  const [loading, setLoading] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const [active, setActive] = useState<WaterfallStep | null>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <WaterfallChart
        ref={ref}
        data={DATA}
        orientation={horizontal ? "horizontal" : "vertical"}
        status={loading ? "loading" : "ready"}
        onActiveIndexChange={(_index, step) => setActive(step)}
      >
        <WaterfallChart.Header
          title="Balance bridge"
          value={String(active?.end ?? 70)}
          legend
        />
        <WaterfallChart.Grid />
        <WaterfallChart.Connectors />
        <WaterfallChart.Bars />
        <WaterfallChart.Values />
        <WaterfallChart.XAxis />
        <WaterfallChart.YAxis />
        <WaterfallChart.Tooltip />
        <WaterfallChart.Skeleton />
      </WaterfallChart>
      <Text size="xs">{JSON.stringify(active)}</Text>
      <Button onPress={() => ref.current?.replay()}>Replay waterfall</Button>
      <Button onPress={() => setLoading(!loading)}>
        {loading ? "Show bridge" : "Load waterfall"}
      </Button>
      <Button onPress={() => setHorizontal(!horizontal)}>
        {horizontal ? "Vertical bars" : "Horizontal bars"}
      </Button>
    </View>
  );
};
