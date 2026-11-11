// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { RingChart, useRingChart } from "../src/components/RingChart";
import type {
  RingChartHandle,
  RingChartProps,
} from "../src/components/RingChart";
import {
  ringContainsPoint,
  ringGeometry,
  ringRadius,
} from "../src/components/RingChart/math";
import FIXTURES from "./fixtures/ring-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { label: "Move", maxValue: 100, value: 60 },
  { label: "Read", maxValue: 20, value: 12 },
  { label: "Practice", maxValue: 60, value: 30 },
];
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const Probe = () => {
  const state = useRingChart();
  return <span data-testid="ring-state">{JSON.stringify(state)}</span>;
};
const probe = () =>
  JSON.parse(screen.getByTestId("ring-state").textContent ?? "{}");
const svg = () =>
  decodeURIComponent(
    document
      .querySelector('img[src^="data:image/svg+xml"]')
      ?.getAttribute("src")
      ?.split(",")[1] ?? ""
  );
const pointer = () => {
  const canvas = document.querySelector("canvas.panel-ring-pointer");
  if (!canvas) {
    throw new Error("Missing ring canvas");
  }
  return canvas;
};
const tap = (x: number, y: number) => {
  fireEvent.touchStart(pointer(), { touches: [{ identifier: 1, x, y }] });
  fireEvent.touchEnd(pointer(), { touches: [] });
};
const model = (
  props: Partial<RingChartProps>,
  ref?: React.Ref<RingChartHandle>
) => (
  <PanelUIProvider reducedMotion>
    <RingChart data={DATA} size={240} {...props} ref={ref}>
      <RingChart.Header title="Goals" legend />
      <RingChart.Ring index={0} />
      <RingChart.Ring index={1} segments={12} />
      <RingChart.Ring index={2} />
      <RingChart.Center />
      <RingChart.Legend />
      <Probe />
    </RingChart>
  </PanelUIProvider>
);
it.each(FIXTURES)(
  "matches source ring dash frame %#",
  ({ input, expected }) => {
    expect(ringGeometry(input)).toEqual(expected);
  }
);
it("keeps source hit stroke width and dead gauge half", () => {
  expect(ringRadius(240, 12, 6, 2)).toBe(78);
  expect(ringContainsPoint(120, 6, 240, 114, 12, -90, 0.5)).toBe(true);
  expect(ringContainsPoint(120, 234, 240, 114, 12, -90, 0.5)).toBe(false);
  expect(ringContainsPoint(120, 120, 240, 114, 12, 0, 1)).toBe(false);
});
it("draws actual concentric circle tracks, segmented dash patterns and first-ring center", async () => {
  setTestMeasurement(240, 375);
  render(model({}));
  await settle();
  expect(svg().match(/<circle /gu)).toHaveLength(6);
  expect(svg()).toContain('transform="rotate(-90 120 120)"');
  expect(svg()).toContain('stroke-linecap="butt"');
  expect(svg()).toContain('stroke-opacity="0.15"');
  expect(screen.getByText("60")).toBeTruthy();
  expect(probe().activeRing).toBeNull();
  expect(svg()).not.toContain("NaN");
});
it("actual ring tap selects, repeated tap clears and dimming follows source", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  tap(120, 6);
  expect(probe().activeIndex).toBe(0);
  expect(svg()).toContain('opacity="0.35"');
  tap(120, 6);
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([0, -1]);
});
it("clips segmented gauge painting to its live semicircle while keeping native dead-half hits inactive", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <RingChart
        data={DATA}
        size={240}
        startAngle={-90}
        endAngle={90}
        onActiveIndexChange={change}
      >
        <RingChart.Ring index={0} segments={12} />
        <Probe />
      </RingChart>
    </PanelUIProvider>
  );
  await settle();
  const graphic = svg();
  expect(graphic).toContain("<clipPath ");
  expect(graphic).toMatch(/clip-path="url\(#[^)]+\)"/u);
  expect(graphic).toContain('stroke-dasharray="');
  tap(120, 234);
  expect(change).not.toHaveBeenCalled();
  tap(120, 6);
  expect(change).toHaveBeenCalledWith(0);
});
it("pressable legend selects its own ring and preserves percentages rather than totals", async () => {
  setTestMeasurement(240, 375);
  render(model({}));
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Read, 60 percent" }));
  expect(probe().activeIndex).toBe(1);
  expect(screen.getByText("12")).toBeTruthy();
  expect(screen.queryByText("102")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Read, 60 percent" }));
  expect(probe().activeIndex).toBe(-1);
});
it("controlled refusal does not move selection and accepted updates read current datum", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  const view = render(model({ activeIndex: 2, onActiveIndexChange: change }));
  await settle();
  tap(120, 6);
  expect(change).toHaveBeenCalledWith(0);
  expect(probe().activeIndex).toBe(2);
  view.rerender(model({ activeIndex: 0, onActiveIndexChange: change }));
  await settle();
  expect(probe().activeRing.label).toBe("Move");
});
it("movement and extra fingers cancel taps and open gauge gap remains inactive", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  render(model({ endAngle: 90, onActiveIndexChange: change, startAngle: -90 }));
  await settle();
  tap(120, 234);
  expect(change).not.toHaveBeenCalled();
  fireEvent.touchStart(pointer(), {
    touches: [{ identifier: 1, x: 120, y: 6 }],
  });
  fireEvent.touchMove(pointer(), {
    touches: [{ identifier: 1, x: 150, y: 6 }],
  });
  fireEvent.touchEnd(pointer());
  expect(change).not.toHaveBeenCalled();
  fireEvent.touchStart(pointer(), {
    touches: [
      { identifier: 1, x: 120, y: 6 },
      { identifier: 2, x: 140, y: 6 },
    ],
  });
  fireEvent.touchEnd(pointer());
  expect(change).not.toHaveBeenCalled();
});
it("small hole drops target caption, custom center gets null unselected and selected datum", async () => {
  setTestMeasurement(160, 375);
  const view = render(model({ size: 160 }));
  await settle();
  expect(screen.queryByText("of 100")).toBeNull();
  view.rerender(
    <PanelUIProvider reducedMotion>
      <RingChart data={DATA} size={240}>
        <RingChart.Ring index={0} />
        <RingChart.Center>
          {(ring) => <span>{ring?.label ?? "Custom idle"}</span>}
        </RingChart.Center>
        <Probe />
      </RingChart>
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByText("Custom idle")).toBeTruthy();
  tap(120, 6);
  expect(screen.getByText("Move")).toBeTruthy();
});
it("ref replay remains callable and measured square keeps header outside plot", async () => {
  setTestMeasurement(300, 375);
  const ref = createRef<RingChartHandle>();
  render(model({ size: undefined }, ref));
  await settle();
  expect(svg()).toContain('viewBox="0 0 300 300"');
  act(() => ref.current?.replay());
  expect(svg()).toContain('r="144"');
});

