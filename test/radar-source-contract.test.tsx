// @vitest-environment happy-dom
import "./geometry-renderer";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { createRef, useSyncExternalStore } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { RadarChart, useRadarChart } from "../src/components/RadarChart";
import type {
  RadarChartHandle,
  RadarChartProps,
} from "../src/components/RadarChart";
import {
  radarExtent,
  scaledRadarValues,
} from "../src/components/RadarChart/math";
import { useRadarMorph } from "../src/components/RadarChart/use-morph";
import { radarPath } from "../src/lib/chart";
import { chartInOutQuad } from "../src/primitives/chart-tween";
import { Circle } from "../src/primitives/static-svg";
import FIXTURES from "./fixtures/radar-source.json";
import {
  emitTestResize,
  setDeepElementMeasurement,
  setElementMeasurement,
  setTestMeasurement,
} from "./taro-api";

const DATA = [
  { axis: "Read", team: 60, you: 80 },
  { axis: "Write", team: 70, you: 50 },
  { axis: "Numbers", team: 60, you: null },
  { axis: "Music", team: 30, you: 70 },
];
const Probe = () => {
  const state = useRadarChart();
  const min = useSyncExternalStore(
    state.domainMin.subscribe,
    state.domainMin.getSnapshot,
    state.domainMin.getSnapshot
  );
  const max = useSyncExternalStore(
    state.domainMax.subscribe,
    state.domainMax.getSnapshot,
    state.domainMax.getSnapshot
  );
  return (
    <span data-testid="radar-state">
      {JSON.stringify({
        cx: state.cx,
        cy: state.cy,
        domain: [min, max],
        height: state.height,
        radius: state.radius,
        series: state.series,
        width: state.width,
      })}
    </span>
  );
};
const probe = () =>
  JSON.parse(screen.getByTestId("radar-state").textContent ?? "{}");
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const model = (
  props: Partial<RadarChartProps> = {},
  reduced = true,
  ref?: React.Ref<RadarChartHandle>
) => (
  <PanelUIProvider reducedMotion={reduced}>
    <RadarChart data={DATA} ref={ref} {...props}>
      <RadarChart.Header title="Profile" legend />
      <RadarChart.Grid />
      <RadarChart.Axis />
      <RadarChart.Series dataKey="you" showDots />
      <RadarChart.Series dataKey="team" colorIndex={2} fillOpacity={0} />
      <RadarChart.Legend formatName={(key) => `Series ${key}`} />
      <Probe />
    </RadarChart>
  </PanelUIProvider>
);
const measure = async (width = 304, height = 232) => {
  await settle();
  const area = document.querySelector(".panel-radar-measure");
  if (!area) {
    throw new Error("Missing radar drawing area");
  }
  const rect = { height, left: 0, top: 0, width };
  setElementMeasurement(area.id, rect);
  setDeepElementMeasurement(area.id, rect);
  act(() => emitTestResize());
  await settle();
};
const svg = () =>
  decodeURIComponent(
    document
      .querySelector('img[src^="data:image/svg+xml"]')
      ?.getAttribute("src")
      ?.split(",")[1] ?? ""
  );
