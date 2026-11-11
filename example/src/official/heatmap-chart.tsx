import { Frame } from "panelui-taro/frame";
import {
  HeatmapChart,
  type HeatmapCell,
  type HeatmapColumn,
  buildHeatmapCalendar,
} from "panelui-taro/heatmap-chart";
import { Separator } from "panelui-taro/separator";
import { Tooltip } from "panelui-taro/tooltip";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
function heatmapYear(days = 371, seed = 7) {
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const end = new Date(2026, 6, 23);
  const entries: {
    date: Date;
    count: number;
  }[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(end);
    date.setDate(date.getDate() - offset);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const roll = random();
    const count = weekend
      ? roll > 0.75
        ? Math.floor(roll * 6)
        : 0
      : roll > 0.12
        ? Math.floor(roll * 18)
        : 0;
    entries.push({ date, count });
  }
  return entries;
}
const HEATMAP_YEAR = buildHeatmapCalendar(heatmapYear(), { weekStartDay: 1 });
const HEATMAP_QUARTER = HEATMAP_YEAR.slice(-13);
const HEATMAP_TOTAL = HEATMAP_YEAR.reduce(
  (running, column) =>
    running + column.bins.reduce((sum, cell) => sum + cell.count, 0),
  0
);
function HeatmapContributionVersion() {
  const [active, setActive] = useState<HeatmapCell | null>(null);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Contributions</Frame.Title>
          <Frame.Action>Hold to read</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HeatmapChart data={[]} className={CHART_HEADER}>
            <HeatmapChart.Header
              value={
                active ? `${active.count}` : HEATMAP_TOTAL.toLocaleString()
              }
              caption={
                active
                  ? (active.date?.toDateString() ?? "—")
                  : "Contributions in the last year"
              }
              legend
            />
          </HeatmapChart>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 pb-4"
          >
            <HeatmapChart
              data={HEATMAP_YEAR}
              weekStartDay={1}
              binSize={13}
              onActiveCellChange={setActive}
            >
              <HeatmapChart.XAxis />
              <HeatmapChart.YAxis />
              <HeatmapChart.Cells />
              <HeatmapChart.Tooltip />
            </HeatmapChart>
          </ScrollView>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function HeatmapFillVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Last 13 weeks</Frame.Title>
          <Frame.Action>layout=&quot;fill&quot;</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="p-4">
            <HeatmapChart
              data={HEATMAP_QUARTER}
              layout="fill"
              weekStartDay={1}
              gap={4}
            >
              <HeatmapChart.XAxis />
              <HeatmapChart.YAxis />
              <HeatmapChart.Cells cornerRadius={3} />
              <HeatmapChart.Tooltip />
              <HeatmapChart.Legend />
            </HeatmapChart>
          </View>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function HeatmapQuartersVersion() {
  const success = useCSSVariable("--color-success");
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Deploys by quarter</Frame.Title>
          <Frame.Action>Rules every 13</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HeatmapChart data={[]} className={CHART_HEADER}>
            <HeatmapChart.Header
              title="Deploys"
              caption="A ramp off one colour rather than the chart token"
            />
          </HeatmapChart>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 pb-4"
          >
            <HeatmapChart
              data={HEATMAP_YEAR}
              weekStartDay={1}
              binSize={11}
              color={typeof success === "string" ? success : undefined}
            >
              <HeatmapChart.XAxis />
              <HeatmapChart.YAxis
                tickFilter="all"
                labelFormat="initial"
                width={16}
              />
              <HeatmapChart.Separator every="quarter" dashArray="2,3" />
              <HeatmapChart.Cells />
              <HeatmapChart.Tooltip />
            </HeatmapChart>
          </ScrollView>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
const HOURS = ["00", "06", "12", "18"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function punchcardWeek(): HeatmapColumn[] {
  let state = 19;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  return WEEKDAYS.map((_, day) => ({
    bin: day,
    bins: HOURS.map((_hour, slot) => {
      const roll = random();
      const weekend = day >= 5;
      const working = slot === 1 || slot === 2;
      const peak = weekend ? (slot === 2 ? 0.45 : 0.1) : working ? 1 : 0.18;
      return { bin: slot, count: Math.floor(roll * 20 * peak) };
    }),
  }));
}
const HEATMAP_PUNCHCARD = punchcardWeek();
function HeatmapPunchcardVersion() {
  const [active, setActive] = useState<HeatmapCell | null>(null);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Support load</Frame.Title>
          <Frame.Action>By hour</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="p-4">
            <HeatmapChart
              data={HEATMAP_PUNCHCARD}
              layout="fill"
              rows={HOURS.length}
              gap={4}
              onActiveCellChange={setActive}
            >
              <HeatmapChart.Header
                title="Tickets opened"
                value={active ? `${active.count}` : "06:00 – 18:00"}
                caption={
                  active
                    ? `${WEEKDAYS[active.column] ?? ""} at ${HOURS[active.row] ?? ""}:00`
                    : "Where the week actually lands"
                }
                legend
              />
              <HeatmapChart.XAxis labels={WEEKDAYS} />
              <HeatmapChart.YAxis labels={HOURS} tickFilter="all" width={24} />
              <HeatmapChart.Cells cornerRadius={3} />

              <HeatmapChart.Tooltip
                formatLabel={(cell) =>
                  `${cell.count} · ${WEEKDAYS[cell.column] ?? ""} ${HOURS[cell.row] ?? ""}:00`
                }
              />
            </HeatmapChart>
          </View>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
const CHART_HEADER = "px-4 pt-3.5";
export const entry: ComponentEntry = {
  slug: "heatmap-chart",
  name: "HeatmapChart",
  summary: "Contribution grid with a themed colour ramp",
  layout: "pager",
  demos: [
    {
      label: "Contribution grid",
      id: "contribution",
      fullPage: true,
      description:
        "A full year, scrolled sideways. Hold to read a day — a swipe scrolls instead.",
      render: () => <HeatmapContributionVersion />,
    },
    {
      label: "Filling the width",
      id: "fill",
      fullPage: true,
      description:
        "A quarter with the cells sized to the space they are given.",
      render: () => <HeatmapFillVersion />,
    },
    {
      label: "Quarters",
      id: "quarters",
      fullPage: true,
      description:
        "Rules grouping the columns, and a ramp off a colour of your own.",
      render: () => <HeatmapQuartersVersion />,
    },
    {
      label: "Punchcard",
      id: "punchcard",
      fullPage: true,
      description:
        "Rows that are hours rather than days — when the week actually lands.",
      render: () => <HeatmapPunchcardVersion />,
    },
  ],
};
