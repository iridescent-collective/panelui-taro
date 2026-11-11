import { BubbleChart } from "panelui-taro/bubble-chart";
import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { Tooltip } from "panelui-taro/tooltip";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const TEAMS = [
  { team: "A", efficiency: 12, performance: 19, people: 6 },
  { team: "B", efficiency: 24, performance: 34, people: 14 },
  { team: "C", efficiency: 40, performance: 16, people: 22 },
  { team: "D", efficiency: 32, performance: 46, people: 12 },
  { team: "E", efficiency: 60, performance: 27, people: 10 },
  { team: "F", efficiency: 46, performance: 43, people: 11 },
  { team: "G", efficiency: 16, performance: 33, people: 16 },
  { team: "H", efficiency: 68, performance: 50, people: 8 },
];
function BubbleBasicVersion() {
  const [active, setActive] = useState<{
    label: string;
    size: number | null;
  } | null>(null);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Performance vs efficiency</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            aspectRatio={1.4}
            onActivePointChange={(point) =>
              setActive(point ? { label: point.label, size: point.size } : null)
            }
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value={active ? `Team ${active.label}` : "8 teams"}
              caption={
                active && active.size !== null
                  ? `${active.size} people`
                  : "Circle area is team size"
              }
            />
            <BubbleChart.Grid />
            <BubbleChart.Bubbles />
            <BubbleChart.Labels />
            <BubbleChart.XAxis />
            <BubbleChart.YAxis />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BubbleLegendVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Smaller circles</Frame.Title>
          <Frame.Action>Named beside, not inside</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS.slice(0, 5)}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[8, 22]}
            aspectRatio={1.4}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value="5 teams"
              caption="Too small to hold their own names"
            />
            <BubbleChart.Grid />
            <BubbleChart.Bubbles opacity={0.7} />
            <BubbleChart.Legend />
            <BubbleChart.XAxis />
            <BubbleChart.YAxis />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BubbleLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 1600);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Loading</Frame.Title>
          <Frame.Action>
            {status === "loading" ? "Fetching…" : "Ready"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            status={status}
            aspectRatio={1.4}
          >
            <BubbleChart.Grid />
            <BubbleChart.Skeleton />
            <BubbleChart.Bubbles />
            <BubbleChart.Labels />
            <BubbleChart.XAxis />
            <BubbleChart.YAxis />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
      <Button variant="outline" onPress={() => setStatus("loading")}>
        Load again
      </Button>
    </View>
  );
}
function BubbleQuadrantsVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Where each team sits</Frame.Title>
          <Frame.Action>Split at the average</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            aspectRatio={1.2}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value="8 teams"
              caption="Both averages, drawn as one line each"
            />
            <BubbleChart.Grid />
            <BubbleChart.Quadrants
              labels={{
                topLeft: "Effective, costly",
                topRight: "Doing both",
                bottomLeft: "Neither yet",
                bottomRight: "Lean, quiet",
              }}
            />
            <BubbleChart.Bubbles />
            <BubbleChart.Labels />
            <BubbleChart.XAxis label="Efficiency" />
            <BubbleChart.YAxis label="Performance" />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BubbleSizeKeyVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Team size, to scale</Frame.Title>
          <Frame.Action>Area is people</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[10, 34]}
            aspectRatio={1.2}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value="6 to 22"
              caption="People per team, read off the key"
            />
            <BubbleChart.Grid />
            <BubbleChart.Bubbles opacity={0.75} />
            <BubbleChart.Labels />
            <BubbleChart.SizeKey placement="top-left" label="People" />
            <BubbleChart.XAxis label="Efficiency" />
            <BubbleChart.YAxis label="Performance" />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BubbleTrendVersion() {
  const [fit, setFit] = useState<{
    slope: number;
    r: number;
  } | null>(null);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Does one buy the other?</Frame.Title>
          <Frame.Action>Least squares</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            aspectRatio={1.2}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value={fit ? `r ${fit.r.toFixed(2)}` : "—"}
              caption={
                fit && fit.r < 0.3
                  ? "Barely a relationship"
                  : "How tightly the teams sit on the line"
              }
            />
            <BubbleChart.Grid />
            <BubbleChart.Trend onFit={(next) => setFit(next)} />
            <BubbleChart.Bubbles opacity={0.8} />
            <BubbleChart.Labels />
            <BubbleChart.XAxis label="Efficiency" />
            <BubbleChart.YAxis label="Performance" />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "bubble-chart",
  name: "BubbleChart",
  summary: "Named circles on two axes, with a third quantity on their area",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "Two axes and an area, with each circle carrying its own name.",
      render: () => <BubbleBasicVersion />,
    },
    {
      label: "Named beside",
      id: "legend",
      fullPage: true,
      description:
        "A legend instead of labels, for circles too small to hold them.",
      render: () => <BubbleLegendVersion />,
    },
    {
      label: "Four quadrants",
      id: "quadrants",
      fullPage: true,
      description:
        "A crosshair at the average of each axis, and a name for the corner it makes.",
      render: () => <BubbleQuadrantsVersion />,
    },
    {
      label: "What the area means",
      id: "size-key",
      fullPage: true,
      description:
        "Three nested circles saying what a bubble is worth. Area is the one quantity the chart has no axis for.",
      render: () => <BubbleSizeKeyVersion />,
    },
    {
      label: "The line through it",
      id: "trend",
      fullPage: true,
      description:
        "The straight line that fits the cloud best, with how tightly the cloud sits on it.",
      render: () => <BubbleTrendVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "A still field of muted circles that dissolves as the real ones land.",
      render: () => <BubbleLoadingVersion />,
    },
  ],
};
