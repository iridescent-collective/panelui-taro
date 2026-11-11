import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import {
  LineChart,
  type LineChartHandle,
} from "panelui-taro/line-chart";
import { Text } from "panelui-taro/primitives/text";
import { Tabs } from "panelui-taro/tabs";
import { Tooltip } from "panelui-taro/tooltip";
import { useRef, useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const REVENUE = MONTHS.map((month, index) => ({
  month,
  revenue: [
    4200, 5800, 4900, 7100, 6100, 8300, 7800, 9500, 8900, 10400, 9900, 11600,
  ][index]!,
  target: [
    4400, 5100, 5800, 6500, 7200, 7900, 8300, 8800, 9200, 9700, 10100, 10600,
  ][index]!,
}));
const TRAFFIC = MONTHS.map((month, index) => ({
  month,
  organic: [
    2100, 3400, 5200, 6100, 7300, 9800, 8900, 12400, 11800, 14200, 15600, 15100,
  ][index]!,
  paid: [
    1200, 2400, 3100, 4200, 4800, 5600, 6100, 7200, 7800, 8900, 9600, 9500,
  ][index]!,
  referral: [
    800, 1400, 1900, 2600, 3100, 3400, 3900, 4200, 4600, 4900, 5100, 5100,
  ][index]!,
  social: [
    600, 1100, 1500, 2100, 2400, 2600, 2900, 3200, 3400, 3700, 3900, 3800,
  ][index]!,
}));
const SESSIONS = MONTHS.map((month, index) => ({
  month,
  organic: [
    2000, 15000, 8000, 14000, 8000, 18000, 18000, 20000, 17000, 21000, 18000,
    15000,
  ][index]!,
  paid: [
    1000, 10000, 8000, 15000, 8000, 12000, 11500, 5000, 15000, 10000, 18000,
    9000,
  ][index]!,
}));
const RANGES: Record<
  string,
  {
    balance: number;
    delta: number;
    data: {
      t: string;
      v: number;
    }[];
  }
> = {
  "1D": {
    balance: 24801,
    delta: 1.2,
    data: spark([120, 118, 124, 121, 128, 126, 132, 130, 138]),
  },
  "1W": {
    balance: 24801,
    delta: 3.4,
    data: spark([90, 95, 92, 101, 108, 104, 118, 124, 132]),
  },
  "1M": {
    balance: 24801,
    delta: 5.32,
    data: spark([60, 66, 62, 78, 84, 80, 96, 104, 138]),
  },
  "1Y": {
    balance: 24801,
    delta: 42.8,
    data: spark([20, 34, 41, 55, 61, 78, 92, 110, 138]),
  },
};
function spark(values: number[]): {
  t: string;
  v: number;
}[] {
  return values.map((v, index) => ({ t: String(index), v }));
}
function ChartScreen({ children }: { children: ReactNode }) {
  return <View className="flex-1 justify-center px-4">{children}</View>;
}
function ChartBasicVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Traffic Source</Frame.Title>
          <Frame.Action>Last 12 months</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartStat value="292,000" caption="Sessions">
            <LegendDot colorIndex={1} label="Organic" />
            <LegendDot colorIndex={2} label="Paid Ads" />
          </ChartStat>
          <LineChart
            data={SESSIONS}
            xDataKey="month"
            curve="linear"
            aspectRatio={1.7}
          >
            <LineChart.Grid />
            <LineChart.Line dataKey="organic" colorIndex={1} />
            <LineChart.Line dataKey="paid" colorIndex={2} />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip
              formatValue={(v) => v.toLocaleString()}
              formatX={(d) => String(d.month)}
            />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartBothAxesVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
          <Frame.Action>Both axes</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid rows={4} />
            <LineChart.Area dataKey="revenue" />
            <LineChart.Line dataKey="revenue" />
            <LineChart.XAxis ticks={5} />
            <LineChart.YAxis
              ticks={4}
              format={(v) => `$${Math.round(v / 1000)}k`}
            />
            <LineChart.Tooltip
              formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartDotsVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
        </Frame.Header>
        <Frame.Panel>
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Line dataKey="revenue" showMarkers />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip
              formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartCrosshairVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartStat value="$317,904" caption="Last 12 months" />
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Area dataKey="revenue" />
            <LineChart.Line dataKey="revenue" />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip formatValue={(v) => `$${v.toLocaleString()}`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartAnimatedVersion() {
  const chart = useRef<LineChartHandle>(null);
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
          <Frame.Action>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => chart.current?.replay()}
            >
              Replay
            </Button>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <LineChart
            ref={chart}
            data={REVENUE}
            xDataKey="month"
            aspectRatio={1.7}
          >
            <LineChart.Grid />
            <LineChart.Area dataKey="revenue" />
            <LineChart.Line dataKey="revenue" />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip formatValue={(v) => `$${v.toLocaleString()}`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartFinanceVersion() {
  const [range, setRange] = useState("1M");
  const current = RANGES[range]!;
  const up = current.delta >= 0;
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Total balance</Frame.Title>
          <Frame.Action>{range}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartStat value={`$${current.balance.toLocaleString()}.32`}>
            <Text
              size="sm"
              className={up ? "text-success" : "text-destructive"}
            >
              {up ? "+" : ""}
              {current.delta}% this{" "}
              {range === "1D" ? "day" : range === "1W" ? "week" : "period"}
            </Text>
          </ChartStat>
          <View className="gap-3 px-3 pb-3">
            <LineChart data={current.data} xDataKey="t" aspectRatio={1.9}>
              <LineChart.Grid rows={3} dashArray="" opacity={0.4} />
              <LineChart.Area dataKey="v" />
              <LineChart.Line dataKey="v" />
            </LineChart>
            <Tabs value={range} defaultValue={range} onValueChange={setRange}>
              <Tabs.List>
                {Object.keys(RANGES).map((key) => (
                  <Tabs.Trigger key={key} value={key}>
                    {key}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartDashedVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Actual vs Target</Frame.Title>
          <Frame.Action>2026</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartLegendRow>
            <LegendDot colorIndex={1} label="Actual" />
            <View className="flex-row items-center gap-1.5">
              <View className="bg-muted-foreground h-0.5 w-4 rounded-full" />
              <Text size="xs" muted>
                Target
              </Text>
            </View>
          </ChartLegendRow>
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Line dataKey="revenue" colorIndex={1} />
            <LineChart.Line dataKey="target" colorIndex={2} dashArray="6,5" />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip
              formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartMultiVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Traffic Sources</Frame.Title>
          <Frame.Action>Last 12 months</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartLegendRow>
            <LegendDot colorIndex={1} label="Organic" />
            <LegendDot colorIndex={2} label="Paid Ads" />
            <LegendDot colorIndex={3} label="Referral" />
            <LegendDot colorIndex={4} label="Social" />
          </ChartLegendRow>
          <LineChart data={TRAFFIC} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Line dataKey="organic" colorIndex={1} />
            <LineChart.Line dataKey="paid" colorIndex={2} />
            <LineChart.Line dataKey="referral" colorIndex={3} />
            <LineChart.Line dataKey="social" colorIndex={4} />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip
              formatValue={(v) => `${(v / 1000).toFixed(1)}k`}
            />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function ChartStat({
  value,
  caption,
  children,
}: {
  value: string;
  caption?: string;
  children?: ReactNode;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3 px-4 pt-3.5 pb-2">
      <View className="gap-0.5">
        <Text size="2xl" weight="bold">
          {value}
        </Text>
        {caption ? (
          <Text size="sm" muted>
            {caption}
          </Text>
        ) : null}
      </View>
      {children ? (
        <View className="flex-row flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-1.5">
          {children}
        </View>
      ) : null}
    </View>
  );
}
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
export const entry: ComponentEntry = {
  slug: "line-chart",
  name: "LineChart",
  summary: "Animated time series, drawn on the UI thread",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description: "Two straight-line series sharing one axis, with a legend.",
      render: () => <ChartBasicVersion />,
    },
    {
      label: "Both axes",
      id: "both-axes",
      fullPage: true,
      description:
        "Value labels down the side, each centred on the grid line it names.",
      render: () => <ChartBothAxesVersion />,
    },
    {
      label: "With dots",
      id: "dots",
      fullPage: true,
      description:
        "A dot at every point, for a short series where each reading matters.",
      render: () => <ChartDotsVersion />,
    },
    {
      label: "Crosshair",
      id: "crosshair",
      fullPage: true,
      description:
        "Drag across the chart and a label rides the crosshair with the value.",
      render: () => <ChartCrosshairVersion />,
    },
    {
      label: "Animated line",
      id: "animated",
      fullPage: true,
      description: "A Replay button re-runs the reveal through the chart ref.",
      render: () => <ChartAnimatedVersion />,
    },
    {
      label: "Finance",
      id: "finance",
      fullPage: true,
      description:
        "A balance, a delta, and a range selector that tweens the axis on change.",
      render: () => <ChartFinanceVersion />,
    },
    {
      label: "Dashed comparison",
      id: "dashed",
      fullPage: true,
      description:
        "A solid actual against a dashed target — told apart by shape, not just colour.",
      render: () => <ChartDashedVersion />,
    },
    {
      label: "Multi-line",
      id: "multi",
      fullPage: true,
      description: "Four series in the chart-token ramp.",
      render: () => <ChartMultiVersion />,
    },
  ],
};
