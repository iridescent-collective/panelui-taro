// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  LiveLineChart,
  useLiveLineChart,
} from "../src/components/LiveLineChart";
import type {
  LiveLineChartProps,
  LiveLinePoint,
} from "../src/components/LiveLineChart";
import { useChart } from "../src/components/LiveLineChart/context";
import {
  normalizeLiveLinePoints,
  normalizeLiveLineWindow,
  normalizeLiveLineMaxPoints,
} from "../src/components/LiveLineChart/live-line-lifecycle";
import { runOf } from "../src/components/LiveLineChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import { segment } from "../src/lib/chart";
import FIXTURES from "./fixtures/live-line-chart-source.json";
import { setTestMeasurement, emitAppHide, emitAppShow } from "./taro-api";

const Probe = () => {
  const state = useLiveLineChart();
  const { extent, now, plot, data } = useChart("probe");
  return (
    <span data-testid="live-state">
      {JSON.stringify({ ...state, data, extent, now: now.value, plot })}
    </span>
  );
};
Probe.layer = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("live-state").textContent ?? "{}");
const DATA: LiveLinePoint[] = [
  { time: 10_000, value: 10 },
  { time: 15_000, value: 30 },
  { time: 20_000, value: 20 },
];
const model = (props: Partial<LiveLineChartProps> = {}, reduced = true) => (
  <PanelUIProvider reducedMotion={reduced}>
    <LiveLineChart
      data={DATA}
      momentumColors={{ down: "#aa0000", flat: "#777777", up: "#0000aa" }}
      {...props}
    >
      <LiveLineChart.Header title="Throughput" />
      <LiveLineChart.Grid />
      <LiveLineChart.Area />
      <LiveLineChart.Line />
      <LiveLineChart.Tip pulse={false} badge />
      <LiveLineChart.XAxis />
      <LiveLineChart.YAxis />
      <LiveLineChart.Tooltip />
      <LiveLineChart.Skeleton />
      <Probe />
    </LiveLineChart>
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
afterEach(() => vi.useRealTimers());
it.each(FIXTURES.frames)(
  "matches source visible overhang and actual time paths %#",
  ({ times, values, plot, now, windowMs, curve, expected }) => {
    const run = runOf(times, values, plot, now - windowMs, now, 10, 35);
    expect(run).toEqual(expected.run);
    const line =
      run.length > 1 ? segment(run, curve as "linear" | "monotone") : "";
    expect(line).toBe(expected.line);
    const area =
      run.length > 1
        ? `${line} L${run.at(-1)?.x ?? 0},${plot.top + plot.height} L${run[0].x},${plot.top + plot.height} Z`
        : "";
    expect(area).toBe(expected.area);
  }
);
it("normalizes finite ordered buffer and corrected duplicate identities before trimming", () => {
  expect(
    normalizeLiveLinePoints(
      [
        { time: 2, value: 8 },
        { time: 1, value: 4 },
        { time: 2, value: 9 },
        { time: Number.NaN, value: 10 },
        { time: 3, value: 6 },
      ],
      2
    )
  ).toEqual([
    { time: 2, value: 9 },
    { time: 3, value: 6 },
  ]);
  expect(normalizeLiveLineWindow(0)).toBe(30);
  expect(normalizeLiveLineWindow(0.2)).toBe(1);
  expect(normalizeLiveLineMaxPoints(Infinity)).toBe(500);
});
it("renders default theme path and exactly one semantic snapshot", async () => {
  vi.setSystemTime(20_000);
  setTestMeasurement(300, 375);
  render(model());
  await settle();
  expect(probe().extent).toEqual([7.6, 32.4]);
  expect(probe().color).toBe("#0000aa");
  expect(probe().plot.left).toBe(44);
  expect(
    screen.getByRole("img", {
      name: "Throughput. Current value, 20. Trend, rising. 30-second window",
    })
  ).toBeTruthy();
  expect(svg()).toContain("clip-path=");
});
it("holds whole picture domain/latest/momentum while new points arrive under pause", async () => {
  vi.setSystemTime(20_000);
  setTestMeasurement(300, 375);
  const { rerender } = render(model());
  await settle();
  rerender(
    model({ data: [...DATA, { time: 30_000, value: -80 }], paused: true })
  );
  await settle();
  expect(probe().latest).toEqual(DATA[2]);
  expect(probe().momentum).toBe("up");
  expect(probe().extent).toEqual([7.6, 32.4]);
  expect(probe().now).toBe(20_000);
  rerender(model({ data: [...DATA, { time: 30_000, value: -80 }] }));
  await settle();
  expect(probe().latest.value).toBe(-80);
  expect(probe().momentum).toBe("down");
});
it("reads nearest timestamp on Canvas scrub and reconciles corrected/deleted identities", async () => {
  vi.setSystemTime(20_000);
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const { rerender } = render(model({ onActivePointChange: change }));
  await settle();
  const canvas = document.querySelector(".panel-live-pointer") as Element;
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 245, y: 20 }] });
  await settle();
  expect(probe().activePoint).toEqual(DATA[1]);
  rerender(
    model({
      data: [DATA[0], { time: 15_000, value: 33 }, DATA[2]],
      onActivePointChange: change,
    })
  );
  await settle();
  expect(probe().activePoint.value).toBe(33);
  rerender(model({ data: [DATA[0], DATA[2]], onActivePointChange: change }));
  await settle();
  expect(probe().activePoint).toBeNull();
  expect(change).toHaveBeenLastCalledWith(null);
});
it("moves stale tip left off-window and stops clock on hide/loading/paused/unmount", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(20_000);
  setTestMeasurement(300, 375);
  const { rerender, unmount } = render(model({}, false));
  await settle();
  const first = svg();
  act(() => vi.advanceTimersByTime(1000));
  await settle();
  expect(svg()).not.toBe(first);
  act(() => emitAppHide());
  await settle();
  const beforeHidden = svg();
  act(() => vi.advanceTimersByTime(1000));
  await settle();
  expect(svg()).toBe(beforeHidden);
  act(() => emitAppShow());
  await settle();
  expect(svg()).not.toBe(beforeHidden);
  rerender(model({ status: "loading" }, false));
  await settle();
  const loading = svg();
  act(() => vi.advanceTimersByTime(2000));
  await settle();
  expect(svg()).toBe(loading);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("pauses clock and domain while stale tip expires only after resumed wall time", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(20_000);
  setTestMeasurement(300, 375);
  const { rerender } = render(model({}, false));
  await settle();
  const label = screen
    .getByRole("img", { name: /Throughput\. Current value/u })
    .getAttribute("aria-label");
  act(() => vi.advanceTimersByTime(1000));
  await settle();
  expect(
    screen
      .getByRole("img", { name: /Throughput\. Current value/u })
      .getAttribute("aria-label")
  ).toBe(label);
  rerender(model({ paused: true }, false));
  await settle();
  const held = svg();
  act(() => vi.advanceTimersByTime(40_000));
  await settle();
  expect(svg()).toBe(held);
  rerender(model({}, false));
  await settle();
  expect(
    document.querySelector<HTMLElement>(".panel-live-tip")?.dataset.taroStyle
  ).toContain('"opacity":0');
});
