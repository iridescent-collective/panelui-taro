// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { HexChart, useHexChart } from "../src/components/HexChart";
import type { HexChartProps } from "../src/components/HexChart";
import { useChart } from "../src/components/HexChart/context";
import {
  hexMetrics,
  hexRadiusFor,
  hexRowsFor,
  hexPlan,
  hexAt,
  hexCenter,
  shareCounts,
} from "../src/components/HexChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/hex-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { label: "Direct", value: 100 },
  { label: "Search", value: 60 },
  { label: "Referral", value: 10 },
];
const Probe = () => {
  const state = useHexChart();
  const { plan, metrics, left, top, rows, columns } = useChart("probe");
  return (
    <span data-testid="hex-state">
      {JSON.stringify({ ...state, columns, left, metrics, plan, rows, top })}
    </span>
  );
};
Probe.slot = "footer" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("hex-state").textContent ?? "{}");
const model = (props: Partial<HexChartProps>) => (
  <PanelUIProvider reducedMotion>
    <HexChart data={DATA} {...props}>
      <HexChart.Header title="Attributed revenue" value="170" />
      <HexChart.Cells />
      <HexChart.Tooltip showCells />
      <HexChart.Skeleton />
      <HexChart.Legend />
      <Probe />
    </HexChart>
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
  "matches pinned count budget/hashed blob/paths/anchors %#",
  ({ input, expected }) => {
    const shape = input.shape === "blob" ? "blob" : "grid";
    const metrics = hexMetrics(hexRadiusFor(input.width, input.columns));
    const height = input.width / 1.6;
    const rows = hexRowsFor(height, metrics);
    const fieldWidth = metrics.stepX * (input.columns + 0.5);
    const fieldHeight = (rows - 1) * metrics.stepY + metrics.height;
    const left = (input.width - fieldWidth) / 2;
    const top = (height - fieldHeight) / 2;
    expect({
      fieldHeight,
      fieldWidth,
      left,
      metrics,
      plan: hexPlan(
        input.data,
        metrics,
        rows,
        input.columns,
        shape,
        input.density,
        0.14,
        left,
        top,
        fieldWidth,
        input.loading
      ),
      rows,
      top,
    }).toEqual(expected);
  }
);
it.each(FIXTURES.counts)(
  "matches pinned largest remainder allocation %#",
  ({ values, budget, expected }) => {
    expect(shareCounts(values, budget)).toEqual(expected);
  }
);
it.each(FIXTURES.hits)(
  "matches pinned nearest native press cell %#",
  ({ input, expected }) => {
    expect(
      hexAt(
        input.x,
        input.y,
        input.metrics,
        input.left,
        input.top,
        input.columns,
        input.rows
      )
    ).toEqual(expected);
  }
);
it("renders one source path per series and visible denominator field", async () => {
  setTestMeasurement(300, 375);
  render(model({ id: "consumer-hex" }));
  await settle();
  expect(svg().match(/<path /gu)).toHaveLength(4);
  expect(svg()).toContain("ellipse");
  expect(svg()).toContain('fill="#262626"');
  expect(
    probe().plan.counts.reduce((sum: number, count: number) => sum + count, 0)
  ).toBe(Math.round(probe().columns * probe().rows * 0.55));
  expect(
    screen.getByRole("button", { name: "Direct, 59 percent" })
  ).toBeTruthy();
});
it("legend selects and dims other series then toggles selected series off", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Search, 35 percent" }));
  expect(probe().activeIndex).toBe(1);
  expect(probe().activeFraction).toBe(60 / 170);
  expect(probe().activeCells).toBe(probe().plan.counts[1]);
  expect(svg()).toContain('fill-opacity="0.25"');
  expect(screen.getByText("60")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Search, 35 percent" }));
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, -1]);
});
it("native canvas press resolves ownership and unfilled cell clears selection", async () => {
  setTestMeasurement(300, 375);
  render(model({}));
  await settle();
  const state = probe();
  const owned = state.plan.owners.indexOf(2);
  const center = hexCenter(
    owned % state.columns,
    Math.floor(owned / state.columns),
    state.metrics,
    state.left,
    state.top
  );
  const pointer = document.querySelector("canvas.panel-hex-pointer");
  if (!pointer) {
    throw new Error("Missing hex pointer");
  }
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 7, x: center.x, y: center.y }],
  });
  fireEvent.touchEnd(pointer);
  expect(probe().activeIndex).toBe(2);
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 7, x: -20, y: -20 }],
  });
  fireEvent.touchEnd(pointer);
  expect(probe().activeIndex).toBe(-1);
});
it("grid spends full budget and switches reveal to an exact width wipe", async () => {
  setTestMeasurement(300, 375);
  render(model({ density: 0.01, shape: "grid" }));
  await settle();
  expect(probe().plan.field).toBe("");
  expect(
    probe().plan.counts.reduce((sum: number, count: number) => sum + count, 0)
  ).toBe(probe().rows * probe().columns);
  expect(svg()).not.toContain("ellipse");
  expect(svg()).toContain('width="300"');
});
it("loading shows an undivided skeleton then source split returns", async () => {
  setTestMeasurement(300, 375);
  const view = render(model({ status: "loading" }));
  await settle();
  expect(probe().plan.counts).toEqual([0, 0, 0]);
  expect(svg().match(/<path /gu)).toHaveLength(1);
  expect(document.querySelector("canvas.panel-hex-pointer")).toBeNull();
  view.rerender(model({ status: "ready" }));
  await settle();
  expect(svg().match(/<path /gu)).toHaveLength(4);
});
it("controlled selection only reports requests and keeps parent value", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ activeIndex: 0, onActiveIndexChange: change }));
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Search, 35 percent" }));
  expect(change).toHaveBeenCalledWith(1);
  expect(probe().activeIndex).toBe(0);
});
