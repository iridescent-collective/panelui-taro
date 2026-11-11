// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useScrollCommand } from "../src/hooks/use-scroll-command";
import {
  resetElementMeasurements,
  setElementCanvasNode,
  setElementMeasurement,
  setElementFieldsResult,
} from "./taro-api";

it("uses native commands without pinning the offset, and cancels queued corrections on touch", async () => {
  resetElementMeasurements();
  const scrollTo = vi.fn();
  const hook = renderHook(() => useScrollCommand());
  setElementCanvasNode(hook.result.current.id, { scrollTo });
  await act(async () => hook.result.current.scrollTo(420));
  expect(scrollTo).toHaveBeenLastCalledWith({
    top: 420,
    animated: false,
    duration: 0,
  });
  expect(hook.result.current.position).toBeUndefined();
  scrollTo.mockClear();
  await act(async () => {
    hook.result.current.scrollTo(900);
    hook.result.current.cancel();
  });
  expect(scrollTo).not.toHaveBeenCalled();
  hook.unmount();
  resetElementMeasurements();
});

it("keeps fallback offsets synchronized without resetting the native view on touch", async () => {
  resetElementMeasurements();
  const hook = renderHook(() => useScrollCommand(true));
  await act(async () => hook.result.current.scrollTo(120));
  expect(hook.result.current.position).toBe(120);
  act(() => hook.result.current.acknowledge(50));
  expect(hook.result.current.position).toBe(50);
  act(() => hook.result.current.acknowledge(120));
  expect(hook.result.current.position).toBe(120);
  await act(async () => hook.result.current.scrollTo(200));
  act(() => hook.result.current.cancel());
  expect(hook.result.current.position).toBe(200);
  hook.unmount();
});

it("sends horizontal native commands and discards corrections after unmount", async () => {
  resetElementMeasurements();
  const scrollTo = vi.fn();
  const hook = renderHook(() => useScrollCommand(true));
  setElementCanvasNode(hook.result.current.id, { scrollTo });
  await act(async () => hook.result.current.scrollTo(72));
  expect(scrollTo).toHaveBeenLastCalledWith({
    left: 72,
    animated: false,
    duration: 0,
  });
  scrollTo.mockClear();
  await act(async () => {
    hook.result.current.scrollTo(144);
    hook.unmount();
  });
  expect(scrollTo).not.toHaveBeenCalled();
  resetElementMeasurements();
});

it("waits for offscreen popover measurement to finish before issuing a native command", async () => {
  vi.useFakeTimers();
  resetElementMeasurements();
  const scrollTo = vi.fn();
  const hook = renderHook(() => useScrollCommand());
  try {
    setElementCanvasNode(hook.result.current.id, { scrollTo });
    setElementMeasurement(hook.result.current.id, {
      left: -10000,
      top: -10000,
      width: 120,
      height: 260,
    });
    await act(async () => hook.result.current.scrollTo(420));
    expect(scrollTo).not.toHaveBeenCalled();
    setElementMeasurement(hook.result.current.id, {
      left: 100,
      top: 100,
      width: 120,
      height: 260,
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(40);
    });
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: 420,
      animated: false,
      duration: 0,
    });
  } finally {
    hook.unmount();
    resetElementMeasurements();
    vi.useRealTimers();
  }
});

it("falls back when a host accepts a command but does not move, without overriding a new touch", async () => {
  vi.useFakeTimers();
  resetElementMeasurements();
  const scrollTo = vi.fn();
  const hook = renderHook(() => useScrollCommand());
  try {
    setElementCanvasNode(hook.result.current.id, { scrollTo });
    setElementFieldsResult(hook.result.current.id, {
      scrollTop: 0,
      scrollLeft: 0,
    });
    await act(async () => hook.result.current.scrollTo(420));
    expect(hook.result.current.position).toBeUndefined();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(hook.result.current.position).toBe(420);
    act(() => hook.result.current.acknowledge(420));
    act(() => hook.result.current.cancel());
    expect(hook.result.current.position).toBe(420);
    act(() => hook.result.current.acknowledge(450));
    expect(hook.result.current.position).toBe(450);
  } finally {
    hook.unmount();
    resetElementMeasurements();
    vi.useRealTimers();
  }
});
