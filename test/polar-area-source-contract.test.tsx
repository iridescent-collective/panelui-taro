// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import {
  PolarAreaChart,
  usePolarAreaChart,
} from "../src/components/PolarAreaChart";
import type {
  PolarAreaChartHandle,
  PolarAreaChartProps,
} from "../src/components/PolarAreaChart";
import { polarMax, polarWedges } from "../src/components/PolarAreaChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import { wedgePath } from "../src/lib/chart";
import { inkOn, seriesColorAt } from "../src/lib/chart-colors";
import FIXTURES from "./fixtures/polar-area-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { label: "Read", value: 20 },
  { label: "Practice", value: 50 },
  { label: "Walk", value: 100 },
];
const Probe = () => (
  <span data-testid="polar-state">{JSON.stringify(usePolarAreaChart())}</span>
);
const probe = () =>
  JSON.parse(screen.getByTestId("polar-state").textContent ?? "{}");
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const model = (props: Partial<PolarAreaChartProps> = {}) => (
  <PanelUIProvider reducedMotion>
    <PolarAreaChart data={DATA} size={240} {...props}>
      <PolarAreaChart.Header title="Scores" />
      <PolarAreaChart.Grid spokes />
      <PolarAreaChart.Wedges />
      <PolarAreaChart.Labels />
      <PolarAreaChart.Tooltip />
      <PolarAreaChart.Legend />
      <PolarAreaChart.Skeleton />
      <Probe />
    </PolarAreaChart>
  </PanelUIProvider>
);
const svg = () =>
  decodeURIComponent(
    document
      .querySelector('img[src^="data:image/svg+xml"]')
      ?.getAttribute("src")
      ?.split(",")[1] ?? ""
  );
const tap = (x: number, y: number) => {
  const canvas = document.querySelector("canvas.panel-polar-pointer");
  if (!canvas) {
    throw new Error("Missing polar canvas");
  }
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x, y }] });
  fireEvent.touchEnd(canvas, {
    changedTouches: [{ identifier: 1, x, y }],
    touches: [],
  });
};
it.each(FIXTURES.wedges)(
  "matches pinned equal-angle wedge and max %#",
  ({ input, expected }) => {
    const maxValue = polarMax(input.data, input.maxValue);
    expect({
      maxValue,
      wedges: polarWedges(
        input.data,
        input.radius,
        input.origin,
        input.padAngle,
        maxValue,
        input.scale as "radius" | "area"
      ),
    }).toEqual(expected);
  }
);
it.each(FIXTURES.colors)(
  "matches pinned palette tone lap %#",
  ({ input, expected }) =>
    expect(seriesColorAt(input.palette, input.index)).toBe(expected)
);
it.each(FIXTURES.ink)(
  "matches source label contrast %#",
  ({ input, expected }) =>
    expect(inkOn(input.fill, input.behind, input.opacity)).toEqual(expected)
);
it("draws three independent readings on radius grid and selects a short wedge through its legend", async () => {
  setTestMeasurement(240, 375);
  render(model());
  await settle();
  expect(svg().match(/<circle /gu)).toHaveLength(4);
  expect(svg().match(/<line /gu)).toHaveLength(3);
  expect(svg().match(/<path /gu)).toHaveLength(3);
  expect(svg()).toContain('r="30"');
  expect(screen.queryByText("20%")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Read, 20" }));
  expect(probe().activeWedge).toEqual(DATA[0]);
  expect(probe().activeFraction).toBe(0.2);
  expect(svg()).toContain('fill-opacity="0.35"');
  fireEvent.click(screen.getByRole("button", { name: "Read, 20" }));
  expect(probe().activeIndex).toBe(-1);
});
it("changes all grid radii with area scale and preserves default maximum ladder", async () => {
  setTestMeasurement(240, 375);
  render(model({ scale: "area" }));
  await settle();
  expect(svg()).toContain('r="60"');
  expect(svg()).not.toContain('r="30"');
  expect(polarMax([{ label: "One", value: 147 }])).toBe(150);
  expect(polarMax([{ label: "One", value: 0 }])).toBe(1);
});
it("native wedge touch toggles, ignores empty radius and respects controlled refusal", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  const view = render(model({ onActiveIndexChange: change }));
  await settle();
  tap(150, 150);
  expect(probe().activeIndex).toBe(1);
  tap(150, 150);
  expect(probe().activeIndex).toBe(-1);
  tap(190, 40);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, -1]);
  view.rerender(model({ activeIndex: 2, onActiveIndexChange: change }));
  await settle();
  tap(150, 150);
  expect(change).toHaveBeenLastCalledWith(1);
  expect(probe().activeIndex).toBe(2);
});
it("loading draws undivided 62% disc and no tooltip, then restores actual values", async () => {
  setTestMeasurement(240, 375);
  const view = render(model({ activeIndex: 0, status: "loading" }));
  await settle();
  expect(svg()).toContain('r="74.4"');
  expect(svg()).not.toContain("<path ");
  expect(document.querySelector("canvas.panel-polar-pointer")).toBeNull();
  view.rerender(model({ activeIndex: 0 }));
  await settle();
  expect(svg().match(/<path /gu)).toHaveLength(3);
  expect(screen.getAllByText("20").length).toBeGreaterThan(0);
});
it("does not generate unbounded rings or nonfinite drawing geometry", async () => {
  setTestMeasurement(240, 375);
  render(
    <PanelUIProvider reducedMotion>
      <PolarAreaChart data={DATA} size={240} maxValue={Number.NaN}>
        <PolarAreaChart.Grid rings={Infinity} />
        <PolarAreaChart.Wedges />
      </PolarAreaChart>
    </PanelUIProvider>
  );
  await settle();
  expect(svg()).not.toMatch(/NaN|Infinity/u);
  expect(svg()).not.toContain("<circle ");
});
it("renders labels after the fifth palette entry and keeps short hex fills legible", async () => {
  setTestMeasurement(240, 375);
  const data = Array.from({ length: 7 }, (_, index) => ({
    label: `Shade ${index}`,
    value: 100 + index,
    ...(index === 6 ? { color: "#fff" } : {}),
  }));
  render(model({ data }));
  await settle();
  expect(svg()).toContain('fill="rgb(');
  expect(svg()).toContain('fill="#fff"');
  expect(screen.getAllByText("106").map((node) => node.style.color)).toContain(
    "#0a0a0a"
  );
});
it("grows radius instead of angle over source 620ms and replays through the public ref", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(240, 375);
    const ref = createRef<PolarAreaChartHandle>();
    render(
      <PanelUIProvider reducedMotion={false}>
        <PolarAreaChart data={DATA} size={240} ref={ref}>
          <PolarAreaChart.Wedges />
        </PolarAreaChart>
      </PanelUIProvider>
    );
    await settle();
    expect(svg()).not.toContain(wedgePath(120, 120, 120, 0, 2 / 3, 1, 0));
    act(() => vi.advanceTimersByTime(620));
    expect(svg()).toContain(wedgePath(120, 120, 120, 0, 2 / 3, 1, 0));
    act(() => ref.current?.replay());
    expect(svg()).not.toContain(wedgePath(120, 120, 120, 0, 2 / 3, 1, 0));
    act(() => vi.advanceTimersByTime(620));
    expect(svg()).toContain(wedgePath(120, 120, 120, 0, 2 / 3, 1, 0));
  } finally {
    vi.useRealTimers();
  }
});
