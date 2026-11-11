// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  HeatmapChart,
  buildHeatmapCalendar,
  useHeatmapChart,
} from "../src/components/HeatmapChart";
import type { HeatmapChartProps } from "../src/components/HeatmapChart";
import { useHeatmap } from "../src/components/HeatmapChart/context";
import {
  deriveLevels,
  heatmapLevel,
  heatmapGrid,
} from "../src/components/HeatmapChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/heatmap-chart-source.json";
import {
  getSystemInfoSync,
  getWindowInfo,
  setTestMeasurement,
} from "./taro-api";
import { readTaroStyle } from "./taro-style";

const DATA = [
  {
    bin: 0,
    bins: [
      { bin: 0, count: 0 },
      { bin: 1, count: 1 },
      { bin: 3, count: 7 },
    ],
  },
  {
    bin: 1,
    bins: [
      { bin: 0, count: 3 },
      { bin: 2, count: 20 },
    ],
  },
  { bin: 2, bins: [{ bin: 0, count: 5 }] },
];
const Probe = () => {
  const state = useHeatmapChart();
  const { grid, ramp, opacities } = useHeatmap("probe");
  return (
    <span data-testid="heatmap-state">
      {JSON.stringify({ ...state, grid, opacities, ramp })}
    </span>
  );
};
Probe.slot = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("heatmap-state").textContent ?? "{}");
const model = (props: Partial<HeatmapChartProps>) => (
  <PanelUIProvider reducedMotion>
    <HeatmapChart data={DATA} {...props}>
      <HeatmapChart.Header title="Contributions" value="36" />
      <HeatmapChart.XAxis labels={["W1", "W2", "W3"]} />
      <HeatmapChart.YAxis />
      <HeatmapChart.Separator every={1} />
      <HeatmapChart.Cells />
      <HeatmapChart.Tooltip />
      <HeatmapChart.Legend />
      <Probe />
    </HeatmapChart>
  </PanelUIProvider>
);
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const svgs = () =>
  [...document.querySelectorAll('img[src^="data:image/svg+xml"]')].map((node) =>
    decodeURIComponent(node.getAttribute("src")?.split(",")[1] ?? "")
  );
