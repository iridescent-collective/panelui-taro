import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { HexChart } from "panelui-taro/hex-chart";
import { Skeleton } from "panelui-taro/skeleton";
import { Tooltip } from "panelui-taro/tooltip";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const money = (value: number) => `£${value.toLocaleString()}`;
const ATTRIBUTION = [
  { label: "Stir in strength", value: 3420 },
  { label: "Healthier every day", value: 1880 },
  { label: "Iron boost Q3", value: 840 },
  { label: "Ambassador program", value: 610 },
];
const ATTRIBUTED = ATTRIBUTION.reduce(
  (total, source) => total + source.value,
  0
);
function HexChartAttributionVersion() {
  const [active, setActive] = useState(-1);
  const source = active >= 0 ? ATTRIBUTION[active] : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Attributed revenue</Frame.Title>
          <Frame.Action>View full report</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HexChart
            data={ATTRIBUTION}
            activeIndex={active}
            onActiveIndexChange={setActive}
          >
            <HexChart.Header
              className={CHART_HEADER}
              value={money(source ? source.value : ATTRIBUTED)}
              caption={source ? source.label : "Across four campaigns"}
            />
            <HexChart.Cells />
            <HexChart.Tooltip formatValue={money} showCells />
            <HexChart.Legend className="px-4 pb-3.5" />
          </HexChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function HexChartWaffleVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Attributed revenue</Frame.Title>
          <Frame.Action>Every cell used</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HexChart
            data={ATTRIBUTION}
            shape="grid"
            columns={16}
            aspectRatio={1.8}
          >
            <HexChart.Header
              className={CHART_HEADER}
              value={money(ATTRIBUTED)}
              caption="One cell is about half a percent"
            />
            <HexChart.Cells />
            <HexChart.Tooltip formatValue={money} />
            <HexChart.Legend className="px-4 pb-3.5" />
          </HexChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function HexChartLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Attributed revenue</Frame.Title>
          <Frame.Action>
            {status === "loading" ? "Loading" : "Live"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HexChart data={ATTRIBUTION} status={status}>
            <HexChart.Header
              className={CHART_HEADER}
              value={status === "loading" ? "—" : money(ATTRIBUTED)}
              caption="Across four campaigns"
            />
            <HexChart.Skeleton />
            <HexChart.Cells />
            <HexChart.Legend className="px-4 pb-3.5" />
          </HexChart>
        </Frame.Panel>
      </Frame>

      <Button
        variant="outline"
        onPress={() => setStatus(status === "loading" ? "ready" : "loading")}
      >
        {status === "loading" ? "Load the split" : "Back to loading"}
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "hex-chart",
  name: "HexChart",
  summary: "A whole broken into parts, counted out in cells",
  layout: "pager",
  demos: [
    {
      label: "Attribution",
      id: "attribution",
      fullPage: true,
      description:
        "Press a cell or a key entry, and the readout follows the selection.",
      render: () => <HexChartAttributionVersion />,
    },
    {
      label: "Waffle",
      id: "waffle",
      fullPage: true,
      description:
        "Reading order and every cell used, for a split worth counting off.",
      render: () => <HexChartWaffleVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "The field is drawn before the split is known, and the colours fill in.",
      render: () => <HexChartLoadingVersion />,
    },
  ],
};
