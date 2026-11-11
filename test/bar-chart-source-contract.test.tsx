// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { BarChart, useBarChart } from "../src/components/BarChart";
import type { BarChartDatum, BarChartProps } from "../src/components/BarChart";
import {
  barChartExtent,
  barChartPath,
  barChartPlot,
} from "../src/components/BarChart/math";
import { useChart } from "../src/components/LineChart/context";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/bar-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA: BarChartDatum[] = [
  { cost: 5, name: "Jan", revenue: 10 },
  { cost: 8, name: "Feb", revenue: 20 },
  { cost: -5, name: "Mar", revenue: null },
  { cost: 16, name: "Apr", revenue: 40 },
];
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const Probe = () => {
  const state = useBarChart();
  const { extent, plot, series } = useChart("probe");
  return (
    <span data-testid="bar-state">
      {JSON.stringify({ ...state, extent, plot, series })}
    </span>
  );
};
const probe = () =>
  JSON.parse(screen.getByTestId("bar-state").textContent ?? "{}");
const svg = () =>
  [...document.querySelectorAll('img[src^="data:image/svg+xml"]')].map(
    (image) =>
      decodeURIComponent(image.getAttribute("src")?.split(",")[1] ?? "")
  );
const model = (props: Partial<BarChartProps>) => (
  <PanelUIProvider reducedMotion>
    <BarChart data={DATA} {...props}>
      <BarChart.Header title="Revenue" legend />
      <BarChart.Grid />
      <BarChart.Bar dataKey="revenue" />
      <BarChart.Bar dataKey="cost" colorIndex={2} />
      <BarChart.Skeleton />
      <BarChart.XAxis />
      <BarChart.YAxis />
      <BarChart.Tooltip />
      <Probe />
    </BarChart>
  </PanelUIProvider>
);
it.each(FIXTURES.frames)(
  "matches source grow/dim bar path frame %#",
  ({ input, expected }) => {
    expect(barChartPath(input)).toEqual(expected);
  }
);
it.each(FIXTURES.domains)(
  "matches source zero-inclusive domain frame %#",
  ({ data, keys, stacked, expected }) => {
    expect(barChartExtent(data, keys, stacked)).toEqual(expected);
  }
);
it("reserves horizontal categories and keeps compact and value-axis padding", () => {
  expect(barChartPlot(300, 150, false, true, "horizontal")).toEqual({
    height: 138,
    left: 68,
    top: 6,
    width: 222,
  });
  expect(barChartPlot(300, 150, false, true, "vertical")).toEqual({
    height: 116,
    left: 44,
    top: 12,
    width: 246,
  });
  expect(barChartPlot(300, 150, true, true, "horizontal")).toEqual({
    height: 146,
    left: 1,
    top: 2,
    width: 298,
  });
});
it("draws grouped source paths, category-band labels and shared semantic data", async () => {
  setTestMeasurement(300, 375);
  render(model({}));
  await settle();
  expect(probe().extent).toEqual([-5.5, 44]);
  expect(svg()[0].match(/<path /gu)).toHaveLength(4);
  expect(svg()[0]).toContain('fill="#3b82f6"');
  expect(svg()[0]).toContain("Q");
  expect(
    screen.getByRole("img", { name: "Bar chart, 4 data entries" })
  ).toBeTruthy();
  expect(screen.getByText("Jan")).toBeTruthy();
  expect(svg()[0]).not.toContain("NaN");
});
it("selects bands by floor and dims other paths while preserving raw tooltip values", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  const canvas = document.querySelector("canvas.panel-bar-pointer");
  if (!canvas) {
    throw new Error("Missing bar pointer");
  }
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 109, y: 50 }] });
  expect(probe().activeIndex).toBe(1);
  expect(svg()[0]).toContain('opacity="0.3"');
  expect(screen.getByText("20")).toBeTruthy();
  expect(screen.getByText("8")).toBeTruthy();
  fireEvent.touchMove(canvas, { touches: [{ identifier: 1, x: 250, y: 50 }] });
  expect(probe().activeIndex).toBe(3);
  fireEvent.touchEnd(canvas);
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, 3, -1]);
});
it("horizontal bars use y bands, omit XAxis and retain categories in the gutter", async () => {
  setTestMeasurement(300, 375);
  render(model({ orientation: "horizontal", stacked: true }));
  await settle();
  expect(probe().extent).toEqual([-5.5, 61.60000000000001]);
  expect(probe().plot.left).toBe(68);
  expect(screen.getAllByText("Jan")).toHaveLength(1);
  const canvas = document.querySelector("canvas.panel-bar-pointer");
  if (!canvas) {
    throw new Error("Missing horizontal pointer");
  }
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 100, y: 80 }] });
  expect(probe().activeIndex).toBe(2);
  expect(screen.getByText("-5")).toBeTruthy();
});
it("loading produces source short stubs and disables pointer and accessible summary", async () => {
  setTestMeasurement(300, 375);
  const view = render(model({ status: "loading" }));
  await settle();
  expect(svg()[0]).toContain("linearGradient");
  expect(svg()[0]).toContain("panelui-bar-skeleton");
  expect(document.querySelector("canvas")).toBeNull();
  expect(
    screen.queryByRole("img", { name: "Bar chart, 4 data entries" })
  ).toBeNull();
  view.rerender(model({ accessible: false, status: "ready" }));
  await settle();
  expect(document.querySelector("canvas")).toBeTruthy();
  expect(svg()[0]).not.toContain("linearGradient");
});

it("ignores nonfinite explicit domains before building drawable bar paths", () => {
  expect(
    barChartExtent(DATA, ["revenue", "cost"], false, [Number.NaN, Infinity])
  ).toEqual([-5.5, 44]);
});
