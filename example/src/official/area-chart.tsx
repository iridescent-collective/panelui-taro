import { AreaChart } from "panelui-taro/area-chart";
import { Frame } from "panelui-taro/frame";
import { Tooltip } from "panelui-taro/tooltip";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const AREA_TRAFFIC = Array.from({ length: 24 }, (_unused, hour) => {
  const shape = Math.sin(((hour - 4) / 24) * Math.PI * 2) * 0.5 + 0.5;
  return {
    hour: `${String(hour).padStart(2, "0")}:00`,
    direct: Math.round(120 + shape * 380),
    search: Math.round(80 + shape * 520),
    social: Math.round(40 + shape * 190),
  };
});
const CHART_HEADER = "px-4 pt-3.5";
function AreaChartStackedVersion() {
  const [active, setActive] = useState<(typeof AREA_TRAFFIC)[number] | null>(
    null
  );
  const day = AREA_TRAFFIC.reduce(
    (total, hour) => total + hour.direct + hour.search + hour.social,
    0
  );
  const total = active ? active.direct + active.search + active.social : day;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Sessions by channel</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <AreaChart
            data={AREA_TRAFFIC}
            xDataKey="hour"
            stacked
            aspectRatio={1.9}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof AREA_TRAFFIC)[number] | null)
            }
          >
            <AreaChart.Header
              className={CHART_HEADER}
              value={total.toLocaleString()}
              caption={active ? `${active.hour} · this hour` : "Across the day"}
              labels={{ direct: "Direct", search: "Search", social: "Social" }}
              legend
            />
            <AreaChart.Grid />
            <AreaChart.Area dataKey="direct" />
            <AreaChart.Area dataKey="search" colorIndex={2} />
            <AreaChart.Area dataKey="social" colorIndex={3} />
            <AreaChart.XAxis ticks={5} />
            <AreaChart.Tooltip />
          </AreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function AreaChartOverlaidVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Two plans compared</Frame.Title>
          <Frame.Action>Peak hour</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <AreaChart data={AREA_TRAFFIC} xDataKey="hour" aspectRatio={1.9}>
            <AreaChart.Header
              className={CHART_HEADER}
              value="600"
              caption="Unstacked · bands overlay"
              labels={{ direct: "Direct", search: "Search" }}
              legend
            />
            <AreaChart.Grid />
            <AreaChart.Area dataKey="search" colorIndex={2} />
            <AreaChart.Area dataKey="direct" />
            <AreaChart.XAxis ticks={5} />
            <AreaChart.YAxis />
            <AreaChart.Tooltip />
          </AreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "area-chart",
  name: "AreaChart",
  summary: "Filled bands over time, stacked or overlaid",
  layout: "pager",
  demos: [
    {
      label: "Stacked",
      id: "stacked",
      fullPage: true,
      description: "The top edge is the total; each band is its share of it.",
      render: () => <AreaChartStackedVersion />,
    },
    {
      label: "Overlaid",
      id: "overlaid",
      fullPage: true,
      description:
        "Alternatives rather than parts, so the fills go translucent.",
      render: () => <AreaChartOverlaidVersion />,
    },
  ],
};
