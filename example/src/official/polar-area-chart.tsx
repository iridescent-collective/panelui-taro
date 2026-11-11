import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import {
  PolarAreaChart,
  type PolarAreaDatum,
} from "panelui-taro/polar-area-chart";
import { Skeleton } from "panelui-taro/skeleton";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const LATENCY: PolarAreaDatum[] = [
  { label: "Frankfurt", value: 120 },
  { label: "Dublin", value: 98 },
  { label: "Virginia", value: 86 },
  { label: "São Paulo", value: 140 },
  { label: "Singapore", value: 75 },
  { label: "Sydney", value: 65 },
];
const POLAR_SIZE = 232;
function PolarAreaBasicVersion() {
  const [active, setActive] = useState(-1);
  const region = active >= 0 ? LATENCY[active] : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Response times</Frame.Title>
          <Frame.Action>Tap a wedge</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PolarAreaChart
            data={LATENCY}
            size={POLAR_SIZE}
            className="pb-4"
            activeIndex={active}
            onActiveIndexChange={setActive}
          >
            <PolarAreaChart.Header
              className={CHART_HEADER}
              value={`${region ? region.value : 97} ms`}
              caption={
                region
                  ? `${region.label}, p95`
                  : "Median across six regions, p95"
              }
            />
            <PolarAreaChart.Grid />
            <PolarAreaChart.Wedges cornerRadius={4} />
            <PolarAreaChart.Labels />
            <PolarAreaChart.Legend className="px-4" />
          </PolarAreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PolarAreaScaleVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Area, not radius</Frame.Title>
          <Frame.Action>scale=&quot;area&quot;</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PolarAreaChart
            data={LATENCY}
            size={POLAR_SIZE}
            scale="area"
            className="pb-4"
          >
            <PolarAreaChart.Header
              className={CHART_HEADER}
              title="Same six readings"
              caption="The ink is proportional to the value, so the rings bunch outwards"
            />
            <PolarAreaChart.Grid rings={5} />
            <PolarAreaChart.Wedges cornerRadius={4} />
            <PolarAreaChart.Labels />
            <PolarAreaChart.Legend className="px-4" />
          </PolarAreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PolarAreaLoadingVersion() {
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
          <Frame.Title>Waiting for readings</Frame.Title>
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
          <PolarAreaChart
            data={LATENCY}
            size={POLAR_SIZE}
            status={status}
            className="pb-4"
          >
            <PolarAreaChart.Header
              className={CHART_HEADER}
              title="Response times"
            />
            <PolarAreaChart.Grid />
            <PolarAreaChart.Skeleton />
            <PolarAreaChart.Wedges cornerRadius={4} />
            <PolarAreaChart.Labels />
            {status === "ready" ? (
              <PolarAreaChart.Legend className="px-4" />
            ) : null}
          </PolarAreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "polar-area-chart",
  name: "PolarAreaChart",
  summary: "Several readings on one scale, compared as wedges",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description: "Equal angles, and the radius carrying the reading.",
      render: () => <PolarAreaBasicVersion />,
    },
    {
      label: "Area scale",
      id: "area",
      fullPage: true,
      description:
        "The ink proportional to the value, which flattens the dial.",
      render: () => <PolarAreaScaleVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "One plain disc while it waits, because invented readings are a lie.",
      render: () => <PolarAreaLoadingVersion />,
    },
  ],
};
