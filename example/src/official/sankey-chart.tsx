import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Frame } from "panelui-taro/frame";
import { Text } from "panelui-taro/primitives/text";
import {
  SankeyChart,
  type SankeyLink,
  type SankeyNode,
} from "panelui-taro/sankey-chart";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const TRAFFIC_NODES: SankeyNode[] = [
  { id: "search", label: "Search" },
  { id: "social", label: "Social" },
  { id: "direct", label: "Direct" },
  { id: "signup", label: "Signed up" },
  { id: "browse", label: "Browsed" },
  { id: "left", label: "Left" },
];
const TRAFFIC_LINKS: SankeyLink[] = [
  { source: "search", target: "signup", value: 5200 },
  { source: "search", target: "browse", value: 12400 },
  { source: "social", target: "browse", value: 8100 },
  { source: "social", target: "left", value: 9600 },
  { source: "direct", target: "signup", value: 3100 },
  { source: "direct", target: "left", value: 2800 },
];
const BUDGET_NODES: SankeyNode[] = [
  { id: "revenue", label: "Revenue" },
  { id: "grants", label: "Grants" },
  { id: "product", label: "Product" },
  { id: "sales", label: "Sales" },
  { id: "ops", label: "Ops" },
  { id: "salaries", label: "Salaries" },
  { id: "tooling", label: "Tooling" },
  { id: "travel", label: "Travel" },
];
const BUDGET_LINKS: SankeyLink[] = [
  { source: "revenue", target: "product", value: 480 },
  { source: "revenue", target: "sales", value: 260 },
  { source: "revenue", target: "ops", value: 140 },
  { source: "grants", target: "product", value: 120 },
  { source: "grants", target: "ops", value: 60 },
  { source: "product", target: "salaries", value: 430 },
  { source: "product", target: "tooling", value: 170 },
  { source: "sales", target: "salaries", value: 180 },
  { source: "sales", target: "travel", value: 80 },
  { source: "ops", target: "salaries", value: 130 },
  { source: "ops", target: "tooling", value: 70 },
];
const SPEND_NODES: SankeyNode[] = [
  { id: "salary", label: "Salary" },
  { id: "freelance", label: "Freelance" },
  { id: "account", label: "Current account" },
  { id: "rent", label: "Rent" },
  { id: "groceries", label: "Groceries" },
  { id: "transport", label: "Transport" },
  { id: "utilities", label: "Utilities" },
  { id: "eating-out", label: "Eating out" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "insurance", label: "Insurance" },
  { id: "phone", label: "Phone" },
  { id: "gym", label: "Gym" },
  { id: "books", label: "Books" },
  { id: "haircuts", label: "Haircuts" },
  { id: "charity", label: "Charity" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "stationery", label: "Stationery" },
  { id: "saved", label: "Saved" },
];
const SPEND_LINKS: SankeyLink[] = [
  { source: "salary", target: "account", value: 2400 },
  { source: "freelance", target: "account", value: 380 },
  { source: "account", target: "rent", value: 1450 },
  { source: "account", target: "groceries", value: 520 },
  { source: "account", target: "transport", value: 190 },
  { source: "account", target: "utilities", value: 165 },
  { source: "account", target: "eating-out", value: 148 },
  { source: "account", target: "subscriptions", value: 62 },
  { source: "account", target: "insurance", value: 58 },
  { source: "account", target: "phone", value: 34 },
  { source: "account", target: "gym", value: 32 },
  { source: "account", target: "books", value: 26 },
  { source: "account", target: "haircuts", value: 24 },
  { source: "account", target: "charity", value: 20 },
  { source: "account", target: "pharmacy", value: 16 },
  { source: "account", target: "stationery", value: 11 },
  { source: "account", target: "saved", value: 24 },
];
const ALIGN_NODES: SankeyNode[] = [
  { id: "revenue", label: "Revenue" },
  { id: "grants", label: "Grants" },
  { id: "reserve", label: "Reserve" },
  { id: "product", label: "Product" },
  { id: "ops", label: "Ops" },
  { id: "salaries", label: "Salaries" },
  { id: "tooling", label: "Tooling" },
];
const ALIGN_LINKS: SankeyLink[] = [
  { source: "revenue", target: "reserve", value: 180 },
  { source: "revenue", target: "product", value: 420 },
  { source: "revenue", target: "ops", value: 160 },
  { source: "grants", target: "product", value: 120 },
  { source: "grants", target: "ops", value: 70 },
  { source: "product", target: "salaries", value: 390 },
  { source: "product", target: "tooling", value: 150 },
  { source: "ops", target: "salaries", value: 150 },
  { source: "ops", target: "tooling", value: 80 },
];
function SankeyBasicVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Where sessions went</Frame.Title>
          <Frame.Action>Tap a name</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <SankeyChart
            nodes={TRAFFIC_NODES}
            links={TRAFFIC_LINKS}
            height={280}
            className="px-3 pt-3 pb-4"
          >
            <SankeyChart.Header
              title="Sessions"
              value="41,200"
              caption="Last 7 days"
            />
            <SankeyChart.Links />
            <SankeyChart.Nodes />
            <SankeyChart.Labels />
            <SankeyChart.Tooltip />
          </SankeyChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function SankeyStagesVersion() {
  return (
    <ScrollView contentContainerClassName="grow justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Three columns</Frame.Title>
          <Frame.Action>£m</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <SankeyChart
            nodes={BUDGET_NODES}
            links={BUDGET_LINKS}
            height={340}
            className="px-3 pt-3 pb-4"
          >
            <SankeyChart.Header
              title="Budget"
              value="£1.06bn"
              caption="Income through to spend"
            />
            <SankeyChart.Links />
            <SankeyChart.Nodes />
            <SankeyChart.Labels />
            <SankeyChart.Tooltip />
          </SankeyChart>
        </Frame.Panel>
      </Frame>
    </ScrollView>
  );
}
function SankeyVerticalVersion() {
  return (
    <ScrollView contentContainerClassName="grow justify-center p-4 pb-10">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Down the screen</Frame.Title>
          <Frame.Action>£m</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <SankeyChart
            nodes={BUDGET_NODES}
            links={BUDGET_LINKS}
            orientation="vertical"
            className="px-3 pt-3 pb-4"
          >
            <SankeyChart.Header
              title="Budget"
              value="£1.06bn"
              caption="Income through to spend"
            />
            <SankeyChart.Links />
            <SankeyChart.Nodes />
            <SankeyChart.Labels />
            <SankeyChart.Legend />
            <SankeyChart.Breakdown />
          </SankeyChart>
        </Frame.Panel>
      </Frame>
    </ScrollView>
  );
}
function SankeyCollapseVersion() {
  const [folded, setFolded] = useState(true);
  return (
    <ScrollView contentContainerClassName="grow justify-center p-4 pb-10">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Seventeen into six</Frame.Title>
          <Frame.Action>{folded ? "6 of 17" : "all 17"}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <SankeyChart
            nodes={SPEND_NODES}
            links={SPEND_LINKS}
            orientation="vertical"
            collapse={folded ? { maxPerColumn: 6 } : undefined}
            className="px-3 pt-3 pb-4"
          >
            <SankeyChart.Header
              title="March"
              value="£2,780"
              caption={
                folded
                  ? "Smallest folded into Other"
                  : "Every category, as it arrived"
              }
            />
            <SankeyChart.Links />
            <SankeyChart.Nodes />
            <SankeyChart.Labels />
            <SankeyChart.Legend />
            <SankeyChart.Breakdown maxRows={5} />
          </SankeyChart>
          <View className="px-3 pb-3">
            <Button
              size="sm"
              variant="secondary"
              onPress={() => setFolded((on) => !on)}
            >
              {folded ? "Show every category" : "Fold the tail"}
            </Button>
          </View>
        </Frame.Panel>
      </Frame>
    </ScrollView>
  );
}
function SankeyAlignVersion() {
  const [align, setAlign] = useState<"justify" | "left">("justify");
  return (
    <ScrollView contentContainerClassName="grow justify-center gap-3 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Where the endings sit</Frame.Title>
          <Frame.Action>{align}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <SankeyChart
            nodes={ALIGN_NODES}
            links={ALIGN_LINKS}
            align={align}
            height={320}
            className="px-3 pt-3 pb-4"
          >
            <SankeyChart.Links />
            <SankeyChart.Nodes />
            <SankeyChart.Labels />
          </SankeyChart>
        </Frame.Panel>
      </Frame>
      <View className="flex-row gap-2">
        <Button
          variant={align === "justify" ? "primary" : "outline"}
          onPress={() => setAlign("justify")}
          className="flex-1"
        >
          justify
        </Button>
        <Button
          variant={align === "left" ? "primary" : "outline"}
          onPress={() => setAlign("left")}
          className="flex-1"
        >
          left
        </Button>
      </View>
      <Text size="xs" muted>
        `justify` pushes everything that feeds nothing into the last column, so
        `Reserve` is drawn against the far edge as though it had gone the
        distance. `left` leaves it in the column it actually stopped in.
      </Text>
    </ScrollView>
  );
}
function SankeyLoadingVersion() {
  const [loaded, setLoaded] = useState(false);
  return (
    <View className="flex-1 justify-center gap-3 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Waiting for the rows</Frame.Title>
        </Frame.Header>
        <Frame.Panel>
          <SankeyChart
            nodes={loaded ? TRAFFIC_NODES : []}
            links={loaded ? TRAFFIC_LINKS : []}
            status={loaded ? "ready" : "loading"}
            height={280}
            className="px-3 pt-3 pb-4"
          >
            <SankeyChart.Skeleton />
            <SankeyChart.Links />
            <SankeyChart.Nodes />
            <SankeyChart.Labels />
          </SankeyChart>
        </Frame.Panel>
      </Frame>
      <Button variant="outline" onPress={() => setLoaded((value) => !value)}>
        {loaded ? "Back to loading" : "Land the data"}
      </Button>
    </View>
  );
}
function SankeyDroppedDemo() {
  const [dropped, setDropped] = useState(0);
  const messy: SankeyLink[] = [
    ...TRAFFIC_LINKS,
    { source: "search", target: "ghost", value: 400 },
    { source: "social", target: "signup", value: 0 },
    { source: "browse", target: "search", value: 900 },
  ];
  return (
    <Card className="w-full">
      <Card.Content className="gap-3 p-4">
        <SankeyChart
          nodes={TRAFFIC_NODES}
          links={messy}
          height={220}
          onDropLinks={setDropped}
        >
          <SankeyChart.Links />
          <SankeyChart.Nodes />
          <SankeyChart.Labels />
        </SankeyChart>
        <Text size="xs" muted>
          {dropped > 0
            ? `${dropped} rows could not be drawn — the rest is still true.`
            : "Every row was drawn."}
        </Text>
      </Card.Content>
    </Card>
  );
}
function SankeyCurveDemo() {
  const [straight, setStraight] = useState(false);
  return (
    <Card className="w-full">
      <Card.Content className="gap-3 p-4">
        <SankeyChart
          nodes={TRAFFIC_NODES}
          links={TRAFFIC_LINKS}
          height={220}
          curve={straight ? 0 : 0.5}
        >
          <SankeyChart.Links />
          <SankeyChart.Nodes />
          <SankeyChart.Labels />
        </SankeyChart>
        <Button
          variant="outline"
          size="sm"
          onPress={() => setStraight((value) => !value)}
        >
          {straight ? "Curved ribbons" : "Straight ribbons"}
        </Button>
      </Card.Content>
    </Card>
  );
}
function SankeyLegendDemo() {
  return (
    <View className="w-full gap-3">
      <Card>
        <Card.Content className="p-0">
          <SankeyChart
            nodes={SPEND_NODES}
            links={SPEND_LINKS}
            height={260}
            className="px-3 pt-3 pb-4"
          >
            <SankeyChart.Links />
            <SankeyChart.Nodes />
            <SankeyChart.Labels />
            <SankeyChart.Legend limit={9} />
          </SankeyChart>
        </Card.Content>
      </Card>
      <Text size="xs" muted className="px-1">
        The bottom categories are too thin to carry a name. The legend is where
        they get one, and pressing it selects the same node the bar would.
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "sankey-chart",
  name: "SankeyChart",
  summary: "Where a quantity came from and where it ended up",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "Three sources and what the sessions from each of them went on to do. Tap a name to keep its ribbons and fade the rest.",
      render: () => <SankeyBasicVersion />,
    },
    {
      label: "Through a middle column",
      id: "stages",
      fullPage: true,
      description:
        "Income into teams into what the teams spent it on. The middle column is both a destination and a source, and its height is what passes through it.",
      render: () => <SankeyStagesVersion />,
    },
    {
      label: "Down the screen",
      id: "vertical",
      fullPage: true,
      description:
        "The same budget with the flow running top to bottom. The stages get the long side of the phone, and a name gets the width of its own bar instead of the gap between two columns.",
      render: () => <SankeyVerticalVersion />,
    },
    {
      label: "Folding the long tail",
      id: "collapse",
      fullPage: true,
      description:
        "A month of spending, seventeen categories deep. Folded, the five largest keep their own bars and the rest become Other; unfolded, the bottom nine are hairlines.",
      render: () => <SankeyCollapseVersion />,
    },
    {
      label: "Where the endings sit",
      id: "align",
      fullPage: true,
      description:
        "The same flow under `justify` and `left`. Only the nodes the flow leaves a choice about move.",
      render: () => <SankeyAlignVersion />,
    },
    {
      label: "Waiting for the rows",
      id: "loading",
      fullPage: true,
      description:
        "The placeholder dissolves under the real diagram growing across it, so the card never has a blank frame in the middle of it.",
      render: () => <SankeyLoadingVersion />,
    },
    {
      label: "Naming what is too thin to label",
      render: () => <SankeyLegendDemo />,
    },
    { label: "Rows that cannot be drawn", render: () => <SankeyDroppedDemo /> },
    { label: "How far the ribbons bend", render: () => <SankeyCurveDemo /> },
  ],
};
