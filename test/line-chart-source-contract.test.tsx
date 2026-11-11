// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { LineChart, useLineChart } from "../src/components/LineChart";
import type {
  LineChartDatum,
  LineChartHandle,
  LineChartProps,
} from "../src/components/LineChart";
import { useChart } from "../src/components/LineChart/context";
import {
  lineChartExtent,
  lineChartIndexAt,
  lineChartPlot,
} from "../src/components/LineChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import { chartAccessibilityModel } from "../src/primitives/chart-accessibility";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const DATA: LineChartDatum[] = [
  { date: "Jan", total: 100, visits: 10 },
  { date: "Feb", total: 200, visits: 20 },
  { date: "Mar", total: 300, visits: null },
  { date: "Apr", total: 400, visits: 40 },
];
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const Probe = () => {
  const { plot, extent, series } = useChart("probe");
  const selected = useLineChart();
  return (
    <span data-testid="chart-probe">
      {JSON.stringify({ extent, plot, series, ...selected })}
    </span>
  );
};
const probe = () =>
  JSON.parse(screen.getByTestId("chart-probe").textContent ?? "null") as {
    plot: { left: number; top: number; width: number; height: number };
    extent: [number, number];
    series: [string, string][];
    activeIndex: number;
    activePoint: LineChartDatum | null;
  };
const pointer = () => {
  const found = document.querySelector<HTMLCanvasElement>(
    "canvas.panel-line-pointer"
  );
  if (!found) {
    throw new Error("Missing native chart pointer");
  }
  return found;
};
const touches = (x: number, y = 50, identifier = 1) => [{ identifier, x, y }];
const images = () => [
  ...document.querySelectorAll<HTMLImageElement>(
    'img[src^="data:image/svg+xml"]'
  ),
];
const svg = () =>
  images().map((image) =>
    decodeURIComponent(
      image.getAttribute("src")?.slice("data:image/svg+xml,".length) ?? ""
    )
  );
