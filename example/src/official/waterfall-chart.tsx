import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { Skeleton } from "panelui-taro/skeleton";
import { Tooltip } from "panelui-taro/tooltip";
import {
  WaterfallChart,
  type WaterfallDatum,
  waterfallSteps,
} from "panelui-taro/waterfall-chart";
import { useEffect, useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const REVENUE_BRIDGE: WaterfallDatum[] = [
  { label: "Q3", value: 482000, total: true },
  { label: "New", value: 96400 },
  { label: "Expansion", value: 41200 },
  { label: "Churn", value: -58700 },
  { label: "Downgrade", value: -19300 },
  { label: "Q4", value: 0, total: true },
];
const CASH_FLOW: WaterfallDatum[] = [
  { label: "Opening", value: 128000, total: true },
  { label: "Receipts", value: 74500 },
  { label: "Payroll", value: -61200 },
  { label: "Hosting", value: -14800 },
  { label: "Marketing", value: -22400 },
  { label: "Tax", value: -18600 },
  { label: "Closing", value: 0, total: true },
];
const dollars = (value: number) =>
  `${value < 0 ? "−" : ""}$${Math.abs(Math.round(value)).toLocaleString()}`;
function WaterfallBasicVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Revenue</Frame.Title>
          <Frame.Action>Q3 to Q4</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <WaterfallChart data={REVENUE_BRIDGE} className="px-2 pb-4">
            <WaterfallChart.Header
              className={CHART_HEADER}
              title="Closing"
              value={dollars(541600)}
              caption="Up $59,600 on the quarter"
              legend
            />
            <WaterfallChart.Grid />
            <WaterfallChart.Connectors />
            <WaterfallChart.Bars />
            <WaterfallChart.XAxis />
            <WaterfallChart.Tooltip />
          </WaterfallChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function WaterfallValuesVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Revenue</Frame.Title>
          <Frame.Action>Labelled</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <WaterfallChart
            data={REVENUE_BRIDGE}
            aspectRatio={1.5}
            className="px-2 pb-4"
          >
            <WaterfallChart.Header
              className={CHART_HEADER}
              title="Q4 revenue"
              value={dollars(541600)}
              caption="Each bar is what that line moved"
            />
            <WaterfallChart.Grid />
            <WaterfallChart.YAxis />
            <WaterfallChart.Connectors />
            <WaterfallChart.Bars />
            <WaterfallChart.Values />
            <WaterfallChart.XAxis />
            <WaterfallChart.Tooltip />
          </WaterfallChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function WaterfallSidewaysVersion() {
  return (
    <ScrollView contentContainerClassName="grow justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Cash</Frame.Title>
          <Frame.Action>March</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <WaterfallChart
            data={CASH_FLOW}
            orientation="horizontal"
            aspectRatio={0.95}
            className="px-2 pb-4"
          >
            <WaterfallChart.Header
              className={CHART_HEADER}
              title="Closing balance"
              value={dollars(85500)}
              caption="Down $42,500 on the month"
              legend
            />
            <WaterfallChart.Grid />
            <WaterfallChart.Connectors />
            <WaterfallChart.Bars />
            <WaterfallChart.YAxis />
            <WaterfallChart.Tooltip />
          </WaterfallChart>
        </Frame.Panel>
      </Frame>
    </ScrollView>
  );
}
function WaterfallReadoutVersion() {
  const [active, setActive] = useState(-1);
  const step = active >= 0 ? waterfallSteps(CASH_FLOW)[active] : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Cash</Frame.Title>
          <Frame.Action>Drag the chart</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <WaterfallChart
            data={CASH_FLOW}
            aspectRatio={1.6}
            onActiveIndexChange={setActive}
            className="px-2 pb-4"
          >
            <WaterfallChart.Header
              className={CHART_HEADER}
              title={step ? step.label : "Closing balance"}
              value={dollars(step ? step.value : 85500)}
              caption={
                step
                  ? step.kind === "total"
                    ? "A reading, not a change"
                    : `Balance after: ${dollars(step.end)}`
                  : "Seven lines, opening to closing"
              }
            />
            <WaterfallChart.Grid />
            <WaterfallChart.Connectors />
            <WaterfallChart.Bars />
            <WaterfallChart.XAxis ticks={4} />
            <WaterfallChart.Tooltip />
          </WaterfallChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function WaterfallLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 500);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Revenue</Frame.Title>
          <Frame.Action>
            {status === "loading" ? "Loading" : "Q3 to Q4"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <WaterfallChart
            data={REVENUE_BRIDGE}
            status={status}
            className="px-2 pb-4"
          >
            <WaterfallChart.Header
              className={CHART_HEADER}
              title="Closing"
              value={status === "loading" ? "—" : dollars(541600)}
              caption={
                status === "loading" ? "Fetching" : "Up $59,600 on the quarter"
              }
            />
            <WaterfallChart.Grid />
            <WaterfallChart.Skeleton />
            <WaterfallChart.Connectors />
            <WaterfallChart.Bars />
            <WaterfallChart.XAxis />
            <WaterfallChart.Tooltip />
          </WaterfallChart>
        </Frame.Panel>
      </Frame>

      <Button variant="secondary" onPress={() => setStatus("loading")}>
        Load again
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "waterfall-chart",
  name: "WaterfallChart",
  summary: "How a run of changes carried one total to another",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "Two totals on the baseline, four changes floating between them.",
      render: () => <WaterfallBasicVersion />,
    },
    {
      label: "Values",
      id: "values",
      fullPage: true,
      description:
        "Every change written at the end of its bar, signed, over a value axis.",
      render: () => <WaterfallValuesVersion />,
    },
    {
      label: "Sideways",
      id: "sideways",
      fullPage: true,
      description:
        "Seven steps down the side, because seven names do not fit across a phone.",
      render: () => <WaterfallSidewaysVersion />,
    },
    {
      label: "Reading a step",
      id: "readout",
      fullPage: true,
      description:
        "The header follows the finger — the step held, or the closing balance.",
      render: () => <WaterfallReadoutVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "Equal stubs on the baseline, because invented balances cannot be unseen.",
      render: () => <WaterfallLoadingVersion />,
    },
  ],
};
