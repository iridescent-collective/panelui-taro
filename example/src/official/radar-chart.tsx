import { Frame } from "panelui-taro/frame";
import {
  RadarChart,
  type RadarChartDatum,
} from "panelui-taro/radar-chart";
import { Tabs } from "panelui-taro/tabs";
import { useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ChartScreen({ children }: { children: ReactNode }) {
  return <View className="flex-1 justify-center px-4">{children}</View>;
}
const RADAR_PROFILE = [
  { axis: "Speed", you: 82, team: 64 },
  { axis: "Accuracy", you: 71, team: 78 },
  { axis: "Coverage", you: 55, team: 83 },
  { axis: "Uptime", you: 94, team: 91 },
  { axis: "Cost", you: 48, team: 62 },
  { axis: "Support", you: 77, team: 58 },
];
const RADAR_SKILLS = [
  { axis: "Design", score: 88 },
  { axis: "Frontend", score: 94 },
  { axis: "Backend", score: 62 },
  { axis: "Infra", score: 45 },
  { axis: "Testing", score: 71 },
];
const RADAR_QUARTERS = {
  q1: [
    { axis: "Speed", score: 54 },
    { axis: "Accuracy", score: 61 },
    { axis: "Coverage", score: 38 },
    { axis: "Uptime", score: 72 },
    { axis: "Cost", score: 44 },
    { axis: "Support", score: 50 },
  ],
  q2: [
    { axis: "Speed", score: 68 },
    { axis: "Accuracy", score: 66 },
    { axis: "Coverage", score: 57 },
    { axis: "Uptime", score: 85 },
    { axis: "Cost", score: 51 },
    { axis: "Support", score: 63 },
  ],
  q3: [
    { axis: "Speed", score: 82 },
    { axis: "Accuracy", score: 71 },
    { axis: "Coverage", score: 88 },
    { axis: "Uptime", score: 94 },
    { axis: "Cost", score: 48 },
    { axis: "Support", score: 77 },
  ],
} satisfies Record<string, RadarChartDatum[]>;
const RADAR_PERIODS = [
  { value: "q1", label: "Q1" },
  { value: "q2", label: "Q2" },
  { value: "q3", label: "Q3" },
] as const;
function RadarSwitchVersion() {
  const [period, setPeriod] = useState<string>("q3");
  const data =
    RADAR_QUARTERS[period as keyof typeof RADAR_QUARTERS] ?? RADAR_QUARTERS.q3;
  const best = [...data].sort((a, b) => b.score - a.score)[0];
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Service profile</Frame.Title>
          <Frame.Action>{best.axis} leads</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="items-center px-4 pt-2 pb-2">
            <RadarChart data={data} domain={[0, 100]}>
              <RadarChart.Grid />
              <RadarChart.Axis />
              <RadarChart.Series dataKey="score" colorIndex={1} showDots />
            </RadarChart>
          </View>
          <Frame.Section className="px-4 py-3">
            <Tabs value={period} onValueChange={setPeriod} defaultValue="q3">
              <Tabs.List>
                {RADAR_PERIODS.map((entry) => (
                  <Tabs.Trigger key={entry.value} value={entry.value}>
                    {entry.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs>
          </Frame.Section>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function RadarSingleVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Skills</Frame.Title>
          <Frame.Action>Self-assessed</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="px-4 pt-2 pb-4">
            <RadarChart data={RADAR_SKILLS} domain={[0, 100]}>
              <RadarChart.Grid />
              <RadarChart.Axis />
              <RadarChart.Series dataKey="score" colorIndex={1} showDots />
            </RadarChart>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function RadarComparisonVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>You vs the team</Frame.Title>
          <Frame.Action>This quarter</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="px-4 pt-2 pb-4">
            <RadarChart data={RADAR_PROFILE} domain={[0, 100]}>
              <RadarChart.Grid />
              <RadarChart.Axis />
              <RadarChart.Series dataKey="you" colorIndex={1} />
              <RadarChart.Series
                dataKey="team"
                colorIndex={2}
                fillOpacity={0}
              />
              <RadarChart.Legend />
            </RadarChart>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function RadarOutlineVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Coverage</Frame.Title>
          <Frame.Action>Circular rings</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="px-4 pt-2 pb-4">
            <RadarChart data={RADAR_PROFILE} domain={[0, 100]}>
              <RadarChart.Header
                title="Weakest axis"
                value="Cost"
                caption="48 of 100"
              />
              <RadarChart.Grid circular rings={5} />
              <RadarChart.Axis fontSize={10} />
              <RadarChart.Series
                dataKey="you"
                colorIndex={3}
                fillOpacity={0}
                strokeWidth={2.5}
                showDots
              />
            </RadarChart>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
export const entry: ComponentEntry = {
  slug: "radar-chart",
  name: "RadarChart",
  summary: "Several measures of one thing, on one shape",
  layout: "pager",
  demos: [
    {
      label: "One profile",
      id: "single",
      fullPage: true,
      description:
        "A filled polygon on polygonal rings, with a dot at each vertex.",
      render: () => <RadarSingleVersion />,
    },
    {
      label: "Two compared",
      id: "comparison",
      fullPage: true,
      description:
        "Two profiles over each other, only the first of them filled.",
      render: () => <RadarComparisonVersion />,
    },
    {
      label: "Outline on circles",
      id: "outline",
      fullPage: true,
      description:
        "Circular rings and no fill, for reading a value off a spoke.",
      render: () => <RadarOutlineVersion />,
    },
    {
      label: "Switching the data",
      id: "switch",
      fullPage: true,
      description:
        "Tabs under the chart change what it draws, and the outline travels.",
      render: () => <RadarSwitchVersion />,
    },
  ],
};