it.each(FIXTURES.frames)(
  "matches pinned morph/reveal radar path frame %#",
  ({ input, expected }) => {
    const scaled = scaledRadarValues(
      input.from,
      input.to,
      input.morph,
      input.min,
      input.max,
      input.reveal
    );
    expect(radarPath(scaled, input.cx, input.cy, input.radius)).toBe(expected);
  }
);
it.each(FIXTURES.extents)(
  "matches pinned radar extent %#",
  ({ input, expected }) =>
    expect(
      radarExtent(
        input.data,
        input.keys,
        input.domain as [number, number] | undefined
      )
    ).toEqual(expected)
);
it("measures ring plus asymmetric label room, bridges missing reading and registers source series keys", async () => {
  setTestMeasurement(304, 375);
  render(model({ domain: [0, 100] }));
  await measure();
  expect(probe()).toMatchObject({
    cx: 152,
    cy: 116,
    domain: [0, 100],
    height: 232,
    radius: 90,
    width: 304,
  });
  expect(probe().series.map(([key]: [string, string]) => key)).toEqual([
    "you",
    "team",
  ]);
  expect(svg().match(/<polygon /gu)).toHaveLength(4);
  expect(svg().match(/<line /gu)).toHaveLength(4);
  expect(svg().match(/<circle /gu)).toHaveLength(3);
  expect(svg()).toContain('text-anchor="middle"');
  expect(svg()).toContain(radarPath([0.8, 0.5, null, 0.7], 152, 116, 90));
  expect(screen.getByText("Series you")).toBeTruthy();
});
it("exposes actual accessible axis readings and source activation while disabling them in loading", async () => {
  setTestMeasurement(304, 375);
  const activate = vi.fn();
  const view = render(model({ onAccessibilityDatumPress: activate }));
  await measure();
  fireEvent.click(
    screen.getByRole("button", { name: "axis, Read. you, 80. team, 60" })
  );
  expect(activate).toHaveBeenCalledWith(DATA[0], 0);
  view.rerender(
    model({ onAccessibilityDatumPress: activate, status: "loading" })
  );
  await settle();
  expect(
    screen.queryByRole("button", { name: "axis, Read. you, 80. team, 60" })
  ).toBeNull();
  expect(svg()).toContain('d=""');
});
it("accepts raw SVG references in the source default layer and changes grid shape without placeholders", async () => {
  setTestMeasurement(304, 375);
  render(
    <PanelUIProvider reducedMotion>
      <RadarChart data={DATA} domain={[0, 100]}>
        <RadarChart.Grid circular />
        <RadarChart.Series dataKey="you" />
        <>
          <Circle cx={152} cy={116} r={2} fill="#ff0000" />
        </>
      </RadarChart>
    </PanelUIProvider>
  );
  await measure();
  expect(svg().match(/<circle /gu)).toHaveLength(5);
  expect(svg()).toContain('fill="#ff0000"');
  expect(svg()).not.toContain("<polygon ");
});
it("reduced-motion data update immediately replaces all vertices and loading can reveal again", async () => {
  setTestMeasurement(304, 375);
  const view = render(model({ domain: [0, 100] }));
  await measure();
  const next = DATA.map((row) => ({ ...row, you: 30 }));
  view.rerender(model({ data: next, domain: [0, 100] }));
  await settle();
  expect(svg()).toContain(radarPath([0.3, 0.3, 0.3, 0.3], 152, 116, 90));
  view.rerender(model({ data: next, domain: [0, 100], status: "loading" }));
  await settle();
  expect(svg()).toContain('d=""');
  view.rerender(model({ data: next, domain: [0, 100] }));
  await settle();
  expect(svg()).toContain(radarPath([0.3, 0.3, 0.3, 0.3], 152, 116, 90));
});
it("plays source reveal and ref replay without scaling strokes or dot radii", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(304, 375);
    const ref = createRef<RadarChartHandle>();
    render(model({ domain: [0, 100] }, false, ref));
    await measure();
    act(() => vi.advanceTimersByTime(620));
    expect(svg()).toContain(radarPath([0.8, 0.5, null, 0.7], 152, 116, 90));
    expect(svg()).toContain('r="3"');
    act(() => ref.current?.replay());
    expect(svg()).toContain(radarPath([0, 0, null, 0], 152, 116, 90));
    act(() => vi.advanceTimersByTime(620));
    expect(svg()).toContain(radarPath([0.8, 0.5, null, 0.7], 152, 116, 90));
  } finally {
    vi.useRealTimers();
  }
});

it("continues an interrupted profile morph from the visible vertices", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(({ values }) => useRadarMorph(values), {
      initialProps: { values: [20, 40, 60] },
      wrapper: ({ children }) => (
        <PanelUIProvider reducedMotion={false}>{children}</PanelUIProvider>
      ),
    });
    view.rerender({ values: [80, 70, 30] });
    act(() => vi.advanceTimersByTime(208));
    const t = chartInOutQuad(208 / 420);
    expect(view.result.current.progress).toBeCloseTo(t);
    view.rerender({ values: [30, 50, 90] });
    expect(view.result.current.progress).toBe(0);
    expect(view.result.current.from).toEqual([
      20 + 60 * t,
      40 + 30 * t,
      60 - 30 * t,
    ]);
    act(() => vi.advanceTimersByTime(420));
    expect(view.result.current.progress).toBe(1);
    expect(view.result.current.to).toEqual([30, 50, 90]);
  } finally {
    vi.useRealTimers();
  }
});