it("checks the final native release point and pointer identity even without a last move", async () => {
  setTestMeasurement(240, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  fireEvent.touchStart(pointer(), {
    touches: [{ identifier: 1, x: 120, y: 6 }],
  });
  fireEvent.touchEnd(pointer(), {
    changedTouches: [{ identifier: 1, x: 160, y: 6 }],
    touches: [],
  });
  expect(change).not.toHaveBeenCalled();
  fireEvent.touchStart(pointer(), {
    touches: [{ identifier: 1, x: 120, y: 6 }],
  });
  fireEvent.touchEnd(pointer(), {
    changedTouches: [{ identifier: 2, x: 120, y: 6 }],
    touches: [],
  });
  expect(change).not.toHaveBeenCalled();
});
it("normalizes multi-turn start angles before checking a gauge dead area", () => {
  expect(ringContainsPoint(120, 234, 240, 114, 12, 1080, 0.25)).toBe(false);
  expect(ringContainsPoint(120, 6, 240, 114, 12, 1080, 0.25)).toBe(true);
  expect(ringContainsPoint(120, 234, 240, 114, 12, -1080, 0.25)).toBe(false);
});

const CustomOverlay = Object.assign(() => <span>Custom overlay</span>, {
  slot: "custom",
});
it("keeps unrecognized custom slot metadata in the source default overlay", async () => {
  setTestMeasurement(240, 375);
  render(
    <PanelUIProvider reducedMotion>
      <RingChart data={DATA} size={240}>
        <RingChart.Ring index={0} />
        <CustomOverlay />
      </RingChart>
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByText("Custom overlay")).toBeTruthy();
});
