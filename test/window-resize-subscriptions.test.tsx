// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";

import { useElementLayout } from "../src/hooks/use-element-layout";
import { useWindowMetrics } from "../src/hooks/use-window-metrics";
import {
  emitTestResize,
  measurementStats,
  setTestMeasurement,
} from "./taro-api";

it("shares one native resize listener across measurements and window consumers", async () => {
  const consumers = Array.from({ length: 24 }, (_, index) =>
    renderHook(() => {
      const metrics = useWindowMetrics(index % 2 === 0 ? "window" : "screen");
      const layout = useElementLayout(true, "content");
      return { layout, metrics };
    })
  );
  await act(() => Promise.resolve());
  expect(measurementStats().listeners).toBe(1);
  await act(async () => {
    setTestMeasurement(120, 750);
    emitTestResize();
    await Promise.resolve();
  });
  for (const consumer of consumers) {
    expect(consumer.result.current.metrics.scale).toBe(0.5);
    expect(consumer.result.current.layout.layout?.width).toBe(60);
  }
  const first = consumers.shift();
  first?.unmount();
  expect(measurementStats().listeners).toBe(1);
  for (const consumer of consumers) {
    consumer.unmount();
  }
  expect(measurementStats().listeners).toBe(0);
  setTestMeasurement(40, 375);
});

it("reconnects on remount and refreshes new window dimensions", () => {
  const first = renderHook(useWindowMetrics);
  first.unmount();
  expect(measurementStats().listeners).toBe(0);
  setTestMeasurement(40, 750);
  const next = renderHook(useWindowMetrics);
  expect(next.result.current.scale).toBe(0.5);
  expect(measurementStats().listeners).toBe(1);
  next.unmount();
  expect(measurementStats().listeners).toBe(0);
  setTestMeasurement(40, 375);
});