it.each(FIXTURES.grids)(
  "matches pinned fill/fluid grid sizing %#",
  ({ input, expected }) => {
    expect(
      heatmapGrid(
        input.data.length,
        input.width,
        input.axisWidth,
        input.layout === "fill" ? "fill" : "fluid",
        input.binSize,
        input.gap,
        input.rows
      )
    ).toEqual(expected);
  }
);
it.each(FIXTURES.levels)(
  "matches pinned quartile thresholds and tied level nudging %#",
  ({ data, counts, expected }) => {
    const thresholds = deriveLevels(data);
    expect({
      levels: counts.map((count) => heatmapLevel(count, thresholds)),
      thresholds,
    }).toEqual(expected);
  }
);
it.each(FIXTURES.calendars)(
  "matches pinned local midnight calendar bucketing %#",
  ({ input, expected }) => {
    const result = buildHeatmapCalendar(
      input.entries.map((entry) => ({ ...entry, date: new Date(entry.date) })),
      {
        end: new Date(input.end),
        start: new Date(input.start),
        weekStartDay: input.weekStartDay,
      }
    );
    expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
  }
);
it("draws every missing bin, theme ramp and layouts axes beside grid", async () => {
  setTestMeasurement(300, 375);
  render(model({ id: "consumer-heatmap" }));
  await settle();
  expect(probe().grid).toEqual({
    columns: 3,
    gap: 3,
    height: 102,
    rows: 7,
    size: 12,
    width: 42,
  });
  expect(svgs()[0].match(/<rect /gu)).toHaveLength(21);
  expect(svgs()[0].match(/<line /gu)).toHaveLength(2);
  expect(probe().opacities).toEqual([1, 0.28, 0.5, 0.74, 1]);
  expect(screen.getByText("Mon")).toBeTruthy();
  expect(screen.getByText("W2")).toBeTruthy();
  expect(
    screen.getByRole("img", { name: "Heatmap chart, 6 data entries" })
  ).toBeTruthy();
});
it("fill layout subtracts explicit y gutter before deriving square bins", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <HeatmapChart data={DATA} layout="fill">
        <HeatmapChart.YAxis width={40} />
        <HeatmapChart.Cells />
        <Probe />
      </HeatmapChart>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().grid.size).toBe((300 - 40 - 6) / 3);
  expect(probe().grid.width).toBe(260);
});
it("custom colors discard level opacities and theme tokens resolve to active palette", async () => {
  setTestMeasurement(300, 375);
  const view = render(
    model({ color: "--color-chart-2", emptyColor: "--color-background" })
  );
  await settle();
  expect(probe().ramp).toEqual([
    "#ffffff",
    "#3b82f6",
    "#3b82f6",
    "#3b82f6",
    "#3b82f6",
  ]);
  view.rerender(
    model({
      levelColors: ["#111111", "#222222", "#333333", "#444444", "#555555"],
      levelOpacity: [0, 0, 0, 0, 0],
    })
  );
  await settle();
  expect(probe().opacities).toEqual([1, 1, 1, 1, 1]);
  expect(svgs()[0]).toContain('fill="#555555"');
});
it("ordinary scroll swipe yields before long hold with no selection flicker", async () => {
  vi.useFakeTimers();
  setTestMeasurement(300, 375);
  const changed = vi.fn();
  render(model({ onActiveCellChange: changed }));
  await settle();
  const pointer = document.querySelector("canvas.panel-heatmap-pointer");
  if (!pointer) {
    throw new Error("Missing pointer");
  }
  fireEvent.touchStart(pointer, { touches: [{ identifier: 3, x: 5, y: 20 }] });
  expect(changed).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(100));
  fireEvent.touchMove(pointer, { touches: [{ identifier: 3, x: 35, y: 20 }] });
  act(() => vi.advanceTimersByTime(200));
  expect(changed).not.toHaveBeenCalled();
  expect(probe().activeCell).toBeNull();
});
it("held press selects bins, dims other cells and clears only actual selection", async () => {
  vi.useFakeTimers();
  setTestMeasurement(300, 375);
  const changed = vi.fn();
  render(model({ inactiveOpacity: 0.3, onActiveCellChange: changed }));
  await settle();
  const pointer = document.querySelector("canvas.panel-heatmap-pointer");
  if (!pointer) {
    throw new Error("Missing pointer");
  }
  fireEvent.touchStart(pointer, { touches: [{ identifier: 3, x: 5, y: 20 }] });
  act(() => vi.advanceTimersByTime(180));
  expect(probe().activeCell).toEqual({ column: 0, count: 1, level: 1, row: 1 });
  expect(screen.getByText("1")).toBeTruthy();
  expect(svgs()[0]).toContain('fill-opacity="0.3"');
  fireEvent.touchMove(pointer, { touches: [{ identifier: 3, x: 20, y: 35 }] });
  expect(probe().activeCell.count).toBe(20);
  fireEvent.touchEnd(pointer);
  expect(probe().activeCell).toBeNull();
  expect(changed.mock.calls.map(([cell]) => cell?.count ?? null)).toEqual([
    1,
    20,
    null,
  ]);
});
it("changing data during pending hold cancels stale selection", async () => {
  vi.useFakeTimers();
  setTestMeasurement(300, 375);
  const changed = vi.fn();
  const view = render(model({ onActiveCellChange: changed }));
  await settle();
  const pointer = document.querySelector("canvas.panel-heatmap-pointer");
  if (!pointer) {
    throw new Error("Missing pointer");
  }
  fireEvent.touchStart(pointer, { touches: [{ identifier: 3, x: 5, y: 20 }] });
  view.rerender(model({ data: [...DATA], onActiveCellChange: changed }));
  await settle();
  act(() => vi.advanceTimersByTime(200));
  expect(changed).not.toHaveBeenCalled();
});
afterEach(() => vi.useRealTimers());

it("preserves the scaled weekday gutter and wide grid inside a narrow horizontal viewport", async () => {
  getSystemInfoSync.mockReturnValue({
    ...getWindowInfo(),
    fontSizeSetting: 26,
  });
  try {
    setTestMeasurement(300, 375);
    render(
      model({
        binSize: 13,
        data: Array.from({ length: 53 }, (_, bin) => ({
          bin,
          bins: DATA[0].bins,
        })),
        weekStartDay: 1,
      })
    );
    await settle();
    const label = screen.getByText("Tue");
    const axis = label.parentElement;
    expect(readTaroStyle(axis)).toContain("72rpx");
    expect(axis?.classList.contains("shrink-0")).toBe(true);
    expect(axis?.nextElementSibling?.classList.contains("shrink-0")).toBe(true);
    expect(readTaroStyle(label)).toContain("32.472rpx");
    expect(readTaroStyle(label)).toContain(`${(16 + 6.5 - 7 * 1.353) * 2}rpx`);
    expect(probe().grid.width).toBe(845);
  } finally {
    getSystemInfoSync.mockReturnValue({
      ...getWindowInfo(),
      fontSizeSetting: 16,
    });
  }
});
