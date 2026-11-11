import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { HexChart } from "panelui-taro/hex-chart";
import type { HexChartHandle } from "panelui-taro/hex-chart";
import { Text } from "panelui-taro/primitives/text";
import { useRef, useState } from "react";

const DATA = [
  { label: "Direct", value: 100 },
  { label: "Search", value: 60 },
  { label: "Referral", value: 10 },
];
export const HexChartShowcase = () => {
  const ref = useRef<HexChartHandle>(null);
  const [loading, setLoading] = useState(false);
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState(-1);
  return (
    <View className="flex flex-col gap-[24px]">
      <HexChart
        ref={ref}
        data={DATA}
        shape={grid ? "grid" : "blob"}
        status={loading ? "loading" : "ready"}
        onActiveIndexChange={setActive}
      >
        <HexChart.Header
          title="Attributed revenue"
          value={active >= 0 ? String(DATA[active]?.value) : "170"}
        />
        <HexChart.Cells />
        <HexChart.Tooltip showCells />
        <HexChart.Skeleton />
        <HexChart.Legend />
      </HexChart>
      <Text size="xs">Active series: {active}</Text>
      <Button onPress={() => ref.current?.replay()}>Replay honeycomb</Button>
      <Button onPress={() => setLoading(!loading)}>
        {loading ? "Show split" : "Load hex chart"}
      </Button>
      <Button onPress={() => setGrid(!grid)}>
        {grid ? "Blob field" : "Grid field"}
      </Button>
    </View>
  );
};
