import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { TreemapChart } from "panelui-taro/treemap-chart";
import type { TreemapChartHandle } from "panelui-taro/treemap-chart";
import { useRef, useState } from "react";

const DATA = [
  { label: "Hosting", value: 120 },
  { label: "Tools", value: 70 },
  { label: "Travel", value: 40 },
  { label: "Supplies", value: 25 },
  { label: "Subscriptions", value: 18 },
  { label: "Storage", value: 12 },
  { label: "Other", value: 8 },
];
export const TreemapChartShowcase = () => {
  const [loading, setLoading] = useState(false);
  const [gather, setGather] = useState(false);
  const [share, setShare] = useState(false);
  const ref = useRef<TreemapChartHandle>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <TreemapChart
        ref={ref}
        data={DATA}
        maxTiles={gather ? 4 : undefined}
        status={loading ? "loading" : "ready"}
      >
        <TreemapChart.Header
          title="Spend"
          value="293"
          caption="Tap labels, legend or small tiles"
        />
        <TreemapChart.Tiles />
        <TreemapChart.Skeleton />
        <TreemapChart.Labels showShare={share} />
        <TreemapChart.Tooltip />
        <TreemapChart.Legend />
      </TreemapChart>
      <View className="flex flex-row flex-wrap gap-[16px]">
        <Button onPress={() => setLoading((value) => !value)}>Loading</Button>
        <Button
          variant="secondary"
          onPress={() => setGather((value) => !value)}
        >
          Gather tail
        </Button>
        <Button variant="secondary" onPress={() => setShare((value) => !value)}>
          Shares
        </Button>
        <Button variant="ghost" onPress={() => ref.current?.replay()}>
          Replay
        </Button>
      </View>
    </View>
  );
};
