import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { Skeleton } from "panelui-taro/skeleton";
import { Tooltip } from "panelui-taro/tooltip";
import {
  TreemapChart,
  type TreemapDatum,
} from "panelui-taro/treemap-chart";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const money = (value: number) => `£${value.toLocaleString()}`;
const CLOUD_SPEND: TreemapDatum[] = [
  { label: "Compute", value: 18400 },
  { label: "Storage", value: 9250 },
  { label: "Bandwidth", value: 6100 },
  { label: "Database", value: 5480 },
  { label: "Logging", value: 3120 },
  { label: "Queues", value: 2640 },
  { label: "Email", value: 1810 },
  { label: "CDN", value: 1400 },
];
const TRAFFIC_BY_COUNTRY: TreemapDatum[] = [
  { label: "United States", value: 48200 },
  { label: "Germany", value: 21400 },
  { label: "India", value: 18900 },
  { label: "Brazil", value: 12600 },
  { label: "France", value: 9800 },
  { label: "Japan", value: 8400 },
  { label: "Canada", value: 7200 },
  { label: "Australia", value: 5100 },
  ...[
    "Spain",
    "Italy",
    "Netherlands",
    "Sweden",
    "Poland",
    "Mexico",
    "Norway",
    "Denmark",
    "Portugal",
    "Ireland",
    "Finland",
    "Austria",
    "Belgium",
    "Chile",
  ].map((label, index) => ({ label, value: 4200 - index * 260 })),
];
const BUDGET: TreemapDatum[] = [
  { label: "Salaries", value: 412000 },
  { label: "Contractors", value: 96000, color: "#ef4444" },
  { label: "Tooling", value: 58000 },
  { label: "Travel", value: 31000 },
  { label: "Training", value: 18500 },
  { label: "Events", value: 12400 },
];
const BUDGET_SORTED = [...BUDGET].sort((a, b) => b.value - a.value);
const CLOUD_TOTAL = CLOUD_SPEND.reduce((sum, part) => sum + part.value, 0);
function TreemapBasicVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Cloud spend</Frame.Title>
          <Frame.Action>March</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <TreemapChart data={CLOUD_SPEND} className="px-3 pb-4">
            <TreemapChart.Header
              className={CHART_HEADER}
              title="Total this month"
              value={money(CLOUD_TOTAL)}
              caption="Compute is 38% of it"
            />
            <TreemapChart.Tiles />
            <TreemapChart.Labels formatValue={money} />
            <TreemapChart.Tooltip formatValue={money} />
          </TreemapChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function TreemapLongTailVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Sessions by country</Frame.Title>
          <Frame.Action>Last 30 days</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <TreemapChart
            data={TRAFFIC_BY_COUNTRY}
            maxTiles={9}
            otherLabel="Rest of world"
            className="px-3 pb-4"
          >
            <TreemapChart.Header
              className={CHART_HEADER}
              title="Sessions"
              value="196,320"
            />
            <TreemapChart.Tiles />
            <TreemapChart.Labels showShare />
            <TreemapChart.Tooltip />
            <TreemapChart.Legend className="px-1" limit={6} />
          </TreemapChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function TreemapSelectionVersion() {
  const [selected, setSelected] = useState(-1);
  const picked = selected >= 0 ? BUDGET_SORTED[selected] : null;
  const total = BUDGET.reduce((sum, part) => sum + part.value, 0);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Budget</Frame.Title>
          <Frame.Action>FY26</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <TreemapChart
            data={BUDGET}
            activeIndex={selected}
            onActiveIndexChange={setSelected}
            className="px-3 pb-4"
          >
            <TreemapChart.Header
              className={CHART_HEADER}
              title={picked ? picked.label : "Committed"}
              value={money(picked ? picked.value : total)}
              caption={
                picked ? "Tap it again to clear" : "Tap a tile to pick one out"
              }
            />
            <TreemapChart.Tiles dimOpacity={0.2} />
            <TreemapChart.Labels formatValue={money} />
            <TreemapChart.Legend className="px-1" />
          </TreemapChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function TreemapLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 500);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Cloud spend</Frame.Title>
          <Frame.Action>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setStatus("loading")}
            >
              Reload
            </Button>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <TreemapChart
            data={status === "loading" ? [] : CLOUD_SPEND}
            status={status}
            className="px-3 pb-4"
          >
            <TreemapChart.Header
              className={CHART_HEADER}
              title="Total this month"
              value={status === "loading" ? "—" : money(CLOUD_TOTAL)}
            />
            <TreemapChart.Skeleton />
            <TreemapChart.Tiles />
            <TreemapChart.Labels formatValue={money} />
          </TreemapChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "treemap-chart",
  name: "TreemapChart",
  summary: "A total, cut into the parts it is made of, sized by area",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description: "Eight parts of one bill, each labelled with what it cost.",
      render: () => <TreemapBasicVersion />,
    },
    {
      label: "Long tail",
      id: "long-tail",
      fullPage: true,
      description:
        "Twenty-two countries, eight named and the rest gathered into one tile.",
      render: () => <TreemapLongTailVersion />,
    },
    {
      label: "Selection",
      id: "selection",
      fullPage: true,
      description:
        "One line in its own colour, and the header reading whichever tile is picked.",
      render: () => <TreemapSelectionVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "One plain box while it waits, because an invented split is a lie.",
      render: () => <TreemapLoadingVersion />,
    },
  ],
};
