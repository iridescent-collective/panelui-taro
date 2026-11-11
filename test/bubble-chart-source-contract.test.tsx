// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { BubbleChart, useBubbleChart } from "../src/components/BubbleChart";
import type { BubbleChartProps } from "../src/components/BubbleChart";
import { useChart } from "../src/components/BubbleChart/context";
import {
  bubbleCircleFrame,
  bubbleExtents,
  bubbleSizeExtent,
  resolveBubbles,
  bubbleFit,
  projectBubble,
} from "../src/components/BubbleChart/math";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/bubble-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { c: 2, n: "A", s: 10, x: 10, y: 20 },
  { c: "#cc00aa", n: "B", s: 30, x: 30, y: 60 },
  { c: 5, n: "C", s: 20, x: 20, y: 10 },
];
const Probe = () => {
  const state = useBubbleChart();
  const { plot, xExtent, yExtent, bubbles } = useChart("probe");
  return (
    <span data-testid="bubble-state">
      {JSON.stringify({ ...state, bubbles, plot, xExtent, yExtent })}
    </span>
  );
};
Probe.layer = "footer" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("bubble-state").textContent ?? "{}");
const model = (props: Partial<BubbleChartProps>, onFit = vi.fn()) => (
  <PanelUIProvider reducedMotion>
    <BubbleChart data={DATA} sizeKey="s" labelKey="n" colorKey="c" {...props}>
      <BubbleChart.Header title="Teams" value="60" caption="Size = people" />
      <BubbleChart.Grid />
      <BubbleChart.Quadrants
        labels={{ topLeft: "Potential", topRight: "Leaders" }}
      />
      <BubbleChart.Trend onFit={onFit} />
      <BubbleChart.Bubbles />
      <BubbleChart.Labels />
      <BubbleChart.SizeKey label="People" />
      <BubbleChart.Skeleton />
      <BubbleChart.XAxis label="Efficiency" />
      <BubbleChart.YAxis label="Performance" />
      <BubbleChart.Tooltip />
      <BubbleChart.Legend />
      <Probe />
    </BubbleChart>
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
  "matches pinned axis/area/palette/fit model %#",
  ({ input, expected }) => {
    const sizeExtent = bubbleSizeExtent(input.data, input.sizeKey);
    const bubbles = resolveBubbles(
      input.data,
      input.xDataKey,
      input.yDataKey,
      input.sizeKey,
      input.labelKey,
      input.colorKey,
      sizeExtent,
      [input.sizeRange[0], input.sizeRange[1]],
      input.palette
    );
    expect({
      bubbles,
      extents: bubbleExtents(input.data, input.xDataKey, input.yDataKey),
      fit: bubbleFit(bubbles),
      sizeExtent,
    }).toEqual(expected);
  }
);
it.each(FIXTURES.frames)(
  "matches pinned grow/overshoot/selected circle frame %#",
  ({ input, expected }) => {
    expect(
      bubbleCircleFrame({
        ...input,
        xExtent: [input.xExtent[0], input.xExtent[1]],
        yExtent: [input.yExtent[0], input.yExtent[1]],
      })
    ).toEqual(expected);
  }
);
it("renders complete field with title gutters and per-row native labels", async () => {
  setTestMeasurement(300, 375);
  render(model({ id: "consumer-bubbles" }));
  await settle();
  expect(probe().plot).toEqual({ height: 226, left: 62, top: 28, width: 210 });
  expect(svg().match(/<circle /gu)).toHaveLength(3);
  expect(svg()).toContain('fill="#cc00aa"');
  expect(screen.getByText("People")).toBeTruthy();
  expect(screen.getByText("Efficiency")).toBeTruthy();
  expect(screen.getByText("Performance")).toBeTruthy();
  expect(screen.getByText("Leaders")).toBeTruthy();
  expect(
    screen.getByRole("img", { name: "Bubble chart, 3 data entries" })
  ).toBeTruthy();
  expect(screen.getAllByText("A")).toHaveLength(2);
});
it("selects nearest bubble, swells it and clears when drag leaves hit radius", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActivePointChange: change }));
  await settle();
  const { plot, xExtent, yExtent, bubbles } = probe();
  const center = projectBubble(bubbles[0], plot, xExtent, yExtent);
  const pointer = document.querySelector("canvas.panel-bubble-pointer");
  if (!pointer) {
    throw new Error("Missing bubble pointer");
  }
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 2, x: center.x, y: center.y }],
  });
  expect(probe().activeIndex).toBe(0);
  expect(probe().activePoint.label).toBe("A");
  expect(svg()).toContain('r="11.200000000000001"');
  expect(screen.getByText("10, 20")).toBeTruthy();
  fireEvent.touchMove(pointer, { touches: [{ identifier: 2, x: 0, y: 0 }] });
  expect(probe().activeIndex).toBe(-1);
  fireEvent.touchEnd(pointer);
  expect(change.mock.calls.map(([point]) => point?.index ?? -1)).toEqual([
    0, -1,
  ]);
});
it("source trend reports numeric fit once across equivalent caller rerenders", async () => {
  setTestMeasurement(300, 375);
  const fit = vi.fn();
  const view = render(model({ sizeRange: [10, 28] }, fit));
  await settle();
  expect(fit).toHaveBeenCalledTimes(1);
  view.rerender(model({ sizeRange: [10, 28] }, fit));
  await settle();
  expect(fit).toHaveBeenCalledTimes(1);
  view.rerender(
    model({ data: DATA.map((row) => ({ ...row, y: row.y * 2 })) }, fit)
  );
  await settle();
  expect(fit).toHaveBeenCalledTimes(2);
});
it("keeps area key absent without size data and hides labels below min radius", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <BubbleChart data={DATA} labelKey="n" sizeRange={[5, 9]}>
        <BubbleChart.Bubbles />
        <BubbleChart.Labels />
        <BubbleChart.SizeKey />
        <Probe />
      </BubbleChart>
    </PanelUIProvider>
  );
  await settle();
  expect(svg().match(/<circle /gu)).toHaveLength(3);
  expect(screen.queryByText("A")).toBeNull();
  expect(screen.queryByText("People")).toBeNull();
});
it("holds deterministic static skeleton and restores real bubbles", async () => {
  setTestMeasurement(300, 375);
  const view = render(model({ status: "loading" }));
  await settle();
  expect(svg().match(/<circle /gu)).toHaveLength(7);
  const initial = svg();
  view.rerender(model({ status: "loading" }));
  await settle();
  expect(svg()).toBe(initial);
  expect(document.querySelector("canvas.panel-bubble-pointer")).toBeNull();
  view.rerender(model({ status: "ready" }));
  await settle();
  expect(svg().match(/<circle /gu)).toHaveLength(3);
});
it("missing coordinates cannot stretch measured axes or enter point selection", async () => {
  setTestMeasurement(300, 375);
  render(
    model({ data: [...DATA, { n: "Absent", s: 3, x: null, y: 100_000 }] })
  );
  await settle();
  expect(probe().bubbles).toHaveLength(3);
  expect(probe().yExtent).toEqual([10, 60]);
  expect(screen.queryByText("Absent")).toBeNull();
});

