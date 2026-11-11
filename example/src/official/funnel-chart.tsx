import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import {
  FunnelChart,
  type FunnelDatum,
} from "panelui-taro/funnel-chart";
import { Skeleton } from "panelui-taro/skeleton";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const CHECKOUT: FunnelDatum[] = [
  { label: "Viewed", value: 41800 },
  { label: "Basket", value: 18240 },
  { label: "Checkout", value: 9420 },
  { label: "Payment", value: 6180 },
  { label: "Paid", value: 5240 },
];
const PIPELINE: FunnelDatum[] = [
  { label: "Applied", value: 1240 },
  { label: "Screened", value: 420 },
  { label: "Phone", value: 96 },
  { label: "Offer", value: 18 },
  { label: "Hired", value: 11 },
];
const SIGNUP: FunnelDatum[] = [
  { label: "Visited", value: 24600 },
  { label: "Signed up", value: 8400 },
  { label: "Activated", value: 3900 },
  { label: "Paid", value: 1120 },
];
const people = (value: number) => value.toLocaleString();
function FunnelBasicVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Checkout</Frame.Title>
          <Frame.Action>Last 7 days</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <FunnelChart data={CHECKOUT} className="px-2 pb-4">
            <FunnelChart.Header
              className={CHART_HEADER}
              title="Product viewed"
              value={people(CHECKOUT[0]!.value)}
              caption="13% of them placed an order"
            />
            <FunnelChart.Stages />
            <FunnelChart.Labels />
          </FunnelChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function FunnelConversionVersion() {
  const [active, setActive] = useState(-1);
  const stage = active >= 0 ? CHECKOUT[active] : null;
  const previous = active > 0 ? CHECKOUT[active - 1] : null;
  const share = stage ? stage.value / CHECKOUT[0]!.value : 1;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Where they go</Frame.Title>
          <Frame.Action>Tap a stage</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <FunnelChart
            data={CHECKOUT}
            className="px-2 pb-4"
            gap={6}
            activeIndex={active}
            onActiveIndexChange={setActive}
          >
            <FunnelChart.Header
              className={CHART_HEADER}
              title={stage ? stage.label : "Everyone who looked"}
              value={people(stage ? stage.value : CHECKOUT[0]!.value)}
              caption={
                previous && stage
                  ? `${Math.round((stage.value / previous.value) * 100)}% of ${previous.label.toLowerCase()} · ${Math.round(share * 100)}% of all`
                  : "Five steps, 13% of the way through"
              }
            />
            <FunnelChart.Stages />
            <FunnelChart.Labels share="previous" />
          </FunnelChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function FunnelPipelineVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Hiring</Frame.Title>
          <Frame.Action>This quarter</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <FunnelChart
            data={PIPELINE}
            minWidth={0.16}
            edges="straight"
            layers={1}
            className="px-2 pb-4"
          >
            <FunnelChart.Header
              className={CHART_HEADER}
              title="Applications"
              value={people(PIPELINE[0]!.value)}
              caption="11 hires, from 1,240 applications"
            />
            <FunnelChart.Stages />
            <FunnelChart.Labels />
          </FunnelChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function FunnelGlowVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Checkout</Frame.Title>
          <Frame.Action>The step that pays</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <FunnelChart
            data={CHECKOUT.map((stage) =>
              stage.label === "Paid" ? { ...stage, color: "#34d399" } : stage
            )}
            layers={5}
            height={230}
            className="px-2 pb-4"
          >
            <FunnelChart.Header
              className={CHART_HEADER}
              title="Order placed"
              value={people(CHECKOUT[4]!.value)}
              caption="The one stage worth its own colour"
            />
            <FunnelChart.Stages />
            <FunnelChart.Labels />
          </FunnelChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function FunnelCompactVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Signup</Frame.Title>
        </Frame.Header>
        <Frame.Panel>
          <FunnelChart data={SIGNUP} height={120} gap={3} className="p-4">
            <FunnelChart.Stages />
            <FunnelChart.Legend />
          </FunnelChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function FunnelLoadingVersion() {
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
          <Frame.Title>Checkout</Frame.Title>
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
          <FunnelChart
            data={status === "loading" ? [] : CHECKOUT}
            status={status}
            className="px-2 pb-4"
          >
            <FunnelChart.Header
              className={CHART_HEADER}
              title="Product viewed"
              value={status === "loading" ? "—" : people(CHECKOUT[0]!.value)}
            />
            <FunnelChart.Skeleton />
            <FunnelChart.Stages />
            <FunnelChart.Labels />
          </FunnelChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "funnel-chart",
  name: "FunnelChart",
  summary: "Where a population drained away, one step at a time",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "Five steps of a checkout, each labelled with what it converted at.",
      render: () => <FunnelBasicVersion />,
    },
    {
      label: "Conversion",
      id: "conversion",
      fullPage: true,
      description:
        "Each step against the one above it, and both readings in the header.",
      render: () => <FunnelConversionVersion />,
    },
    {
      label: "Pipeline",
      id: "pipeline",
      fullPage: true,
      description:
        "A hard drop-off, drawn flat, with a floor under the stages too small to see.",
      render: () => <FunnelPipelineVersion />,
    },
    {
      label: "Glow",
      id: "glow",
      fullPage: true,
      description:
        "A deeper halo, and one stage pulled out of the fade into its own colour.",
      render: () => <FunnelGlowVersion />,
    },
    {
      label: "Compact",
      id: "compact",
      fullPage: true,
      description:
        "The run as a shape, with the reading in a key underneath it.",
      render: () => <FunnelCompactVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "One plain taper while it waits, because an invented drop-off is a lie.",
      render: () => <FunnelLoadingVersion />,
    },
  ],
};
