import { ScrollView, View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import {
  HeatmapChart,
  buildHeatmapCalendar,
} from "panelui-taro/heatmap-chart";
import type { HeatmapCell } from "panelui-taro/heatmap-chart";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

const ENTRIES = Array.from({ length: 91 }, (_, index) => ({
  count: index % 5 === 0 ? 0 : (index * 7) % 23,
  date: new Date(2026, 6, index + 1),
}));
const DATA = buildHeatmapCalendar(ENTRIES, {
  end: new Date(2026, 8, 30),
  start: new Date(2026, 6, 1),
  weekStartDay: 1,
});
export const HeatmapChartShowcase = () => {
  const [fluid, setFluid] = useState(false);
  const [blue, setBlue] = useState(false);
  const [active, setActive] = useState<HeatmapCell | null>(null);
  const [lastActive, setLastActive] = useState<HeatmapCell | null>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <ScrollView scrollX className="w-full">
        <HeatmapChart
          data={DATA}
          layout={fluid ? "fluid" : "fill"}
          color={blue ? "--color-chart-2" : undefined}
          weekStartDay={1}
          onActiveCellChange={(cell) => {
            setActive(cell);
            if (cell) {
              setLastActive(cell);
            }
          }}
          style={
            fluid
              ? {
                  width: `${(DATA.length * 12 + (DATA.length - 1) * 3 + 26) * 2}rpx`,
                }
              : undefined
          }
        >
          <HeatmapChart.Header
            title="Contributions"
            value={active ? String(active.count) : "Summer"}
          />
          <HeatmapChart.XAxis />
          <HeatmapChart.YAxis />
          <HeatmapChart.Separator />
          <HeatmapChart.Cells />
          <HeatmapChart.Tooltip />
          <HeatmapChart.Legend />
        </HeatmapChart>
      </ScrollView>
      <Text size="xs">{JSON.stringify({ active, lastActive })}</Text>
      <Button onPress={() => setFluid(!fluid)}>
        {fluid ? "Fill grid" : "Fluid grid"}
      </Button>
      <Button onPress={() => setBlue(!blue)}>
        {blue ? "Default ramp" : "Blue token ramp"}
      </Button>
    </View>
  );
};
