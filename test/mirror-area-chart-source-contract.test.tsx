// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  MirrorAreaChart,
  useMirrorAreaChart,
} from "../src/components/MirrorAreaChart";
import type { MirrorAreaChartProps } from "../src/components/MirrorAreaChart";
import { useChart } from "../src/components/MirrorAreaChart/context";
import {
  edgeRuns,
  edgePath,
  fillPath,
  sideExtent,
} from "../src/components/MirrorAreaChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/mirror-area-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { date: "Mon", high: 60, share: 40, total: 100 },
  { date: "Tue", high: 90, share: 55, total: 130 },
  { date: "Wed", high: null, share: -10, total: 90 },
  { date: "Thu", high: 70, share: 35, total: 120 },
];
const Probe = () => {
  const state = useMirrorAreaChart();
  const { plot, pad, baseline, topExtent, bottomExtent, series } =
    useChart("probe");
  return (
    <span data-testid="mirror-state">
      {JSON.stringify({
        ...state,
        baseline,
        bottomExtent,
        pad,
        plot,
        series,
        topExtent,
      })}
    </span>
  );
};
Probe.layer = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("mirror-state").textContent ?? "{}");
const model = (
  props: Partial<MirrorAreaChartProps> = {},
  color = "#a00000"
) => (
  <PanelUIProvider reducedMotion>
    <MirrorAreaChart data={DATA} {...props}>
      <MirrorAreaChart.Header title="Queue load" value="120 jobs" legend />
      <MirrorAreaChart.Grid />
      <MirrorAreaChart.Area dataKey="total" label="Total" muted />
      <MirrorAreaChart.Area dataKey="high" label="High" color={color} />
      <MirrorAreaChart.Area
        dataKey="share"
        label="Share"
        side="bottom"
        color="#0000aa"
      />
      <MirrorAreaChart.Baseline />
      <MirrorAreaChart.Skeleton />
      <MirrorAreaChart.XAxis />
      <MirrorAreaChart.YAxis />
      <MirrorAreaChart.Tooltip />
      <Probe />
    </MirrorAreaChart>
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
it.each(FIXTURES.frames)(
  "matches source split independent scales/grow/negative clamp/null gaps %#",
  ({
    values,
    plot,
    baseline,
    height,
    max,
    grow,
    direction,
    curve,
    expected,
  }) => {
    const runs = edgeRuns(values, plot, baseline, height, max, grow, direction);
    expect(runs).toEqual(expected.runs);
    expect(edgePath(runs, curve as "linear" | "monotone")).toBe(expected.edge);
    expect(fillPath(runs, curve as "linear" | "monotone", baseline)).toBe(
      expected.fill
    );
  }
);
it.each(FIXTURES.domains)(
  "matches source zero anchored side max %#",
  ({ data, keys, explicit, expected }) => {
    const domain = explicit
      ? ([explicit[0], explicit[1]] as [number, number])
      : undefined;
    expect(sideExtent(data, keys, domain)).toBe(expected);
  }
);
it("uses independent source scales, .55 split, gutters, overlay order and bottom x anchors", async () => {
  setTestMeasurement(300, 375);
  render(model());
  await settle();
  expect(probe().topExtent).toBe(140.4);
  expect(probe().bottomExtent).toBe(59.400000000000006);
  expect(probe().plot.left).toBe(40);
  expect(probe().baseline).toBeCloseTo(92.025);
  expect(probe().series.map((item: { key: string }) => item.key)).toEqual([
    "total",
    "high",
    "share",
  ]);
  expect(screen.getByText("Mon").dataset.taroStyle).toContain('"bottom":0');
  expect(svg()).toContain("a0.9,0.9");
});
it("preserves declaration order through recolor and ignores invalid explicit domains", async () => {
  setTestMeasurement(300, 375);
  const { rerender } = render(
    model({ bottomDomain: [0, 100], topDomain: [0, Number.NaN] })
  );
  await settle();
  rerender(
    model({ bottomDomain: [0, 100], topDomain: [0, Number.NaN] }, "#aa1111")
  );
  await settle();
  expect(probe().series.map((item: { key: string }) => item.key)).toEqual([
    "total",
    "high",
    "share",
  ]);
  expect(probe().topExtent).toBe(140.4);
  expect(probe().bottomExtent).toBe(100);
});
it("scrubs nearest source columns with outermost top dot and summary override", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  const canvas = document.querySelector(".panel-mirror-pointer") as Element;
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 120, y: 20 }] });
  await settle();
  expect(probe().activeIndex).toBe(1);
  expect(svg()).toContain('r="4.5"');
  expect(svg()).toContain('stroke-dasharray="3,4"');
  expect(screen.getByText("130")).toBeTruthy();
  fireEvent.touchEnd(canvas, { touches: [] });
  await settle();
  expect(change).toHaveBeenLastCalledWith(-1, null);
});
it("shows flat source skeleton around both baseline halves and rearms on ready", async () => {
  setTestMeasurement(300, 375);
  const { rerender } = render(model({ status: "loading" }));
  await settle();
  expect(svg()).toContain('x1="-40%"');
  expect(svg()).toContain('x2="0%"');
  expect(svg()).toContain('height="26.189999999999998"');
  rerender(model());
  await settle();
  expect(svg()).not.toContain("panel-mirror-skeleton");
});
it("clamps source split to .1/.9 and places dot on bottom when no top series exists", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <MirrorAreaChart data={DATA} split={2} compact>
        <MirrorAreaChart.Area dataKey="share" side="bottom" />
        <MirrorAreaChart.Tooltip />
        <Probe />
      </MirrorAreaChart>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().pad).toEqual({ bottom: 2, left: 1, right: 1, top: 2 });
  expect(probe().baseline).toBeCloseTo(167.15);
  const canvas = document.querySelector(".panel-mirror-pointer") as Element;
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 1, y: 10 }] });
  await settle();
  expect(svg()).toContain('opacity="1"');
});
const WrappedArea = () => (
  <MirrorAreaChart.Area dataKey="share" side="bottom" />
);
WrappedArea.layer = "series" as const;
it("puts wrapped registry entries after directly declared areas in source readout order", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <MirrorAreaChart data={DATA}>
        <WrappedArea />
        <MirrorAreaChart.Area dataKey="total" />
        <Probe />
      </MirrorAreaChart>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().series.map((item: { key: string }) => item.key)).toEqual([
    "total",
    "share",
  ]);
});
