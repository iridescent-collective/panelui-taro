// @vitest-environment happy-dom

import { act, render, renderHook } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { expect, it, vi } from "vitest";

import { TimePicker } from "../src/components/TimePicker";
import { useSnap } from "../src/components/TimePicker/use-snap";
import * as taroApi from "./taro-api";

it("a queued correction does not publish a scroll prop after a new finger takes over", () => {
  const tasks: (() => void)[] = [];
  const tick = vi
    .spyOn(taroApi, "nextTick")
    .mockImplementation((task) => tasks.push(task));
  try {
    const hook = renderHook(
      ({ index }) => useSnap(index, 24, 44, 0, false, () => {}, "hours"),
      { initialProps: { index: 9 } }
    );
    act(() => hook.result.current.relayout());
    const before = hook.result.current.position;
    act(() => hook.result.current.start());
    act(() => {
      for (const task of tasks.splice(0)) {
        task();
      }
    });
    expect(hook.result.current.position).toBe(before);
  } finally {
    tick.mockRestore();
  }
});
it("measuring the ruler retries the initial native offset after zero-padding clipping", async () => {
  taroApi.setTestMeasurement(300, 375);
  let native = 852;
  const observed: number[] = [];
  const Host = () => {
    const target = useRef<HTMLElement | null>(null);
    useEffect(() => {
      target.current = document.querySelector(".panel-time-ruler");
      if (!target.current) {
        throw new Error("Missing ruler");
      }
      const observer = new MutationObserver(() => {
        const value = Number(target.current?.getAttribute("scrollLeft"));
        native = Math.min(value, 1140);
        observed.push(native);
      });
      observer.observe(target.current, {
        attributeFilter: ["scrollleft"],
        attributes: true,
      });
      return () => observer.disconnect();
    }, []);
    return (
      <TimePicker
        presentation="inline"
        layout="ruler"
        minuteStep={15}
        value={{ hour: 23, minute: 45 }}
      />
    );
  };
  render(<Host />);
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(observed.length).toBeGreaterThan(0);
  expect(native).toBe(1140);
});
