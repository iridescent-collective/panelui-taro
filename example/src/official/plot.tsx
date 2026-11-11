import { Frame } from "panelui-taro/frame";
import { Plot, usePlot, yOf } from "panelui-taro/plot";
import { Tooltip } from "panelui-taro/tooltip";
import { useState } from "react";

import Animated, { useAnimatedProps } from "../runtime/motion";
import { View } from "../runtime/native";
import { Path as SvgPath } from "../runtime/svg";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
const AnimatedPath = Animated.createAnimatedComponent(SvgPath);
const CHART_HEADER = "px-4 pt-3.5";
const money = (value: number) => `£${value.toLocaleString()}`;
const PLOT_QUARTER = [
  { month: "Jan", revenue: 18400, costs: 13100, orders: 310 },
  { month: "Feb", revenue: 21200, costs: 14600, orders: 352 },
  { month: "Mar", revenue: 19800, costs: 15200, orders: 341 },
  { month: "Apr", revenue: 26100, costs: 17400, orders: 418 },
  { month: "May", revenue: 24700, costs: 18100, orders: 402 },
  { month: "Jun", revenue: 31500, costs: 19300, orders: 486 },
];
const PLOT_TARGET = 28000;
function PlotCombinationVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Trading</Frame.Title>
          <Frame.Action>First half</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Plot
            data={PLOT_QUARTER}
            xDataKey="month"
            aspectRatio={1.7}
            className="px-3 pb-3"
          >
            <Plot.Header
              className={CHART_HEADER}
              title="Revenue"
              value={money(
                PLOT_QUARTER.reduce((sum, row) => sum + row.revenue, 0)
              )}
            />
            <Plot.Legend
              className={CHART_HEADER}
              labels={{ costs: "Costs", revenue: "Revenue" }}
            />
            <Plot.Grid />
            <Plot.Bars dataKey="costs" colorIndex={2} />
            <Plot.Line dataKey="revenue" colorIndex={1} />
            <Plot.Dots dataKey="revenue" colorIndex={1} />
            <Plot.YAxis />
            <Plot.XAxis ticks={6} />
          </Plot>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PlotPinnedVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Against target</Frame.Title>
          <Frame.Action>{money(PLOT_TARGET)}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Plot
            data={PLOT_QUARTER}
            xDataKey="month"
            yDomain={[0, "auto"]}
            nice
            aspectRatio={1.7}
            className="px-3 pb-3"
          >
            <Plot.Header className={CHART_HEADER} title="Revenue by month" />
            <Plot.Grid />
            <Plot.Bars dataKey="revenue" colorIndex={2} />
            <Plot.Rule y={PLOT_TARGET} label="Target" dashed />
            <Plot.YAxis format={(value) => money(Math.round(value))} />
            <Plot.XAxis ticks={6} />
          </Plot>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function BandBetween({ low, high }: { low: number; high: number }) {
  const { plot, domainMin, domainMax } = usePlot();
  const tint = useCSSVariable("--color-chart-3");
  const animatedProps = useAnimatedProps(() => {
    const min = domainMin.value;
    const max = domainMax.value;
    if (max === min) return { d: "" };
    const top = yOf(high, plot, min, max);
    const bottom = yOf(low, plot, min, max);
    return {
      d: `M${plot.left},${top}H${plot.left + plot.width}V${bottom}H${plot.left}Z`,
    };
  });
  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill={typeof tint === "string" ? tint : "#34d399"}
      fillOpacity={0.14}
    />
  );
}
function PlotCustomMarkVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Inside the band</Frame.Title>
          <Frame.Action>A mark of your own</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Plot
            data={PLOT_QUARTER}
            xDataKey="month"
            aspectRatio={1.7}
            className="px-3 pb-3"
          >
            <Plot.Header
              className={CHART_HEADER}
              title="Revenue"
              caption="Shaded where the month was within the plan"
            />
            <Plot.Grid />

            <Plot.Layer>
              <BandBetween low={20000} high={28000} />
            </Plot.Layer>
            <Plot.Area dataKey="revenue" />
            <Plot.Line dataKey="revenue" />
            <Plot.YAxis />
            <Plot.XAxis ticks={6} />
          </Plot>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function PlotCursorVersion() {
  const [active, setActive] = useState(-1);
  const row = active >= 0 ? PLOT_QUARTER[active] : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Drag across it</Frame.Title>
          <Frame.Action>{row ? row.month : "First half"}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Plot
            data={PLOT_QUARTER}
            xDataKey="month"
            aspectRatio={1.7}
            className="px-3 pb-3"
            onActiveIndexChange={setActive}
          >
            <Plot.Header
              className={CHART_HEADER}
              title={row ? `${row.orders} orders` : "Revenue"}
              value={money(
                row
                  ? row.revenue
                  : PLOT_QUARTER[PLOT_QUARTER.length - 1]!.revenue
              )}
            />
            <Plot.Grid />
            <Plot.Area dataKey="revenue" />
            <Plot.Line dataKey="revenue" />
            <Plot.Dots dataKey="revenue" />
            <Plot.YAxis />
            <Plot.XAxis ticks={6} />
            <Plot.Cursor />
            <Plot.Tooltip formatValue={(value) => money(value)} />
          </Plot>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "plot",
  name: "Plot",
  summary: "A chart you assemble out of its marks",
  layout: "pager",
  demos: [
    {
      label: "Combination",
      id: "combination",
      fullPage: true,
      description: "Columns and a line over them, on one shared scale.",
      render: () => <PlotCombinationVersion />,
    },
    {
      label: "A pinned baseline",
      id: "pinned",
      fullPage: true,
      description:
        "Zero held at the bottom, the top left to follow the data, and a target across it.",
      render: () => <PlotPinnedVersion />,
    },
    {
      label: "A mark of your own",
      id: "custom-mark",
      fullPage: true,
      description:
        "A shaded band nothing here ships, drawn on the chart’s own geometry.",
      render: () => <PlotCustomMarkVersion />,
    },
    {
      label: "Cursor and readout",
      id: "cursor",
      fullPage: true,
      description:
        "A drag resolves the row under the finger; the card’s header reads it.",
      render: () => <PlotCursorVersion />,
    },
  ],
};
