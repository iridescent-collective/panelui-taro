// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useChart } from "../src/components/LineChart/context";
import { PanelUIProvider } from "../src/components/Provider";
import {
  WaterfallChart,
  useWaterfallChart,
  waterfallSteps,
} from "../src/components/WaterfallChart";
import type {
  WaterfallChartProps,
  WaterfallKind,
} from "../src/components/WaterfallChart";
import {
  waterfallBarPath,
  waterfallConnectorPath,
  waterfallExtent,
} from "../src/components/WaterfallChart/math";
import FIXTURES from "./fixtures/waterfall-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { label: "Open", total: true, value: 100 },
  { label: "Sales", value: 40 },
  { label: "Costs", value: -70 },
  { label: "Close", total: true, value: 0 },
];
const Probe = () => {
  const state = useWaterfallChart();
  const { extent, plot } = useChart("probe");
  return (
    <span data-testid="waterfall-state">
      {JSON.stringify({ ...state, extent, plot })}
    </span>
  );
};
const probe = () =>
  JSON.parse(screen.getByTestId("waterfall-state").textContent ?? "{}");
const model = (props: Partial<WaterfallChartProps>) => (
  <PanelUIProvider reducedMotion>
    <WaterfallChart data={DATA} {...props}>
      <WaterfallChart.Header title="Balance" legend />
      <WaterfallChart.Grid />
      <WaterfallChart.Connectors />
      <WaterfallChart.Bars />
      <WaterfallChart.Values />
      <WaterfallChart.Skeleton />
      <WaterfallChart.XAxis />
      <WaterfallChart.YAxis />
      <WaterfallChart.Tooltip />
      <Probe />
    </WaterfallChart>
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
const roleOf = (role: string): WaterfallKind => {
  if (role === "total") {
    return "total";
  }
  if (role === "fall") {
    return "fall";
  }
  return "rise";
};
it.each(FIXTURES.frames)(
  "matches pinned Waterfall bars and connectors %#",
  ({ input, kind, wantActive, expected }) => {
    const narrowed = {
      ...input,
      steps: input.steps.map((step) => ({ ...step, kind: roleOf(step.kind) })),
    };
    const role = roleOf(kind);
    expect(waterfallBarPath(narrowed, role, wantActive)).toEqual(expected.bar);
    expect(waterfallConnectorPath(narrowed)).toEqual(expected.connector);
  }
);
it.each(FIXTURES.domains)(
  "matches pinned running balance and domain %#",
  ({ data, steps, extent }) => {
    expect(waterfallSteps(data)).toEqual(steps);
    expect(waterfallExtent(waterfallSteps(data))).toEqual(extent);
  }
);
it("normalizes invalid changes without poisoning a later running balance", () => {
  expect(
    waterfallSteps([
      { label: "Invalid", value: Number.NaN },
      { label: "Infinite", value: Number.POSITIVE_INFINITY },
      { label: "Valid", value: 12 },
    ]).map((step) => step.end)
  ).toEqual([0, 0, 12]);
  expect(waterfallExtent(waterfallSteps(DATA), [Number.NaN, 100])).toEqual([
    0, 154,
  ]);
});
it("draws floating changes and anchored totals with source role colors and labels", async () => {
  setTestMeasurement(300, 375);
  render(model({ id: "consumer-waterfall" }));
  await settle();
  expect(probe().extent).toEqual([0, 154]);
  expect(probe().plot).toEqual({ height: 116, left: 44, top: 12, width: 246 });
  expect(svg()[0].match(/<path /gu)).toHaveLength(7);
  expect(screen.getByText("+40")).toBeTruthy();
  expect(screen.getByText("-70")).toBeTruthy();
  expect(screen.getByText("Increase")).toBeTruthy();
  expect(
    screen.getByRole("img", { name: "Waterfall chart, 4 data entries" })
  ).toBeTruthy();
});
it("reports a step change and running balance then clears on touch end", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const formatTotal = vi.fn((step) => `Balance ${step.end}`);
  render(model({ onActiveIndexChange: change }));
  await settle();
  const pointer = document.querySelector("canvas.panel-waterfall-pointer");
  if (!pointer) {
    throw new Error("Missing pointer");
  }
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 4, x: 160, y: 60 }],
  });
  expect(probe().activeIndex).toBe(1);
  expect(probe().activeStep).toEqual(waterfallSteps(DATA)[1]);
  expect(screen.getByText("140")).toBeTruthy();
  expect(svg()[0]).toContain('opacity="0.3"');
  fireEvent.touchMove(pointer, { touches: [{ identifier: 4, x: 210, y: 60 }] });
  expect(probe().activeIndex).toBe(2);
  fireEvent.touchEnd(pointer);
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, 2, -1]);
  expect(formatTotal).not.toHaveBeenCalled();
});
it("horizontal mode reserves step gutter and maps pointer by y", async () => {
  setTestMeasurement(300, 375);
  render(model({ orientation: "horizontal" }));
  await settle();
  expect(probe().plot).toEqual({ height: 138, left: 76, top: 6, width: 214 });
  expect(screen.queryByText("+40")).toBeNull();
  const pointer = document.querySelector("canvas.panel-waterfall-pointer");
  if (!pointer) {
    throw new Error("Missing pointer");
  }
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 4, x: 150, y: 80 }],
  });
  expect(probe().activeIndex).toBe(2);
});
it("keeps a loading sweep separate from data paths and restores ready parts", async () => {
  setTestMeasurement(300, 375);
  const view = render(model({ status: "loading" }));
  await settle();
  expect(svg()[0]).toContain("linearGradient");
  expect(document.querySelector("canvas.panel-waterfall-pointer")).toBeNull();
  view.rerender(model({ status: "ready" }));
  await settle();
  expect(svg()[0]).not.toContain("linearGradient");
  expect(screen.getByText("+40")).toBeTruthy();
});
it("places source header before the accessibility data snapshot", async () => {
  setTestMeasurement(300, 375);
  render(model({}));
  await settle();
  const header = screen.getByText("Balance");
  const snapshot = screen.getByRole("img", {
    name: "Waterfall chart, 4 data entries",
  });
  expect(
    Boolean(header.compareDocumentPosition(snapshot) % 8 >= 4)
  ).toBeTruthy();
});
