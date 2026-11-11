import { BarChart } from "panelui-taro/bar-chart";
import { Frame } from "panelui-taro/frame";
import { Tooltip } from "panelui-taro/tooltip";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const BAR_REVENUE = [
  { month: "Jan", revenue: 12000, costs: 7400 },
  { month: "Feb", revenue: 15500, costs: 8100 },
  { month: "Mar", revenue: 14200, costs: 8800 },
  { month: "Apr", revenue: 18900, costs: 9200 },
  { month: "May", revenue: 21400, costs: 10100 },
  { month: "Jun", revenue: 19800, costs: 11300 },
  { month: "Jul", revenue: 24600, costs: 11900 },
  { month: "Aug", revenue: 26100, costs: 12400 },
];
const CHANNELS = [
  { name: "Email", sent: 4820 },
  { name: "Push", sent: 3140 },
  { name: "SMS", sent: 1960 },
  { name: "In-app", sent: 1420 },
  { name: "Web", sent: 880 },
];
const CHART_HEADER = "px-4 pt-3.5";
const BAR_TOTALS = BAR_REVENUE.reduce(
  (running, month) => ({
    revenue: running.revenue + month.revenue,
    costs: running.costs + month.costs,
  }),
  { revenue: 0, costs: 0 }
);
const money = (value: number) => `£${value.toLocaleString()}`;
function BarChartGroupedVersion() {
  const [active, setActive] = useState<(typeof BAR_REVENUE)[number] | null>(
    null
  );
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Revenue and costs</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BarChart
            data={BAR_REVENUE}
            xDataKey="month"
            aspectRatio={2}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof BAR_REVENUE)[number] | null)
            }
          >
            <BarChart.Header
              className={CHART_HEADER}
              value={money(active ? active.revenue : BAR_TOTALS.revenue)}
              caption={
                active
                  ? `${active.month} · ${money(active.costs)} out`
                  : `8 months · ${money(BAR_TOTALS.costs)} out`
              }
              labels={{ revenue: "Revenue", costs: "Costs" }}
              legend
            />
            <BarChart.Grid />
            <BarChart.Bar dataKey="revenue" />
            <BarChart.Bar dataKey="costs" colorIndex={2} />
            <BarChart.XAxis />
            <BarChart.Tooltip formatValue={money} />
          </BarChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BarChartStackedVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Stacked</Frame.Title>
          <Frame.Action>Same two series</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BarChart
            data={BAR_REVENUE}
            xDataKey="month"
            stacked
            stackGap={2}
            aspectRatio={2}
          >
            <BarChart.Header
              className={CHART_HEADER}
              value={money(BAR_TOTALS.revenue + BAR_TOTALS.costs)}
              caption="A total, not a comparison"
              labels={{ revenue: "Revenue", costs: "Costs" }}
              legend
            />
            <BarChart.Grid />
            <BarChart.Bar dataKey="costs" colorIndex={2} />
            <BarChart.Bar dataKey="revenue" />
            <BarChart.XAxis />
          </BarChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BarChartHorizontalVersion() {
  const sent = CHANNELS.reduce((total, channel) => total + channel.sent, 0);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Messages sent</Frame.Title>
          <Frame.Action>Last 30 days</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BarChart
            data={CHANNELS}
            xDataKey="name"
            orientation="horizontal"
            aspectRatio={1.7}
            barGap={0.35}
          >
            <BarChart.Header
              className={CHART_HEADER}
              value={sent.toLocaleString()}
              caption="Sideways · names have room"
            />
            <BarChart.Grid />
            <BarChart.Bar dataKey="sent" colorIndex={3} />
            <BarChart.YAxis />
            <BarChart.Tooltip />
          </BarChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "bar-chart",
  name: "BarChart",
  summary: "Categories compared by length, grouped or stacked",
  layout: "pager",
  demos: [
    {
      label: "Grouped",
      id: "grouped",
      fullPage: true,
      description: "Two series side by side, compared by length.",
      render: () => <BarChartGroupedVersion />,
    },
    {
      label: "Stacked",
      id: "stacked",
      fullPage: true,
      description:
        "The same two series read as a total instead of as a comparison.",
      render: () => <BarChartStackedVersion />,
    },
    {
      label: "Sideways",
      id: "horizontal",
      fullPage: true,
      description: "Horizontal bars, for category names that need the room.",
      render: () => <BarChartHorizontalVersion />,
    },
  ],
};