const chart = (data = DATA) => (
  <PanelUIProvider reducedMotion={false}>
    <BubbleChart data={data} labelKey="n" sizeKey="s">
      <BubbleChart.Bubbles />
      <BubbleChart.Labels />
      <Probe />
    </BubbleChart>
  </PanelUIProvider>
);
afterEach(() => vi.useRealTimers());
it("reveal and axis tween carry circles and names on the same measured frame", async () => {
  vi.useFakeTimers();
  setTestMeasurement(300, 375);
  const view = render(chart());
  await settle();
  expect(svg()).toContain('fill-opacity="0"');
  act(() => vi.advanceTimersByTime(400));
  expect(svg()).not.toContain('fill-opacity="0"');
  act(() => vi.advanceTimersByTime(400));
  const circles = new DOMParser()
    .parseFromString(svg(), "image/svg+xml")
    .querySelectorAll("circle");
  const firstX = Number(circles[0].getAttribute("cx"));
  const firstY = Number(circles[0].getAttribute("cy"));
  expect(screen.getByText("A").parentElement?.dataset.taroStyle).toContain(
    `translate(${(firstX - 10) * 2}rpx,${(firstY - 8) * 2}rpx)`
  );
  const first = svg();
  view.rerender(chart(DATA.map((row) => ({ ...row, y: row.y * 2 }))));
  await settle();
  expect(svg()).not.toBe(first);
  act(() => vi.advanceTimersByTime(500));
  expect(svg()).not.toContain("NaN");
  expect(probe().yExtent).toEqual([20, 120]);
});

it("equivalent inline size ranges survive caller updates during an active touch", async () => {
  setTestMeasurement(300, 375);
  const Caller = () => {
    const [label, setLabel] = useState("none");
    return (
      <>
        <span data-testid="caller-selection">{label}</span>
        {model({
          sizeRange: [14, 30],
          onActivePointChange: (point) => setLabel(point?.label ?? "none"),
        })}
      </>
    );
  };
  render(<Caller />);
  await settle();
  const { plot, xExtent, yExtent, bubbles } = probe();
  const center = projectBubble(bubbles[0], plot, xExtent, yExtent);
  const pointer = document.querySelector("canvas.panel-bubble-pointer");
  if (!pointer) throw new Error("Missing bubble pointer");
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 1, x: center.x, y: center.y }],
  });
  expect(probe().activeIndex).toBe(0);
  expect(screen.getByTestId("caller-selection").textContent).toBe("A");
  fireEvent.touchEnd(pointer);
  expect(probe().activeIndex).toBe(-1);
});
