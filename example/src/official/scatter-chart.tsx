import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { Text } from "panelui-taro/primitives/text";
import { ScatterChart } from "panelui-taro/scatter-chart";
import { Skeleton } from "panelui-taro/skeleton";
import { Tooltip } from "panelui-taro/tooltip";
import { useEffect, useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
function ChartScreen({ children }: { children: ReactNode }) {
  return <View className="flex-1 justify-center px-4">{children}</View>;
}
const CAMPAIGNS = [
  { name: "Spring launch", spend: 4200, revenue: 11800, reach: 32000 },
  { name: "Retargeting", spend: 1800, revenue: 7400, reach: 12000 },
  { name: "Brand video", spend: 12400, revenue: 18200, reach: 148000 },
  { name: "Search — brand", spend: 2600, revenue: 12900, reach: 9800 },
  { name: "Search — generic", spend: 8900, revenue: 14100, reach: 61000 },
  { name: "Podcast reads", spend: 6400, revenue: 6100, reach: 44000 },
  { name: "Newsletter", spend: 900, revenue: 5200, reach: 6400 },
  { name: "Display", spend: 7200, revenue: 4900, reach: 210000 },
  { name: "Affiliate", spend: 3100, revenue: 9600, reach: 18000 },
  { name: "Trade show", spend: 14800, revenue: 9200, reach: 3200 },
  { name: "Social — paid", spend: 5600, revenue: 13400, reach: 88000 },
  { name: "Social — organic", spend: 400, revenue: 3800, reach: 24000 },
  { name: "Partner bundle", spend: 9600, revenue: 21400, reach: 37000 },
  { name: "Referral bonus", spend: 2200, revenue: 8800, reach: 5600 },
  { name: "Webinar", spend: 3800, revenue: 7900, reach: 4100 },
  { name: "Print", spend: 6800, revenue: 2400, reach: 52000 },
];
const TRIALS = Array.from({ length: 18 }, (_unused, index) => {
  const dose = 5 + index * 5;
  return {
    dose,
    control: 40 + ((index * 37) % 11) - 5,
    treated: 38 + dose * 0.42 + ((index * 53) % 13) - 6,
  };
});
function ChartLegendRow({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-3 pb-1">
      {children}
    </View>
  );
}
function LegendDot({
  colorIndex,
  label,
}: {
  colorIndex: 1 | 2 | 3 | 4;
  label: string;
}) {
  const color = useCSSVariable(`--color-chart-${colorIndex}`);
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{
          backgroundColor: typeof color === "string" ? color : undefined,
        }}
        className="h-2.5 w-2.5 rounded-full"
      />
      <Text size="xs" muted>
        {label}
      </Text>
    </View>
  );
}
const thousands = (value: number) => `$${Math.round(value / 1000)}k`;
function ScatterBasicVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Spend vs Revenue</Frame.Title>
          <Frame.Action>{CAMPAIGNS.length} campaigns</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ScatterChart data={CAMPAIGNS} xDataKey="spend" aspectRatio={1.2}>
            <ScatterChart.Grid />
            <ScatterChart.Points dataKey="revenue" />
            <ScatterChart.XAxis format={thousands} />
            <ScatterChart.YAxis format={thousands} />
            <ScatterChart.Tooltip
              formatTitle={(d) => String(d.name)}
              formatX={(v) => `${thousands(v)} spend`}
              formatY={(v) => `${thousands(v)} back`}
            />
          </ScatterChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ScatterBubblesVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Spend, revenue and reach</Frame.Title>
          <Frame.Action>Size is reach</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ScatterChart data={CAMPAIGNS} xDataKey="spend" aspectRatio={1.2}>
            <ScatterChart.Grid />

            <ScatterChart.Points
              dataKey="revenue"
              sizeKey="reach"
              sizeRange={[4, 18]}
            />
            <ScatterChart.XAxis format={thousands} />
            <ScatterChart.YAxis format={thousands} />
            <ScatterChart.Tooltip formatTitle={(d) => String(d.name)} />
          </ScatterChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ScatterTwoSeriesVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Response by dose</Frame.Title>
        </Frame.Header>
        <Frame.Panel>
          <ChartLegendRow>
            <LegendDot colorIndex={1} label="Control" />
            <LegendDot colorIndex={2} label="Treated" />
          </ChartLegendRow>
          <ScatterChart data={TRIALS} xDataKey="dose" aspectRatio={1.2}>
            <ScatterChart.Grid />
            <ScatterChart.Points dataKey="control" colorIndex={1} />
            <ScatterChart.Points dataKey="treated" colorIndex={2} />
            <ScatterChart.XAxis format={(v) => `${Math.round(v)}mg`} />
            <ScatterChart.YAxis />
            <ScatterChart.Tooltip formatX={(v) => `${Math.round(v)}mg`} />
          </ScatterChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ScatterLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 500);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Spend vs Revenue</Frame.Title>
          <Frame.Action>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setStatus("loading")}
            >
              Reload
            </Button>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ScatterChart
            data={CAMPAIGNS}
            status={status}
            xDataKey="spend"
            aspectRatio={1.2}
          >
            <ScatterChart.Grid />
            <ScatterChart.Skeleton />
            <ScatterChart.Points dataKey="revenue" />
            <ScatterChart.XAxis format={thousands} />
            <ScatterChart.YAxis format={thousands} />
            <ScatterChart.Tooltip formatTitle={(d) => String(d.name)} />
          </ScatterChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
export const entry: ComponentEntry = {
  slug: "scatter-chart",
  name: "ScatterChart",
  summary: "Two quantities against each other, to show how they relate",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "One series on two measured axes. Touch a point for both its values.",
      render: () => <ScatterBasicVersion />,
    },
    {
      label: "Bubbles",
      id: "bubbles",
      fullPage: true,
      description: "A third quantity on each point's area, via sizeKey.",
      render: () => <ScatterBubblesVersion />,
    },
    {
      label: "Two series",
      id: "two-series",
      fullPage: true,
      description: "Two clouds sharing both domains, so they stay comparable.",
      render: () => <ScatterTwoSeriesVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description: "A still field of muted dots that gives way to the data.",
      render: () => <ScatterLoadingVersion />,
    },
  ],
};
