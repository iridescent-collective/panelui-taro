import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { PyramidChart } from "panelui-taro/pyramid-chart";
import { Tooltip } from "panelui-taro/tooltip";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const PENGUINS = [
  { species: "Adelie", male: 73, female: 73 },
  { species: "Chinstrap", male: 34, female: 34 },
  { species: "Gentoo", male: 61, female: 58 },
];
const POPULATION = [
  { band: "0–14", men: 9.2, women: 8.8 },
  { band: "15–29", men: 10.4, women: 10.1 },
  { band: "30–44", men: 11.8, women: 11.6 },
  { band: "45–59", men: 10.9, women: 11.2 },
];
function PyramidBasicVersion() {
  const [active, setActive] = useState<(typeof PENGUINS)[number] | null>(null);
  const total = PENGUINS.reduce((sum, row) => sum + row.male + row.female, 0);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Penguins observed</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PyramidChart
            data={PENGUINS}
            xDataKey="species"
            aspectRatio={1.4}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof PENGUINS)[number] | null)
            }
          >
            <PyramidChart.Header
              className={CHART_HEADER}
              value={String(active ? active.male + active.female : total)}
              caption={
                active ? `${active.species} · both wings` : "Three species"
              }
              labels={{ male: "Male", female: "Female" }}
              legend
            />
            <PyramidChart.Grid />
            <PyramidChart.Bar dataKey="male" side="start" />
            <PyramidChart.Bar dataKey="female" side="end" colorIndex={5} />
            <PyramidChart.XAxis />
            <PyramidChart.YAxis />
            <PyramidChart.Tooltip />
          </PyramidChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PyramidCentredVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Population by age</Frame.Title>
          <Frame.Action>Millions</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PyramidChart
            data={POPULATION}
            xDataKey="band"
            aspectRatio={1.5}
            barGap={0.3}
          >
            <PyramidChart.Header
              className={CHART_HEADER}
              value="42.0m"
              caption="Four bands, read outward from the centre"
              labels={{ men: "Men", women: "Women" }}
              legend
            />
            <PyramidChart.Grid columns={2} />
            <PyramidChart.Bar dataKey="men" side="start" />
            <PyramidChart.Bar dataKey="women" side="end" colorIndex={5} />
            <PyramidChart.XAxis />
            <PyramidChart.YAxis />
            <PyramidChart.Tooltip />
          </PyramidChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PyramidLoadingVersion() {
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
          <PyramidChart
            data={PENGUINS}
            xDataKey="species"
            status={status}
            aspectRatio={1.4}
          >
            <PyramidChart.Grid />
            <PyramidChart.Skeleton />
            <PyramidChart.Bar dataKey="male" side="start" />
            <PyramidChart.Bar dataKey="female" side="end" colorIndex={5} />
            <PyramidChart.XAxis />
            <PyramidChart.YAxis />
          </PyramidChart>
        </Frame.Panel>
      </Frame>
      <Button variant="outline" onPress={() => setStatus("loading")}>
        Load again
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "pyramid-chart",
  name: "PyramidChart",
  summary: "Two series mirrored about a centre, on one shared scale",
  layout: "pager",
  demos: [
    {
      label: "Two wings",
      id: "basic",
      fullPage: true,
      description:
        "Both sides measured on one scale, so their lengths compare.",
      render: () => <PyramidBasicVersion />,
    },
    {
      label: "Population",
      id: "centred",
      fullPage: true,
      description:
        "The shape a population is usually drawn in, with the names over each pair.",
      render: () => <PyramidCentredVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description:
        "Equal stubs either side of the centre, giving way to the real wings.",
      render: () => <PyramidLoadingVersion />,
    },
  ],
};
