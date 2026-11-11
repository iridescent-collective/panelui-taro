// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PieChart, usePieChart } from "../src/components/PieChart";
import type { PieChartProps } from "../src/components/PieChart";
import { pieSlices, pieTotal } from "../src/components/PieChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import { wedgePath } from "../src/lib/chart";
import {
  contoursContainPoint,
  wedgeContours,
} from "../src/primitives/wedge-hit";
import FIXTURES from "./fixtures/pie-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { label: "Read", value: 20 },
  { label: "Practice", value: 30 },
  { label: "Walk", value: 50 },
];
const Probe = () => (
  <span data-testid="pie-state">{JSON.stringify(usePieChart())}</span>
);
const probe = () =>
  JSON.parse(screen.getByTestId("pie-state").textContent ?? "{}");
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const model = (props: Partial<PieChartProps> = {}) => (
  <PanelUIProvider reducedMotion>
    <PieChart data={DATA} size={240} innerRadius={0.65} {...props}>
      <PieChart.Header title="Activity" />
      <PieChart.Slices />
      <PieChart.Skeleton />
      <PieChart.Center />
      <PieChart.Legend />
      <Probe />
    </PieChart>
  </PanelUIProvider>
);
const pointer = () => {
  const canvas = document.querySelector("canvas.panel-pie-pointer");
  if (!canvas) {
    throw new Error("Missing pie canvas");
  }
  return canvas;
};
const tap = (x: number, y: number) => {
  fireEvent.touchStart(pointer(), { touches: [{ identifier: 1, x, y }] });
  fireEvent.touchEnd(pointer(), {
    changedTouches: [{ identifier: 1, x, y }],
    touches: [],
  });
};
const svg = () =>
  decodeURIComponent(
    document
      .querySelector('img[src^="data:image/svg+xml"]')
      ?.getAttribute("src")
      ?.split(",")[1] ?? ""
  );
it.each(FIXTURES.angles)(
  "matches source pie allocation %#",
  ({ input, expected }) => {
    expect(
      pieSlices(
        input.data,
        pieTotal(input.data),
        input.origin,
        input.span,
        input.padAngle,
        input.minAngle
      )
    ).toEqual(expected);
  }
);
it.each(FIXTURES.paths)(
  "matches source rounded wedge path %#",
  ({ input, expected }) => {
    expect(
      wedgePath(
        input[0],
        input[1],
        input[2],
        input[3],
        input[4],
        input[5],
        input[6]
      )
    ).toBe(expected);
  }
);
it("keeps holes, gaps and rounded corners outside hit geometry", () => {
  const shape = {
    corner: 12,
    cx: 120,
    cy: 120,
    from: 0.01,
    inner: 50,
    outer: 100,
    to: 0.24,
  };
  const contours = wedgeContours(shape);
  expect(contoursContainPoint(contours, 175, 65)).toBe(true);
  expect(contoursContainPoint(contours, 120, 120)).toBe(false);
  expect(contoursContainPoint(contours, 120, 20)).toBe(false);
  expect(contoursContainPoint(contours, 220, 120)).toBe(false);
  expect(contoursContainPoint(contours, 120, 210)).toBe(false);
  const full = wedgeContours({ ...shape, from: 0, to: 1 });
  expect(contoursContainPoint(full, 120, 120)).toBe(false);
  expect(contoursContainPoint(full, 120, 40)).toBe(true);
  expect(wedgeContours({ ...shape, to: shape.from })).toEqual([]);
});
it("rejects unbounded hit geometry before arc subdivision", () => {
  const acos = vi.spyOn(Math, "acos").mockReturnValue(1);
  try {
    const base = {
      corner: 12,
      cx: 120,
      cy: 120,
      from: 0,
      inner: 50,
      outer: 100,
      to: 0.5,
    };
    expect(wedgeContours({ ...base, outer: Infinity })).toEqual([]);
    expect(wedgeContours({ ...base, outer: 2e18 })).toEqual([]);
    expect(wedgeContours({ ...base, from: Number.NaN })).toEqual([]);
    expect(acos).not.toHaveBeenCalled();
  } finally {
    acos.mockRestore();
  }
});
it("draws source slices, reads totals, selects and toggles with native canvas events", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  expect(svg().match(/<path /gu)).toHaveLength(3);
  expect(screen.getByText("Total")).toBeTruthy();
  expect(screen.getByText("100")).toBeTruthy();
  tap(175, 45);
  expect(probe().activeIndex).toBe(0);
  expect(probe().activeSlice.label).toBe("Read");
  expect(probe().activeFraction).toBe(0.2);
  expect(svg()).toContain('fill-opacity="0.35"');
  tap(175, 45);
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([0, -1]);
});
it("controlled legend changes remain controlled and center disappears without hole", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  const view = render(model({ activeIndex: 2, onActiveIndexChange: change }));
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Read, 20 percent" }));
  expect(change).toHaveBeenCalledWith(0);
  expect(probe().activeIndex).toBe(2);
  view.rerender(model({ innerRadius: 0 }));
  await settle();
  expect(screen.queryByText("Total")).toBeNull();
  tap(120, 120);
  expect(probe().activeIndex).toBeGreaterThanOrEqual(0);
});
it("loading blocks hits and renders one source skeleton until ready", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  const view = render(
    model({ onActiveIndexChange: change, status: "loading" })
  );
  await settle();
  expect(svg().match(/<path /gu)).toHaveLength(1);
  expect(document.querySelector("canvas.panel-pie-pointer")).toBeNull();
  expect(change).not.toHaveBeenCalled();
  view.rerender(model({ onActiveIndexChange: change }));
  await settle();
  expect(svg().match(/<path /gu)).toHaveLength(3);
  tap(175, 45);
  expect(change).toHaveBeenCalledWith(0);
});
it.each([Infinity, Number.NaN, 2e18])(
  "does not publish an unbounded chart viewport %s",
  async (size) => {
    setTestMeasurement(240, 375);
    render(model({ size }));
    await settle();
    expect(document.querySelector("canvas.panel-pie-pointer")).toBeNull();
    expect(svg()).toBe("");
  }
);
