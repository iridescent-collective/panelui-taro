// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { it, expect, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { FunnelChart, useFunnelChart } from "../src/components/FunnelChart";
import type { FunnelChartHandle } from "../src/components/FunnelChart";
import {
  funnelModel,
  funnelContains,
  funnelReach,
} from "../src/components/FunnelChart/math";
import { ribbonPath } from "../src/components/FunnelChart/ribbon";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/funnel-source.json";
import { setTestMeasurement, setElementMeasurement } from "./taro-api";

const DATA = [
  { label: "Visits", value: 100 },
  { label: "Checkout", value: 50 },
  { label: "Paid", value: 10 },
];
const Probe = () => (
  <span data-testid="state">{JSON.stringify(useFunnelChart())}</span>
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
it.each(FIXTURES.frames)("matches upstream frame %#", (frame) => {
  const data = frame.values.map((value, index) => ({
    label: `Stage ${index}`,
    value,
  }));
  const model = funnelModel(
    data,
    frame.width,
    200,
    undefined,
    4,
    frame.floor,
    frame.mirrored,
    700,
    90
  );
  for (const key of ["bands", "shares", "steps", "windows"] as const) {
    expect(model[key]).toEqual(frame.expected[key]);
  }
});
it("retains source ribbon geometry, zero omission and selection hit envelope", () => {
  expect(ribbonPath(0, 100, 70, 20, 100, 0)).toBe(
    "M0,30L100,80L100,120L0,170Z"
  );
  expect(ribbonPath(0, 0, 70, 20, 100, 0.55)).toBe("");
  const band = { head: 70, length: 100, offset: 0, tail: 20 };
  expect(funnelContains(band, 100, 0.55, 1, 50, 100)).toBe(true);
  expect(funnelContains(band, 100, 0.55, 1, 50, 0)).toBe(false);
  expect(funnelContains(band, 100, 0.55, 0, 50, 100)).toBe(false);
  expect(funnelReach(0.5, { from: 0, to: 1 })).toBe(0.875);
});
it("renders every part and selects labels, legend and canvas consistently", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <FunnelChart data={DATA} onActiveIndexChange={change}>
        <FunnelChart.Header title="Conversion" value="100" />
        <FunnelChart.Stages />
        <FunnelChart.Labels />
        <FunnelChart.Legend />
        <FunnelChart.Skeleton />
        <Probe />
      </FunnelChart>
    </PanelUIProvider>
  );
  await settle();
  expect(
    Number(
      [...svg().matchAll(/fill-opacity="(?<opacity>[^"]+)"/gu)][2]?.groups
        ?.opacity
    )
  ).toBeCloseTo(0.83);
  fireEvent.click(screen.getByRole("button", { name: "Checkout, 50, 50%" }));
  expect(change).toHaveBeenLastCalledWith(1);
  expect(
    JSON.parse(screen.getByTestId("state").textContent ?? "{}").activeStep
  ).toBe(0.5);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Checkout, 50 percent of the first stage",
    })
  );
  expect(change).toHaveBeenLastCalledWith(-1);
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing funnel canvas");
  }
  fireEvent.touchStart(canvas, {
    touches: [{ identifier: 1, x: 250, y: 100 }],
  });
  fireEvent.touchEnd(canvas, {
    changedTouches: [{ identifier: 1, x: 250, y: 100 }],
    touches: [],
  });
  expect(change).toHaveBeenLastCalledWith(2);
});
it("keeps controlled state, previous pills, and native design units", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <FunnelChart data={DATA} activeIndex={1}>
        <FunnelChart.Labels share="previous" />
        <Probe />
      </FunnelChart>
    </PanelUIProvider>
  );
  await settle();
  const label = screen.getByRole("button", { name: "Visits, 100" });
  expect(label.className).toContain("flex-col");
  expect(
    label.querySelector<HTMLElement>("[data-taro-style]")?.dataset.taroStyle
  ).toContain("60rpx");
  fireEvent.click(label);
  expect(
    JSON.parse(screen.getByTestId("state").textContent ?? "{}").activeIndex
  ).toBe(1);
});
it("mirrors label columns and draws a single loading ribbon, then restores stages", async () => {
  setTestMeasurement(300, 375);
  const ref = createRef<FunnelChartHandle>();
  const sample = (loading: boolean) => (
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <FunnelChart
          ref={ref}
          data={DATA}
          status={loading ? "loading" : "ready"}
        >
          <FunnelChart.Stages />
          <FunnelChart.Labels />
          <FunnelChart.Skeleton />
        </FunnelChart>
      </Direction>
    </PanelUIProvider>
  );
  const view = render(sample(true));
  await settle();
  expect((svg().match(/<path/gu) ?? []).length).toBe(1);
  expect(screen.queryByRole("button")).toBeNull();
  view.rerender(sample(false));
  await settle();
  expect((svg().match(/<path/gu) ?? []).length).toBe(9);
  expect(
    screen.getByRole("button", { name: "Visits, 100, 100%" }).dataset.taroStyle
  ).toContain("405.333");
  act(() => ref.current?.replay());
  expect(svg()).toContain("<path");
});
it("rejects isolated parts with a useful source error", () => {
  expect(() => render(<FunnelChart.Labels />)).toThrow(
    "must be used within a <FunnelChart>"
  );
});
it("accepts a held tap after the reveal replaces its graphics frame", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(300, 375);
    const change = vi.fn();
    render(
      <PanelUIProvider>
        <FunnelChart data={DATA} onActiveIndexChange={change}>
          <FunnelChart.Stages />
        </FunnelChart>
      </PanelUIProvider>
    );
    await settle();
    act(() => vi.advanceTimersByTime(96));
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      throw new Error("Missing funnel canvas");
    }
    fireEvent.touchStart(canvas, {
      touches: [{ identifier: 1, x: 50, y: 100 }],
    });
    act(() => vi.advanceTimersByTime(32));
    fireEvent.touchEnd(canvas, {
      changedTouches: [{ identifier: 1, x: 50, y: 100 }],
      touches: [],
    });
    expect(change).toHaveBeenLastCalledWith(0);
  } finally {
    vi.useRealTimers();
  }
});
it("measures the caller id on the outer chart including its header", async () => {
  setTestMeasurement(300, 375);
  setElementMeasurement("custom-funnel", {
    height: 350,
    left: 12,
    top: 24,
    width: 270,
  });
  const layout = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <FunnelChart id="custom-funnel" data={DATA} onLayout={layout}>
        <FunnelChart.Header title="Header" />
        <FunnelChart.Stages />
      </FunnelChart>
    </PanelUIProvider>
  );
  await settle();
  expect(layout).toHaveBeenLastCalledWith({
    nativeEvent: { layout: { height: 350, width: 270, x: 12, y: 24 } },
  });
});
