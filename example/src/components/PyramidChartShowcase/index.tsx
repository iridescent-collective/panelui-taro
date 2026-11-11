import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import {
  PyramidChart,
  usePyramidChart,
} from "panelui-taro/pyramid-chart";
import type {
  PyramidChartHandle,
  PyramidChartLabelPlacement,
} from "panelui-taro/pyramid-chart";
import { useRef, useState } from "react";

const DATA = [
  { female: 66, male: 73, name: "Adelie" },
  { female: 61, male: 52, name: "Gentoo" },
  { female: 27, male: 34, name: "Chinstrap" },
];
const PLACEMENTS: PyramidChartLabelPlacement[] = ["above", "center", "start"];
const Reading = () => {
  const selected = usePyramidChart();
  return (
    <Text size="xs" className="break-all">
      {JSON.stringify(selected)}
    </Text>
  );
};
Reading.layer = "header" as const;
export const PyramidChartShowcase = () => {
  const ref = useRef<PyramidChartHandle>(null);
  const [loading, setLoading] = useState(false);
  const [placement, setPlacement] = useState(0);
  return (
    <View className="flex flex-col gap-[24px]">
      <PyramidChart
        ref={ref}
        data={DATA}
        labelPlacement={PLACEMENTS[placement]}
        status={loading ? "loading" : "ready"}
      >
        <PyramidChart.Header title="Penguin population" value="313" legend />
        <PyramidChart.Grid />
        <PyramidChart.Bar dataKey="male" side="start" />
        <PyramidChart.Bar dataKey="female" side="end" />
        <PyramidChart.YAxis />
        <PyramidChart.XAxis />
        <PyramidChart.Tooltip />
        <PyramidChart.Skeleton />
        <Reading />
      </PyramidChart>
      <Button onPress={() => ref.current?.replay()}>Replay pyramid</Button>
      <Button onPress={() => setLoading(!loading)}>
        {loading ? "Show population" : "Load pyramid"}
      </Button>
      <Button onPress={() => setPlacement((placement + 1) % PLACEMENTS.length)}>
        Labels: {PLACEMENTS[placement]}
      </Button>
    </View>
  );
};