const model = (
  props: Partial<LineChartProps>,
  reduced = true,
  ref?: React.Ref<LineChartHandle>
) => (
  <PanelUIProvider reducedMotion={reduced}>
    <LineChart data={DATA} {...props} id="chart-root" ref={ref}>
      <LineChart.Header
        title="Traffic"
        value="1,000"
        caption="Monthly"
        legend
        labels={{ total: "Total", visits: "Visits" }}
      />
      <LineChart.Grid />
      <LineChart.Area dataKey="visits" />
      <LineChart.Line dataKey="visits" showMarkers />
      <LineChart.Line
        dataKey="total"
        colorIndex={2}
        dashArray="6,4"
        showMarkers
      />
      <LineChart.Skeleton />
      <LineChart.XAxis />
      <LineChart.YAxis />
      <LineChart.Tooltip />
      <Probe />
    </LineChart>
  </PanelUIProvider>
);
it("shared extent uses all series, constant rows get headroom, and nonfinite data stays outside the domain", () => {
  expect(lineChartExtent(DATA, ["visits", "total"])).toEqual([-29, 439]);
  expect(lineChartExtent([{ value: 7 }, { value: 7 }], ["value"])).toEqual([
    6, 8,
  ]);
  expect(
    lineChartExtent([{ value: Number.POSITIVE_INFINITY }], ["value"])
  ).toEqual([0, 1]);
  expect(lineChartExtent(DATA, ["visits"], [0, 100])).toEqual([0, 100]);
  expect(lineChartPlot(300, 150, false, true)).toEqual({
    height: 116,
    left: 44,
    top: 12,
    width: 246,
  });
  expect(lineChartPlot(300, 150, true, true)).toEqual({
    height: 146,
    left: 1,
    top: 2,
    width: 298,
  });
  expect(lineChartIndexAt(300, 4, lineChartPlot(300, 150, false, true))).toBe(
    3
  );
});
it("geometry uses real SVG paths, gaps, gradient fills, dash and markers while header stays outside plot height", async () => {
  setTestMeasurement(300, 375);
  render(model({}));
  await settle();
  expect(probe().extent).toEqual([-29, 439]);
  expect(probe().plot).toEqual({ height: 116, left: 44, top: 12, width: 246 });
  expect(svg()).toHaveLength(2);
  const series = svg().find((value) => value.includes("<path"));
  expect(series).toContain('stroke="#262626"');
  expect(series).toContain('stroke="#3b82f6"');
  expect(series).toContain('stroke-dasharray="6,4"');
  expect(series).toContain("<linearGradient");
  expect(series?.match(/<circle /gu)).toHaveLength(7);
  expect(series).not.toContain("NaN");
  expect(series).not.toContain("Infinity");
  expect(screen.getByText("Traffic")).toBeTruthy();
  expect(screen.getAllByText("Total")).toHaveLength(1);
  expect(
    images().every((image) =>
      readTaroStyle(image)?.includes('"height":"300rpx"')
    )
  ).toBe(true);
});
it("native local canvas touches report changed indices once and resolve labels, dots and external hooks together", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  fireEvent.touchStart(pointer(), { touches: touches(44) });
  expect(probe().activeIndex).toBe(0);
  fireEvent.touchMove(pointer(), { touches: touches(50) });
  expect(change).toHaveBeenCalledTimes(1);
  fireEvent.touchMove(pointer(), { touches: touches(290) });
  expect(probe().activeIndex).toBe(3);
  expect(probe().activePoint?.date).toBe("Apr");
  expect(change).toHaveBeenLastCalledWith(3, DATA[3]);
  expect(screen.getAllByText("400")).toHaveLength(1);
  fireEvent.touchEnd(pointer());
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([0, 3, -1]);
});
it("native coordinates convert to the same logical plot without depending on page scroll offsets", async () => {
  setTestMeasurement(600, 750);
  try {
    const change = vi.fn();
    render(model({ onActiveIndexChange: change }));
    await settle();
    fireEvent.touchStart(pointer(), { touches: touches(416) });
    expect(probe().activeIndex).toBe(2);
    expect(change).toHaveBeenCalledWith(2, DATA[2]);
  } finally {
    setTestMeasurement(40, 375);
  }
});
it("cancellation, a second pointer and a loading transition clear crosshair without duplicate callbacks", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const view = render(model({ onActiveIndexChange: change }));
  await settle();
  fireEvent.touchStart(pointer(), { touches: touches(126) });
  fireEvent.touchMove(pointer(), {
    touches: [...touches(126), ...touches(200, 50, 2)],
  });
  expect(probe().activeIndex).toBe(-1);
  fireEvent.touchStart(pointer(), { touches: touches(208) });
  view.rerender(model({ onActiveIndexChange: change, status: "loading" }));
  await settle();
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, -1, 2, -1]);
  expect(document.querySelector("canvas.panel-line-pointer")).toBeNull();
});
it("data shrink clears stale selection and never calls the owner after chart unmount", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const view = render(model({ onActiveIndexChange: change }));
  await settle();
  fireEvent.touchStart(pointer(), { touches: touches(290) });
  view.rerender(model({ data: DATA.slice(0, 1), onActiveIndexChange: change }));
  await settle();
  expect(probe().activeIndex).toBe(-1);
  const calls = change.mock.calls.length;
  view.unmount();
  expect(change).toHaveBeenCalledTimes(calls);
});
it("loading holds a skeleton and rearms one reveal; refreshing ready data does not replay it", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(300, 375);
    const view = render(
      model({ animationDuration: 700, status: "loading" }, false)
    );
    await settle();
    expect(svg().some((value) => value.includes("chart-skeleton"))).toBe(true);
    expect(document.querySelector("canvas.panel-line-pointer")).toBeNull();
    view.rerender(model({ animationDuration: 700 }, false));
    await settle();
    act(() => vi.advanceTimersByTime(700));
    await settle();
    const clip = images().find((image) =>
      decodeURIComponent(image.src).includes("<path")
    )?.parentElement?.parentElement;
    expect(readTaroStyle(clip)).toContain('"width":"492rpx"');
    view.rerender(
      model(
        {
          animationDuration: 700,
          data: DATA.map((row) => ({ ...row, visits: 50 })),
        },
        false
      )
    );
    await settle();
    expect(readTaroStyle(clip)).toContain('"width":"492rpx"');
    view.rerender(model({ animationDuration: 700, status: "loading" }, false));
    await settle();
    expect(readTaroStyle(clip)).toContain('"width":"0rpx"');
  } finally {
    vi.useRealTimers();
  }
});
it("replay uses the source cubic reveal while reduced motion completes immediately", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(300, 375);
    const ref = createRef<LineChartHandle>();
    render(model({ animationDuration: 700 }, false, ref));
    await settle();
    act(() => vi.advanceTimersByTime(700));
    await settle();
    act(() => ref.current?.replay());
    act(() => vi.advanceTimersByTime(352));
    await settle();
    const clip = images().find((image) =>
      decodeURIComponent(image.src).includes("<path")
    )?.parentElement?.parentElement;
    const style = readTaroStyle(clip);
    if (!style) {
      throw new Error("Missing reveal clip");
    }
    const width =
      Number(String(JSON.parse(style).width).replace("rpx", "")) / 2;
    expect(width).toBeGreaterThan(214);
    expect(width).toBeLessThan(219);
  } finally {
    vi.useRealTimers();
  }
});
it("semantic rows use data values and custom labels, and accessible false removes that separate tree", async () => {
  setTestMeasurement(300, 375);
  const action = vi.fn();
  const view = render(
    model({
      accessibilityLabel: "Monthly traffic",
      accessibilityLabelForDatum: (_datum, index) => `Entry ${index + 1}`,
      onAccessibilityDatumPress: action,
    })
  );
  await settle();
  expect(screen.getByRole("img", { name: "Monthly traffic" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Entry 2" }));
  expect(action).toHaveBeenCalledWith(DATA[1], 1);
  view.rerender(
    model({ accessible: false, onAccessibilityDatumPress: action })
  );
  await settle();
  expect(screen.queryByRole("img", { name: "Monthly traffic" })).toBeNull();
  expect(
    chartAccessibilityModel("Line chart", DATA.slice(0, 1), (datum) => [
      ["date", datum.date],
      ["visits", datum.visits],
    ])
  ).toEqual({
    items: [{ datum: DATA[0], index: 0, label: "date, Jan. visits, 10" }],
    summary: "Line chart, 1 data entry",
  });
});
it("empty, constant, invalid numeric and zero-tick configurations remain drawable without invalid SVG", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <LineChart
        data={[
          { date: "One", value: Number.POSITIVE_INFINITY },
          { date: "Two", value: 5 },
        ]}
      >
        <LineChart.Grid rows={0} />
        <LineChart.Line dataKey="value" showMarkers />
        <LineChart.XAxis ticks={0} />
        <LineChart.YAxis ticks={0} />
      </LineChart>
    </PanelUIProvider>
  );
  await settle();
  expect(svg().join("")).not.toMatch(/NaN|Infinity/u);
  expect(
    svg()
      .join("")
      .match(/<circle /gu)
  ).toHaveLength(1);
});
it("header trailing content wins over its legend and custom labels remain outside SVG", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <LineChart data={DATA}>
        <LineChart.Header title="Visits" legend>
          <button type="button">Range picker</button>
        </LineChart.Header>
        <LineChart.Line dataKey="visits" />
        <LineChart.Legend labels={{ visits: "Visitors" }} />
        <LineChart.XAxis format={(datum, index) => `${index}:${datum.date}`} />
        <LineChart.YAxis format={(value) => `v${value}`} />
      </LineChart>
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByRole("button", { name: "Range picker" })).toBeTruthy();
  expect(screen.getByText("Visitors")).toBeTruthy();
  expect(screen.getByText("0:Jan")).toBeTruthy();
  expect(svg().join("")).not.toContain("Visitors");
});

it("serializes direct SVG reference shapes into the unclipped grid layer", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <LineChart data={DATA}>
        <LineChart.Line dataKey="total" />
        <>
          <path d="M10,20 L200,20" stroke="#ff00ff" fill="none" />
          <line x1={10} x2={200} y1={50} y2={50} stroke="#00ff00" />
        </>
      </LineChart>
    </PanelUIProvider>
  );
  await settle();
  expect(svg()[0]).toContain('d="M10,20 L200,20"');
  expect(svg()[0]).toContain('stroke="#ff00ff"');
  expect(svg()[0]).toContain('stroke="#00ff00"');
  expect(document.querySelector("path")).toBeNull();
});
