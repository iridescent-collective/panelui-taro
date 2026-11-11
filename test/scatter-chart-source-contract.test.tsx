// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { projectBubble } from "../src/components/BubbleChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import { ScatterChart, useScatterChart } from "../src/components/ScatterChart";
import type { ScatterChartProps } from "../src/components/ScatterChart";
import { useChart } from "../src/components/ScatterChart/context";
import {
  scatterCircleFrame,
  scatterExtents,
  scatterHit,
  radiusFor,
} from "../src/components/ScatterChart/math";
import FIXTURES from "./fixtures/scatter-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { a: 20, b: 60, s: 10, x: 10 },
  { a: 60, b: 10, s: 30, x: 30 },
  { a: 0, b: null, s: 20, x: 20 },
];
const Probe = () => {
  const state = useScatterChart();
  const { plot, xExtent, yExtent, series } = useChart("probe");
  return (
    <span data-testid="scatter-state">
      {JSON.stringify({ ...state, plot, series, xExtent, yExtent })}
    </span>
  );
};
Probe.layer = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("scatter-state").textContent ?? "{}");
const model = (props: Partial<ScatterChartProps>) => (
  <PanelUIProvider reducedMotion>
    <ScatterChart data={DATA} {...props}>
      <ScatterChart.Header title="Sessions" legend />
      <ScatterChart.Grid />
      <ScatterChart.Points dataKey="a" />
      <ScatterChart.Points dataKey="b" colorIndex={2} />
      <ScatterChart.Skeleton />
      <ScatterChart.XAxis />
      <ScatterChart.YAxis />
      <ScatterChart.Tooltip />
      <Probe />
    </ScatterChart>
  </PanelUIProvider>
);
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const svg = () =>
  decodeURIComponent(
    document
      .querySelector('img[src^="data:image/svg+xml"]')
      ?.getAttribute("src")
      ?.split(",")[1] ?? ""
  );
it.each(FIXTURES.models)(
  "matches pinned two-axis multi-series extent %#",
  ({ input, expected }) => {
    expect(scatterExtents(input.data, input.xDataKey, input.keys)).toEqual(
      expected
    );
  }
);
it.each(FIXTURES.frames)(
  "matches pinned stagger/landing/swelling Dot frame %#",
  ({ input, expected }) => {
    expect(
      scatterCircleFrame({
        ...input,
        xExtent: [input.xExtent[0], input.xExtent[1]],
        yExtent: [input.yExtent[0], input.yExtent[1]],
      })
    ).toEqual(expected);
  }
);
it("renders measured axes with source padding and series colors", async () => {
  setTestMeasurement(300, 375);
  render(model({ id: "consumer-scatter" }));
  await settle();
  expect(probe().plot).toEqual({ height: 264, left: 44, top: 14, width: 242 });
  expect(probe().xExtent).toEqual([8.4, 31.6]);
  expect(probe().yExtent).toEqual([-4.8, 64.8]);
  expect(svg().match(/<circle /gu)).toHaveLength(5);
  expect(svg()).toContain('r="4.5"');
  expect(svg()).toContain('fill="#262626"');
  expect(svg()).toContain('fill="#3b82f6"');
  expect(
    screen.getByRole("img", { name: "Scatter chart, 3 data entries" })
  ).toBeTruthy();
});
it("nearest point selection tracks series identity and clears an empty corner", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActivePointChange: change }));
  await settle();
  const { plot, xExtent, yExtent } = probe();
  const center = projectBubble({ x: 10, y: 20 }, plot, xExtent, yExtent);
  const pointer = document.querySelector("canvas.panel-scatter-pointer");
  if (!pointer) {
    throw new Error("Missing pointer");
  }
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 2, x: center.x, y: center.y }],
  });
  expect(probe().activePoint.dataKey).toBe("a");
  expect(probe().activePoint.index).toBe(0);
  expect(svg()).toContain('r="6.75"');
  expect(screen.getByText("10 · 20")).toBeTruthy();
  fireEvent.touchMove(pointer, { touches: [{ identifier: 2, x: 0, y: 0 }] });
  expect(probe().activePoint).toBeNull();
  fireEvent.touchEnd(pointer);
  expect(change.mock.calls.map(([point]) => point?.dataKey ?? null)).toEqual([
    "a",
    null,
  ]);
});
it("equal hit distances preserve source last-owner tie and fixed radius", () => {
  const data = [{ a: 1, b: 1, x: 1 }];
  const plot = { height: 100, left: 0, top: 0, width: 100 };
  expect(
    scatterHit(data, ["a", "b"], "x", plot, [0, 2], [0, 2], 50, 50, 32)?.dataKey
  ).toBe("b");
  expect(
    scatterHit(data, ["a"], "x", plot, [0, 2], [0, 2], 83, 50, 32)
  ).toBeNull();
});
it("sizeKey maps a whole series to area and leaves invalid sizes at fallback", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <ScatterChart data={DATA}>
        <ScatterChart.Points dataKey="a" sizeKey="s" />
        <Probe />
      </ScatterChart>
    </PanelUIProvider>
  );
  await settle();
  expect(svg()).toContain('r="3"');
  expect(svg()).toContain('r="14"');
  expect(radiusFor(null, [10, 30], [3, 14], 4.5)).toBe(4.5);
});
it("loading keeps deterministic24 point field and returns to real dots", async () => {
  setTestMeasurement(300, 375);
  const view = render(model({ status: "loading" }));
  await settle();
  expect(svg().match(/<circle /gu)).toHaveLength(24);
  expect(svg()).toContain('r="4.5"');
  expect(document.querySelector("canvas.panel-scatter-pointer")).toBeNull();
  view.rerender(model({ status: "ready" }));
  await settle();
  expect(svg().match(/<circle /gu)).toHaveLength(5);
});
it("compact layout drops axis gutters and removing a series updates shared domains", async () => {
  setTestMeasurement(300, 375);
  const view = render(
    <PanelUIProvider reducedMotion>
      <ScatterChart data={DATA} compact>
        <ScatterChart.Points dataKey="a" />
        <ScatterChart.YAxis />
        <Probe />
      </ScatterChart>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().plot).toEqual({ height: 292, left: 4, top: 4, width: 292 });
  expect(probe().series).toHaveLength(1);
  view.rerender(
    <PanelUIProvider reducedMotion>
      <ScatterChart data={DATA} compact>
        <ScatterChart.Points dataKey="b" />
        <ScatterChart.YAxis />
        <Probe />
      </ScatterChart>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().series.map(([key]: [string, string]) => key)).toEqual(["b"]);
  expect(probe().yExtent).toEqual([6, 64]);
  expect(svg().match(/<circle /gu)).toHaveLength(2);
});
