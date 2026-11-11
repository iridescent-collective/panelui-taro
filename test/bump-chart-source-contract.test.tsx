// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { BumpChart, useBumpChart } from "../src/components/BumpChart";
import type { BumpChartProps } from "../src/components/BumpChart";
import { useChart } from "../src/components/BumpChart/context";
import {
  bumpRanks,
  pointsAt,
  bumpSegment,
  dotsPath,
  colorStop,
} from "../src/components/BumpChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/bump-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { a: 1, b: 2, c: 3, date: "W1" },
  { a: 2, b: 1, c: null, date: "W2" },
  { a: 3, b: 2, c: 1, date: "W3" },
  { a: null, b: 2, c: 1, date: "W4" },
];
const Probe = () => {
  const state = useBumpChart();
  const { plot, pad } = useChart("probe");
  return (
    <span data-testid="bump-state">
      {JSON.stringify({ ...state, pad, plot })}
    </span>
  );
};
Probe.layer = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("bump-state").textContent ?? "{}");
const model = (props: Partial<BumpChartProps>, color = "#a00000") => (
  <PanelUIProvider reducedMotion>
    <BumpChart data={DATA} {...props}>
      <BumpChart.Header title="Standings" value="3 teams" legend />
      <BumpChart.Grid />
      <BumpChart.Line dataKey="a" label="Alpha" color={color} />
      <BumpChart.Line dataKey="b" label="Beta" color="#00a000" />
      <BumpChart.Line dataKey="c" label="Gamma" color="#0000a0" />
      <BumpChart.XAxis />
      <BumpChart.YAxis />
      <BumpChart.Labels />
      <BumpChart.Skeleton />
      <BumpChart.Tooltip />
      <Probe />
    </BumpChart>
  </PanelUIProvider>
);
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const svgs = () =>
  [...document.querySelectorAll('img[src^="data:image/svg+xml"]')].map(
    (image) =>
      decodeURIComponent(image.getAttribute("src")?.split(",")[1] ?? "")
  );
it.each(FIXTURES.rankings)(
  "matches source ranks/score ties %#",
  ({ data, keys, values, expected }) => {
    expect(
      bumpRanks(data, keys, { values: values as "rank" | "score" })
    ).toEqual(expected);
  }
);
it.each(FIXTURES.frames)(
  "matches source interrupted S-curve segments and dots %#",
  ({ key, from, to, progress, plot, expected }) => {
    const runs = pointsAt(key, from, to, progress, plot);
    expect(runs).toEqual(expected.runs);
    expect(runs.map(bumpSegment).join(" ")).toEqual(expected.line);
    expect(runs.map((run) => dotsPath(run, 2.5)).join("")).toEqual(
      expected.dots
    );
  }
);
it("reserves source rank and names gutters and keeps line path gaps", async () => {
  setTestMeasurement(300, 375);
  render(model({}));
  await settle();
  expect(probe().plot.left).toBe(42);
  expect(probe().pad.right).toBe(96);
  expect(probe().ranks).toEqual(bumpRanks(DATA, ["a", "b", "c"]));
  expect(svgs()[1]).toContain("C");
  expect(screen.getByText("Standings")).toBeTruthy();
});
it("preserves declaration-order score ties after recoloring a registered line", async () => {
  setTestMeasurement(300, 375);
  const data = [{ a: 10, b: 10, c: 10, date: "Tie" }];
  const { rerender } = render(model({ data, values: "score" }));
  await settle();
  rerender(model({ data, values: "score" }, "#aa1111"));
  await settle();
  expect(probe().ranks).toEqual({ a: [1], b: [2], c: [3] });
});
it("picks highlighted labels and paints selected line last", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onHighlightChange: change }));
  await settle();
  fireEvent.click(
    document.querySelector(".panel-bump-label button") ??
      screen.getAllByLabelText("Alpha")[0]
  );
  await settle();
  expect(probe().highlight).toBe("a");
  expect(change).toHaveBeenCalledWith("a");
  const [, svg] = svgs();
  expect(svg).toContain('stroke-width="2.5"');
  expect(svg.lastIndexOf('stroke="#a00000"')).toBeGreaterThan(
    svg.lastIndexOf('stroke="#00a000"')
  );
});
it("scrubs exact source nearest columns then clears readout on finalize", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  const canvas = document.querySelector(".panel-bump-pointer");
  expect(canvas).toBeTruthy();
  fireEvent.touchStart(canvas as Element, {
    touches: [{ identifier: 1, x: 42, y: 20 }],
  });
  await settle();
  expect(probe().activeIndex).toBe(0);
  fireEvent.touchMove(canvas as Element, {
    touches: [{ identifier: 1, x: 200, y: 20 }],
  });
  await settle();
  expect(probe().activeIndex).toBe(3);
  fireEvent.touchEnd(canvas as Element, { touches: [] });
  await settle();
  expect(change).toHaveBeenLastCalledWith(-1, null);
});
it("matches source skeleton theme alpha and .4 sweep-width", async () => {
  setTestMeasurement(300, 375);
  render(model({ status: "loading" }));
  await settle();
  const [svg] = svgs();
  expect(svg).toContain('stop-color="rgb(0, 0, 0)"');
  expect(svg).toContain('stop-opacity="0.1"');
  expect(svg).toContain('x2="0%"');
  expect(svgs()).toHaveLength(1);
});
it("anchors x labels at chart bottom like source and accepts zero names width", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <BumpChart data={DATA}>
        <BumpChart.Line dataKey="a" />
        <BumpChart.XAxis />
        <BumpChart.Labels width={0} />
        <Probe />
      </BumpChart>
    </PanelUIProvider>
  );
  await settle();
  const label = screen.getByText("W1");
  expect(label.dataset.taroStyle).toContain('"bottom":0');
  expect(probe().pad.right).toBe(10);
});
it("omits absent ranks in the source accessibility readout", async () => {
  setTestMeasurement(300, 375);
  render(model({}));
  await settle();
  expect(
    screen.getByLabelText("date, W2. Alpha, rank 2. Beta, rank 1")
  ).toBeTruthy();
});
const WrappedBumpLine = () => <BumpChart.Line dataKey="a" />;
WrappedBumpLine.layer = "series" as const;
it("places registered wrapped series after directly declared source series", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <BumpChart data={[{ a: 10, b: 10, date: "Tie" }]} values="score">
        <WrappedBumpLine />
        <BumpChart.Line dataKey="b" />
        <Probe />
      </BumpChart>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().ranks).toEqual({ a: [2], b: [1] });
});

it.each([
  ["#abcd", { stopColor: "#aabbcc", stopOpacity: 221 / 255 }],
  ["rgba(1, 2, 3, .25)", { stopColor: "rgb(1, 2, 3)", stopOpacity: 0.25 }],
  ["rgb(1 2 3 / 25%)", { stopColor: "rgb(1, 2, 3)", stopOpacity: 0.25 }],
  ["rgb(1,2,3)", { stopColor: "rgb(1,2,3)", stopOpacity: 1 }],
] as const)(
  "retains pinned alpha conversion under mini ES2017 parser %s",
  (input, expected) => {
    expect(colorStop(input)).toEqual(expected);
  }
);

it("preserves the source column alignment for grouped content", async () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    setTestMeasurement(300, 375);
    render(model({}));
    await settle();
    const label =
      document.querySelector(".panel-bump-label button") ??
      screen.getAllByLabelText("Alpha")[0];
    expect(getComputedStyle(label).display).toBe("flex");
    expect(getComputedStyle(label).flexDirection).toBe("column");
  } finally {
    style.remove();
  }
});
