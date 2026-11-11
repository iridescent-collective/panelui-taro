// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useChart } from "../src/components/LineChart/context";
import { PanelUIProvider } from "../src/components/Provider";
import { PyramidChart, usePyramidChart } from "../src/components/PyramidChart";
import type { PyramidChartProps } from "../src/components/PyramidChart";
import {
  pyramidChartExtent,
  pyramidChartPath,
} from "../src/components/PyramidChart/math";
import FIXTURES from "./fixtures/pyramid-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { female: 20, male: 40, name: "Adelie" },
  { female: -5, male: 73, name: "Gentoo" },
  { female: 7, male: null, name: "Chinstrap" },
];
const Probe = () => {
  const state = usePyramidChart();
  const { extent, plot } = useChart("probe");
  return (
    <span data-testid="pyramid-state">
      {JSON.stringify({ ...state, extent, plot })}
    </span>
  );
};
const probe = () =>
  JSON.parse(screen.getByTestId("pyramid-state").textContent ?? "{}");
const model = (props: Partial<PyramidChartProps>) => (
  <PanelUIProvider reducedMotion>
    <PyramidChart data={DATA} {...props}>
      <PyramidChart.Header title="Penguins" legend />
      <PyramidChart.Grid />
      <PyramidChart.Bar dataKey="male" side="start" />
      <PyramidChart.Bar dataKey="female" side="end" />
      <PyramidChart.Skeleton />
      <PyramidChart.XAxis />
      <PyramidChart.YAxis />
      <PyramidChart.Tooltip />
      <Probe />
    </PyramidChart>
  </PanelUIProvider>
);
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const svg = () =>
  [...document.querySelectorAll('img[src^="data:image/svg+xml"]')].map(
    (image) =>
      decodeURIComponent(image.getAttribute("src")?.split(",")[1] ?? "")
  );
it.each(FIXTURES.frames)(
  "matches pinned Pyramid bar frame %#",
  ({ input, expected }) => {
    expect(
      pyramidChartPath({
        ...input,
        side: input.side === "start" ? "start" : "end",
      })
    ).toEqual(expected);
  }
);
it.each(FIXTURES.domains)(
  "matches pinned shared nice domain %#",
  ({ data, keys, maxValue, expected }) => {
    expect(pyramidChartExtent(data, keys, maxValue)).toEqual([0, expected]);
  }
);
it("renders both wings on one shared rounded scale with default chart tokens", async () => {
  setTestMeasurement(300, 375);
  render(model({ id: "consumer-pyramid" }));
  await settle();
  expect(probe().extent).toEqual([0, 80]);
  expect(probe().plot).toEqual({ height: 222, left: 10, top: 6, width: 280 });
  expect(svg()[0]).toContain('fill="#3b82f6"');
  expect(svg()[0]).toContain('fill="#262626"');
  expect(svg()[0].match(/<path /gu)).toHaveLength(4);
  expect(
    screen.getByRole("img", { name: "Pyramid chart, 3 data entries" })
  ).toBeTruthy();
  expect(screen.getByText("Adelie")).toBeTruthy();
});
it.each(["above", "center", "start"] as const)(
  "keeps category bands aligned with %s placement",
  async (labelPlacement) => {
    setTestMeasurement(300, 375);
    render(model({ labelPlacement }));
    await settle();
    expect(probe().plot.left).toBe(labelPlacement === "start" ? 68 : 10);
    const text = screen.getByText("Gentoo");
    expect(text).toBeTruthy();
    if (labelPlacement === "above") {
      expect(text.parentElement?.dataset.taroStyle).toContain('"top":"160rpx"');
    }
  }
);
it("resolves rows by y band, fades rest and retains negative raw readout", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  const pointer = document.querySelector("canvas.panel-pyramid-pointer");
  if (!pointer) {
    throw new Error("Missing pointer");
  }
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 3, x: 20, y: 100 }],
  });
  expect(probe().activeIndex).toBe(1);
  expect(screen.getByText("-5")).toBeTruthy();
  expect(svg()[0]).toContain('opacity="0.3"');
  fireEvent.touchMove(pointer, {
    touches: [{ identifier: 3, x: 250, y: 210 }],
  });
  expect(probe().activeIndex).toBe(2);
  fireEvent.touchEnd(pointer);
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, 2, -1]);
});
it("loading substitutes equal paired placeholders then restores real data", async () => {
  setTestMeasurement(300, 375);
  const view = render(model({ status: "loading" }));
  await settle();
  expect(document.querySelector("canvas.panel-pyramid-pointer")).toBeNull();
  expect(svg()[0]).toContain("linearGradient");
  view.rerender(model({ status: "ready" }));
  await settle();
  expect(svg()[0]).not.toContain("linearGradient");
  expect(probe().extent).toEqual([0, 80]);
});
