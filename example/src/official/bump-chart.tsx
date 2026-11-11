import {
  BumpChart,
  type BumpChartDatum,
} from "panelui-taro/bump-chart";
import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const LEAGUE: BumpChartDatum[] = [
  {
    week: "w32",
    harbour: 3,
    northside: 2,
    kestrel: 1,
    oldMill: 4,
    riverside: 5,
  },
  {
    week: "w33",
    harbour: 3,
    northside: 2,
    kestrel: 1,
    oldMill: 5,
    riverside: 4,
  },
  {
    week: "w34",
    harbour: 2,
    northside: 3,
    kestrel: 1,
    oldMill: 4,
    riverside: 5,
  },
  {
    week: "w35",
    harbour: 2,
    northside: 1,
    kestrel: 3,
    oldMill: 4,
    riverside: 5,
  },
  {
    week: "w36",
    harbour: 1,
    northside: 3,
    kestrel: 2,
    oldMill: 4,
    riverside: 5,
  },
  {
    week: "w37",
    harbour: 1,
    northside: 2,
    kestrel: 3,
    oldMill: 5,
    riverside: 4,
  },
  {
    week: "Now",
    harbour: 1,
    northside: 2,
    kestrel: 3,
    oldMill: 4,
    riverside: 5,
  },
];
const CLUBS = [
  { key: "harbour", label: "Harbour" },
  { key: "northside", label: "Northside" },
  { key: "kestrel", label: "Kestrel" },
  { key: "oldMill", label: "Old Mill" },
  { key: "riverside", label: "Riverside" },
] as const;
const SHOP_TAKINGS: BumpChartDatum[] = [
  { month: "Jan", quay: 18420, market: 21760, station: 15230, college: 12980 },
  { month: "Feb", quay: 19870, market: 20110, station: 16940, college: 13420 },
  { month: "Mar", quay: 22650, market: 19480, station: 17310, college: 18050 },
  { month: "Apr", quay: 21390, market: 18920, station: 19760, college: 20330 },
  { month: "May", quay: 23810, market: 17640, station: 22480, college: 19160 },
  { month: "Jun", quay: 24560, market: 19930, station: 21870, college: 16240 },
];
const LAST_SEASON: BumpChartDatum[] = [
  {
    week: "w32",
    harbour: 5,
    northside: 1,
    kestrel: 2,
    oldMill: 3,
    riverside: 4,
  },
  {
    week: "w33",
    harbour: 4,
    northside: 1,
    kestrel: 3,
    oldMill: 2,
    riverside: 5,
  },
  {
    week: "w34",
    harbour: 4,
    northside: 2,
    kestrel: 3,
    oldMill: 1,
    riverside: 5,
  },
  {
    week: "w35",
    harbour: 3,
    northside: 2,
    kestrel: 4,
    oldMill: 1,
    riverside: 5,
  },
  {
    week: "w36",
    harbour: 3,
    northside: 1,
    kestrel: 5,
    oldMill: 2,
    riverside: 4,
  },
  {
    week: "w37",
    harbour: 2,
    northside: 1,
    kestrel: 5,
    oldMill: 3,
    riverside: 4,
  },
  {
    week: "Now",
    harbour: 2,
    northside: 1,
    kestrel: 4,
    oldMill: 3,
    riverside: 5,
  },
];
function LeagueLines() {
  return (
    <>
      {CLUBS.map((club) => (
        <BumpChart.Line
          key={club.key}
          dataKey={club.key}
          label={club.label}
          colorIndex={club.key === "harbour" ? 3 : 1}
        />
      ))}
    </>
  );
}
function BumpBasicVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>League table</Frame.Title>
          <Frame.Action>Tap a name</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BumpChart
            data={LEAGUE}
            xDataKey="week"
            defaultHighlight="harbour"
            className="px-2 pt-3 pb-4"
          >
            <BumpChart.Grid />
            <BumpChart.Line dataKey="harbour" label="Harbour" colorIndex={3} />
            <BumpChart.Line dataKey="northside" label="Northside" />
            <BumpChart.Line dataKey="kestrel" label="Kestrel" />
            <BumpChart.Line dataKey="oldMill" label="Old Mill" />
            <BumpChart.Line dataKey="riverside" label="Riverside" />
            <BumpChart.YAxis />
            <BumpChart.XAxis />
            <BumpChart.Labels />
            <BumpChart.Tooltip />
          </BumpChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BumpScoresVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Takings</Frame.Title>
          <Frame.Action>Jan to Jun</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BumpChart
            data={SHOP_TAKINGS}
            xDataKey="month"
            values="score"
            aspectRatio={1.8}
            className="px-2 pb-4"
          >
            <BumpChart.Header
              className={CHART_HEADER}
              title="Top shop in June"
              value="Quay"
              caption="Ranked by takings each month"
            />
            <BumpChart.Grid />
            <BumpChart.Line
              dataKey="quay"
              label="Quay"
              colorIndex={1}
              strokeWidth={2}
            />
            <BumpChart.Line
              dataKey="market"
              label="Market"
              colorIndex={2}
              strokeWidth={2}
            />
            <BumpChart.Line
              dataKey="station"
              label="Station"
              colorIndex={3}
              strokeWidth={2}
            />
            <BumpChart.Line
              dataKey="college"
              label="College"
              colorIndex={4}
              strokeWidth={2}
            />
            <BumpChart.YAxis />
            <BumpChart.XAxis ticks={6} />
            <BumpChart.Labels pressable={false} />
            <BumpChart.Tooltip />
          </BumpChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BumpPickedVersion() {
  const [picked, setPicked] = useState<string | null>("kestrel");
  const club = CLUBS.find((entry) => entry.key === picked);
  const places = picked ? LEAGUE.map((row) => row[picked] as number) : [];
  const best = places.length ? Math.min(...places) : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>League table</Frame.Title>
          <Frame.Action>
            {picked ? "Tap again to clear" : "Tap a name"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BumpChart
            data={LEAGUE}
            xDataKey="week"
            highlight={picked}
            onHighlightChange={setPicked}
            className="px-2 pb-4"
          >
            <BumpChart.Header
              className={CHART_HEADER}
              title={club ? club.label : "No club picked"}
              value={club ? `#${places[places.length - 1]}` : "—"}
              caption={
                club
                  ? `Best this run: #${best}`
                  : "Every line in its own colour"
              }
            />
            <BumpChart.Grid />
            {CLUBS.map((entry, index) => (
              <BumpChart.Line
                key={entry.key}
                dataKey={entry.key}
                label={entry.label}
                colorIndex={(index + 1) as 1 | 2 | 3 | 4 | 5}
              />
            ))}
            <BumpChart.YAxis />
            <BumpChart.XAxis />
            <BumpChart.Labels />
          </BumpChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BumpSeasonsVersion() {
  const [season, setSeason] = useState<"this" | "last">("this");
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>League table</Frame.Title>
          <Frame.Action>
            {season === "this" ? "This season" : "Last season"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BumpChart
            data={season === "this" ? LEAGUE : LAST_SEASON}
            xDataKey="week"
            defaultHighlight="harbour"
            className="px-2 pt-3 pb-4"
          >
            <BumpChart.Grid />
            <LeagueLines />
            <BumpChart.YAxis />
            <BumpChart.XAxis />
            <BumpChart.Labels />
            <BumpChart.Tooltip />
          </BumpChart>
        </Frame.Panel>
      </Frame>
      <Button
        variant="secondary"
        onPress={() => setSeason(season === "this" ? "last" : "this")}
      >
        {season === "this" ? "Show last season" : "Show this season"}
      </Button>
    </View>
  );
}
function BumpLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 900);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>League table</Frame.Title>
          <Frame.Action>
            {status === "loading" ? "Loading" : "This season"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BumpChart
            data={LEAGUE}
            xDataKey="week"
            status={status}
            defaultHighlight="harbour"
            className="px-2 pt-3 pb-4"
          >
            <BumpChart.Grid />
            <BumpChart.Skeleton />
            <LeagueLines />
            <BumpChart.YAxis />
            <BumpChart.XAxis />
            <BumpChart.Labels />
            <BumpChart.Tooltip />
          </BumpChart>
        </Frame.Panel>
      </Frame>
      <Button variant="secondary" onPress={() => setStatus("loading")}>
        Load again
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "bump-chart",
  name: "BumpChart",
  summary: "How a set of things ranked against each other over time",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "Five clubs over seven weeks, with one picked out against the rest.",
      render: () => <BumpBasicVersion />,
    },
    {
      label: "Ranked from scores",
      id: "scores",
      fullPage: true,
      description:
        "Monthly takings passed as money; the chart ranks each month itself.",
      render: () => <BumpScoresVersion />,
    },
    {
      label: "Picking a line",
      id: "picked",
      fullPage: true,
      description:
        "Tap a name to pick it out; the header reads the club you picked.",
      render: () => <BumpPickedVersion />,
    },
    {
      label: "Changing data",
      id: "seasons",
      fullPage: true,
      description: "Switch seasons and every line moves to its new places.",
      render: () => <BumpSeasonsVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description: "A bar on every row while the table loads.",
      render: () => <BumpLoadingVersion />,
    },
  ],
};
