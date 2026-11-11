import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { PieChart, type PieDatum } from "panelui-taro/pie-chart";
import { Skeleton } from "panelui-taro/skeleton";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const money = (value: number) => `£${value.toLocaleString()}`;
const SPEND: PieDatum[] = [
  { label: "Rent", value: 1450 },
  { label: "Food", value: 620 },
  { label: "Transport", value: 210 },
  { label: "Utilities", value: 185 },
  { label: "Everything else", value: 240 },
];
const TRAFFIC_SOURCES: PieDatum[] = [
  { label: "Organic", value: 41800 },
  { label: "Direct", value: 18400 },
  { label: "Referral", value: 6300 },
  { label: "Social", value: 2100 },
  { label: "Email", value: 240 },
];
const SPEND_TOTAL = SPEND.reduce((sum, slice) => sum + slice.value, 0);
const PIE_SIZE = 208;
function PieBasicVersion() {
  const [active, setActive] = useState(-1);
  const slice = active >= 0 ? SPEND[active] : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Where it went</Frame.Title>
          <Frame.Action>Tap a slice</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PieChart
            data={SPEND}
            size={PIE_SIZE}
            className="pb-4"
            activeIndex={active}
            onActiveIndexChange={setActive}
          >
            <PieChart.Header
              className={CHART_HEADER}
              value={money(slice ? slice.value : SPEND_TOTAL)}
              caption={
                slice
                  ? `${slice.label} · ${Math.round((slice.value / SPEND_TOTAL) * 100)}% of the month`
                  : "August, across five categories"
              }
            />
            <PieChart.Slices />
            <PieChart.Legend className="px-4" />
          </PieChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PieDonutVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly spend</Frame.Title>
          <Frame.Action>Tap for a category</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PieChart
            data={SPEND}
            size={PIE_SIZE}
            innerRadius={0.62}
            className="pb-4"
          >
            <PieChart.Header className={CHART_HEADER} title="August" />
            <PieChart.Slices />
            <PieChart.Center formatValue={(value) => money(value)} />
            <PieChart.Legend className="px-4" />
          </PieChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PieSegmentsVersion() {
  const [active, setActive] = useState(-1);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Traffic by source</Frame.Title>
          <Frame.Action>Last 30 days</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PieChart
            data={TRAFFIC_SOURCES}
            size={PIE_SIZE}
            innerRadius={0.58}
            padAngle={3}
            minAngle={6}
            className="pb-4"
            activeIndex={active}
            onActiveIndexChange={setActive}
          >
            <PieChart.Header className={CHART_HEADER} title="Sessions" />
            <PieChart.Slices cornerRadius={6} />
            <PieChart.Center defaultLabel="Sessions" />
            <PieChart.Legend className="px-4" />
          </PieChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
const STORAGE: PieDatum[] = [
  { label: "Photos", value: 684 },
  { label: "Video", value: 412 },
  { label: "Backups", value: 233 },
  { label: "Free", value: 719 },
];
function PieDialVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Storage</Frame.Title>
          <Frame.Action>2 TB plan</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PieChart
            data={STORAGE}
            size={PIE_SIZE}
            innerRadius={0.66}
            startAngle={-135}
            endAngle={135}
            padAngle={2}
            className="pb-4"
          >
            <PieChart.Header className={CHART_HEADER} title="In use" />
            <PieChart.Slices cornerRadius={4} />
            <PieChart.Center
              defaultLabel="Used"
              formatValue={(value) => `${value.toFixed(0)} GB`}
            />
            <PieChart.Legend className="px-4" />
          </PieChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PieLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 500);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly spend</Frame.Title>
          <Frame.Action>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setStatus("loading")}
            >
              Reload
            </Button>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PieChart
            data={SPEND}
            size={PIE_SIZE}
            innerRadius={0.62}
            status={status}
            className="pb-4"
          >
            <PieChart.Header className={CHART_HEADER} title="August" />
            <PieChart.Skeleton />
            <PieChart.Slices />
            {status === "ready" ? (
              <PieChart.Center formatValue={(value) => money(value)} />
            ) : null}
            {status === "ready" ? <PieChart.Legend className="px-4" /> : null}
          </PieChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "pie-chart",
  name: "PieChart",
  summary: "One whole, divided between its parts",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description: "Five parts of one obvious total, with a key beside them.",
      render: () => <PieBasicVersion />,
    },
    {
      label: "Donut",
      id: "donut",
      fullPage: true,
      description:
        "The hole is where the total goes — the one figure a pie can be read for.",
      render: () => <PieDonutVersion />,
    },
    {
      label: "Segments",
      id: "segments",
      fullPage: true,
      description:
        "Padded and rounded, with a floor under the slices too small to see.",
      render: () => <PieSegmentsVersion />,
    },
    {
      label: "Dial",
      id: "dial",
      fullPage: true,
      description:
        "Three quarters of a turn rather than all of it, notch at the bottom.",
      render: () => <PieDialVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "One undivided band while it waits, because an invented split is a lie.",
      render: () => <PieLoadingVersion />,
    },
  ],
};
