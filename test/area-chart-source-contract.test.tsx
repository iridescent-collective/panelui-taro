// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { AreaChart, useAreaChart } from "../src/components/AreaChart";
import type {
  AreaChartDatum,
  AreaChartHandle,
  AreaChartProps,
} from "../src/components/AreaChart";
import {
  areaChartBaselines,
  areaChartExtent,
} from "../src/components/AreaChart/math";
import { useChart } from "../src/components/LineChart/context";
import { PanelUIProvider } from "../src/components/Provider";
import { yOf } from "../src/lib/chart";
import FIXTURES from "./fixtures/area-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA: AreaChartDatum[] = [
  { date: "Jan", direct: 10, search: 20 },
  { date: "Feb", direct: 20, search: 40 },
  { date: "Mar", direct: null, search: 30 },
  { date: "Apr", direct: 40, search: 50 },
];
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const Probe = () => {
  const state = useAreaChart();
  const { extent, plot, series } = useChart("probe");
  return (
    <span data-testid="area-state">
      {JSON.stringify({ ...state, extent, plot, series })}
    </span>
  );
};
const probe = () =>
  JSON.parse(screen.getByTestId("area-state").textContent ?? "{}");
const svg = () =>
  [...document.querySelectorAll('img[src^="data:image/svg+xml"]')].map(
    (image) =>
      decodeURIComponent(image.getAttribute("src")?.split(",")[1] ?? "")
  );
const model = (
  props: Partial<AreaChartProps>,
  ref?: React.Ref<AreaChartHandle>
) => (
  <PanelUIProvider reducedMotion>
    <AreaChart data={DATA} {...props} ref={ref}>
      <AreaChart.Header title="Acquisition" legend />
      <AreaChart.Grid />
      <AreaChart.Area dataKey="direct" />
      <AreaChart.Area dataKey="search" colorIndex={2} />
      <AreaChart.Skeleton />
      <AreaChart.XAxis />
      <AreaChart.YAxis />
      <AreaChart.Tooltip />
      <Probe />
    </AreaChart>
  </PanelUIProvider>
);
it.each(FIXTURES)(
  "matches source extent frame %#",
  ({ data, keys, stacked, expected }) => {
    expect(areaChartExtent(data, keys, stacked)).toEqual(expected);
  }
);
it("keeps declared stack baselines, null as zero below, finite data and fixed domain", () => {
  const series: [string, string][] = [
    ["direct", "black"],
    ["search", "blue"],
  ];
  expect(areaChartBaselines(DATA, series, "direct", true)).toBeUndefined();
  expect(areaChartBaselines(DATA, series, "search", true)).toEqual([
    10, 20, 0, 40,
  ]);
  expect(areaChartBaselines(DATA, series, "search", false)).toBeUndefined();
  expect(areaChartExtent(DATA, ["direct", "search"], true, [0, 200])).toEqual([
    0, 200,
  ]);
  expect(areaChartExtent([{ v: Infinity }], ["v"], false)).toEqual([0, 1]);
});
it("draws stacked bands with source 0.85 opacity and reversed header legend", async () => {
  setTestMeasurement(300, 375);
  render(model({ stacked: true }));
  await settle();
  expect(probe().extent).toEqual([0, 96]);
  expect(probe().plot).toEqual({ height: 116, left: 44, top: 12, width: 246 });
  expect(svg()[1]).toContain('stop-opacity="0.85"');
  expect(svg()[1].match(/<path /gu)).toHaveLength(4);
  const direct = screen.getByText("direct");
  const search = screen.getByText("search");
  expect(search.compareDocumentPosition(direct)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING
  );
  expect(svg()[1]).not.toContain("NaN");
});
it("overlaid bands use source 0.35 and zero floor, honor explicit gradient and line controls", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <AreaChart data={DATA}>
        <AreaChart.Area
          dataKey="direct"
          fillOpacity={0.6}
          gradientToOpacity={0.2}
          showLine={false}
        />
        <AreaChart.Area dataKey="search" colorIndex={2} />
        <Probe />
      </AreaChart>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().extent).toEqual([0, 54]);
  expect(svg()[1]).toContain('stop-opacity="0.35"');
  expect(svg()[1]).toContain('stop-opacity="0.6"');
  expect(svg()[1]).toContain('stop-opacity="0.2"');
  expect(svg()[1].match(/<path /gu)).toHaveLength(3);
});
it("crosshair dots ride cumulative band tops while readout shows raw values and resets on cancel", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change, stacked: true }));
  await settle();
  const canvas = document.querySelector("canvas.panel-area-pointer");
  if (!canvas) {
    throw new Error("Missing area pointer");
  }
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 126, y: 50 }] });
  expect(probe().activeIndex).toBe(1);
  const { plot, extent } = probe();
  expect(svg()[2]).toContain(`cy="${yOf(60, plot, extent[0], extent[1])}"`);
  expect(svg()[2]).toContain('stroke="white"');
  expect(svg()[2]).toContain('stroke-width="2"');
  expect(screen.getByText("20")).toBeTruthy();
  expect(screen.getByText("40")).toBeTruthy();
  fireEvent.touchCancel(canvas);
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, -1]);
});
it("loading uses source baseline band height, replaces pointer, and ref replay exists", async () => {
  setTestMeasurement(300, 375);
  const ref = createRef<AreaChartHandle>();
  const view = render(model({ status: "loading" }, ref));
  await settle();
  expect(svg()[0]).toContain('height="20.88"');
  expect(svg()[0]).toContain('y="107.12"');
  expect(document.querySelector("canvas")).toBeNull();
  view.rerender(model({ status: "ready" }, ref));
  await settle();
  expect(svg()[0]).not.toContain("<rect");
  expect(document.querySelector("canvas")).toBeTruthy();
  act(() => ref.current?.replay());
});

it("retains the public accessible and onLayout contracts in Taro", async () => {
  setTestMeasurement(300, 375);
  const onLayout = vi.fn();
  render(model({ accessible: false, onLayout }));
  await settle();
  expect(
    screen.queryByRole("img", { name: "Area chart, 4 data entries" })
  ).toBeNull();
  expect(onLayout).toHaveBeenCalledWith({
    nativeEvent: { layout: { height: 150, width: 300, x: 4, y: 8 } },
  });
});

it("ignores nonfinite explicit domains before building drawable area paths", () => {
  expect(
    areaChartExtent(DATA, ["direct", "search"], false, [Number.NaN, Infinity])
  ).toEqual([0, 54]);
});
