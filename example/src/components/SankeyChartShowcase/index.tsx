import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { SankeyChart } from "panelui-taro/sankey-chart";
import type { SankeyChartHandle } from "panelui-taro/sankey-chart";
import { useRef, useState } from "react";

const NODES = [
  { id: "Search" },
  { id: "Social" },
  { id: "Referral" },
  { id: "Landing" },
  { id: "Signup" },
  { id: "Exit" },
];
const LINKS = [
  { source: "Search", target: "Landing", value: 65 },
  { source: "Social", target: "Landing", value: 25 },
  { source: "Referral", target: "Landing", value: 10 },
  { source: "Landing", target: "Signup", value: 72 },
  { source: "Landing", target: "Exit", value: 28 },
];
const MANY_NODES = [
  { id: "Traffic" },
  ...Array.from({ length: 8 }, (_, i) => ({ id: `Campaign ${i + 1}` })),
];
const MANY_LINKS = MANY_NODES.slice(1).map((node, i) => ({
  source: "Traffic",
  target: node.id,
  value: 50 / (i + 1),
}));
export const SankeyChartShowcase = () => {
  const [vertical, setVertical] = useState(true);
  const [loading, setLoading] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const [bad, setBad] = useState(false);
  const [dropped, setDropped] = useState(0);
  const ref = useRef<SankeyChartHandle>(null);
  const nodes = collapse ? MANY_NODES : NODES;
  const base = collapse ? MANY_LINKS : LINKS;
  const links = bad
    ? [
        ...base,
        { source: nodes.at(-1)?.id ?? "", target: nodes[0].id, value: 10 },
      ]
    : base;
  return (
    <View className="flex flex-col gap-[24px]">
      <Text
        size="xs"
        muted
      >{`Dropped links: ${dropped} · choose a stage or a breakdown row`}</Text>
      <SankeyChart
        ref={ref}
        nodes={nodes}
        links={links}
        orientation={vertical ? "vertical" : "horizontal"}
        collapse={
          collapse ? { label: "Other campaigns", maxPerColumn: 3 } : undefined
        }
        status={loading ? "loading" : "ready"}
        onDropLinks={setDropped}
      >
        <SankeyChart.Header
          title="Traffic routing"
          value="100 visits"
          caption="Shared ribbon scale · lossless tail collapse"
        />
        <SankeyChart.Links />
        <SankeyChart.Nodes />
        <SankeyChart.Skeleton />
        <SankeyChart.Labels />
        <SankeyChart.Tooltip />
        <SankeyChart.Legend />
        <SankeyChart.Breakdown maxRows={3} />
      </SankeyChart>
      <View className="flex flex-row flex-wrap gap-[16px]">
        <Button onPress={() => setVertical((value) => !value)}>
          Orientation
        </Button>
        <Button
          variant="secondary"
          onPress={() => setLoading((value) => !value)}
        >
          Loading
        </Button>
        <Button
          variant="secondary"
          onPress={() => setCollapse((value) => !value)}
        >
          Collapse
        </Button>
        <Button variant="secondary" onPress={() => setBad((value) => !value)}>
          Cycle row
        </Button>
        <Button variant="ghost" onPress={() => ref.current?.replay()}>
          Replay
        </Button>
      </View>
    </View>
  );
};
