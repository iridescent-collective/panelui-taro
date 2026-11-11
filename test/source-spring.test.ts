// @vitest-environment happy-dom

import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  useSourceSpring,
  useSourceSpringController,
} from "../src/hooks/use-source-spring";
import { startSourceSpring, stepSourceSpring } from "../src/lib/source-spring";
import samples from "./fixtures/source-spring-4.5.1.json";

it.each(samples.samples)(
  "$name matches every captured upstream frame, stiffness and energy termination",
  (sample) => {
    const model = startSourceSpring(
      sample.from,
      sample.to,
      sample.velocity ?? 0,
      sample.config
    );
    expect(model.stiffness).toBeCloseTo(sample.stiffness, 10);
    for (const frame of sample.frames) {
      const done = stepSourceSpring(model, 16);
      expect(model.position).toBeCloseTo(frame.position, 10);
      expect(model.velocity).toBeCloseTo(frame.velocity, 10);
      expect(done).toBe(frame.done);
    }
  }
);
it("the source spring hook follows a heavy physical arrival, preserves published position on interruption and cleans frames", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(
      ({ target }) => useSourceSpring(target, { mass: 3 }, false, -100),
      { initialProps: { target: 0 } }
    );
    act(() => vi.advanceTimersByTime(128));
    const expected = samples.samples[0].frames.find(
      (frame) => frame.elapsed === 128
    )?.position;
    expect(view.result.current).toBeCloseTo(expected ?? 0, 10);
    const before = view.result.current;
    view.rerender({ target: 20 });
    expect(view.result.current).toBe(before);
    act(() => vi.advanceTimersByTime(16));
    expect(view.result.current).toBeGreaterThan(before);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("reduced motion and zero durations are immediate, with inertia away from a new target clipped", () => {
  const model = startSourceSpring(0, 1, -5, {
    dampingRatio: 0.9,
    duration: 350,
  });
  expect(model.velocity).toBe(0);
  const reduced = renderHook(() => useSourceSpring(1, { mass: 3 }, true, 0));
  expect(reduced.result.current).toBe(1);
  const immediate = renderHook(() =>
    useSourceSpring(1, { duration: 0 }, false, 0)
  );
  expect(immediate.result.current).toBe(1);
});
it("a controller publishes motion without rerendering its owner and a reentrant subscriber cancels stale frames", () => {
  vi.useFakeTimers();
  try {
    const renders = vi.fn();
    const published = vi.fn();
    const view = renderHook(() => {
      renders();
      return useSourceSpringController(0, { mass: 3 }, false, published);
    });
    let changed = false;
    const unsubscribe = view.result.current.signal.subscribe(() => {
      if (!changed && view.result.current.signal.value > 0.1) {
        changed = true;
        view.result.current.setImmediate(0.5);
      }
    });
    act(() => view.result.current.springTo(1));
    act(() => vi.advanceTimersByTime(160));
    expect(view.result.current.read()).toBe(0.5);
    expect(view.result.current.signal.value).toBe(0.5);
    expect(renders).toHaveBeenCalledTimes(1);
    expect(published.mock.calls.at(-1)?.[0]).toBe(0.5);
    expect(vi.getTimerCount()).toBe(0);
    unsubscribe();
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});
it("explicit velocity contributes to initial source energy and hard endpoint clamping prevents a flick overshoot", () => {
  const model = startSourceSpring(0.5, 1, 700, {
    damping: 22,
    mass: 0.7,
    overshootClamping: true,
    stiffness: 220,
    velocity: 700,
  });
  expect(model.initialEnergy).toBe(0.5 * 220 * 0.5 ** 2 + 0.5 * 0.7 * 700 ** 2);
  expect(stepSourceSpring(model, 16)).toBe(true);
  expect(model.position).toBe(1);
});
