// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { usePopoverMotion } from "../src/components/Popover/use-motion";
import { PanelUIProvider } from "../src/components/Provider";

const wrapper = ({ children }: { children: ReactNode }) => (
  <PanelUIProvider>{children}</PanelUIProvider>
);
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const scale = (transform: string) =>
  Number(transform.match(/scale\(([^)]+)\)/u)?.[1]);
afterEach(() => vi.useRealTimers());

it("waits for placement, then fades in for 120ms and settles with Native spring overshoot", () => {
  vi.useFakeTimers();
  const { result, rerender, unmount } = renderHook(
    ({ placed }) => usePopoverMotion(true, placed),
    { initialProps: { placed: false }, wrapper }
  );
  advance(500);
  expect(result.current.opacity).toBe(0);
  expect(result.current.transform).toBe("translate(0rpx,-16rpx) scale(0.94)");
  rerender({ placed: true });
  advance(64);
  expect(result.current.opacity).toBeGreaterThan(0);
  expect(result.current.opacity).toBeLessThan(1);
  // Analytic response of the upstream damping=18, stiffness=250, mass=0.6 spring.
  expect(scale(result.current.transform)).toBeCloseTo(0.9662, 3);
  advance(56);
  expect(result.current.opacity).toBe(1);
  advance(120);
  expect(scale(result.current.transform)).toBeGreaterThan(1);
  advance(1600);
  expect(scale(result.current.transform)).toBe(1);
  expect(result.current.transition).toBe("none");
  rerender({ placed: false });
  expect(result.current.opacity).toBe(0);
  expect(scale(result.current.transform)).toBe(0.94);
  rerender({ placed: true });
  advance(64);
  expect(scale(result.current.transform)).toBeCloseTo(0.9662, 3);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("fades out without reversing the entry and resumes cleanly on rapid reopening", () => {
  vi.useFakeTimers();
  const { result, rerender, unmount } = renderHook(
    ({ open }) => usePopoverMotion(open, true, "top"),
    { initialProps: { open: true }, wrapper }
  );
  expect(result.current.transform).toContain("16rpx");
  advance(2000);
  rerender({ open: false });
  advance(60);
  expect(result.current.opacity).toBeGreaterThan(0);
  expect(result.current.opacity).toBeLessThan(1);
  expect(scale(result.current.transform)).toBe(1);
  rerender({ open: true });
  advance(120);
  expect(result.current.opacity).toBe(1);
  rerender({ open: false });
  advance(120);
  expect(result.current.opacity).toBe(0);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("shows and hides immediately with reduced motion while still waiting for placement", () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ placed, open }) => usePopoverMotion(open, placed),
    {
      initialProps: { placed: false, open: true },
      wrapper: ({ children }) => (
        <PanelUIProvider reducedMotion>{children}</PanelUIProvider>
      ),
    }
  );
  expect(result.current.opacity).toBe(0);
  rerender({ placed: true, open: true });
  expect(result.current.opacity).toBe(1);
  expect(result.current.transform).toBe("none");
  rerender({ placed: true, open: false });
  expect(result.current.opacity).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("keeps the entry fade and scale but stops without reversing when overshoot is clamped", () => {
  vi.useFakeTimers();
  const { result, unmount } = renderHook(
    () => usePopoverMotion(true, true, "bottom", true),
    { wrapper }
  );
  expect(scale(result.current.transform)).toBe(0.94);
  advance(64);
  expect(result.current.opacity).toBeGreaterThan(0);
  expect(result.current.opacity).toBeLessThan(1);
  let previous = scale(result.current.transform);
  for (let frame = 0; frame < 70; frame += 1) {
    advance(16);
    const current = scale(result.current.transform);
    expect(current).toBeGreaterThanOrEqual(previous);
    expect(current).toBeLessThanOrEqual(1);
    previous = current;
  }
  expect(result.current.opacity).toBe(1);
  expect(result.current.transform).toBe("translate(0rpx,0rpx) scale(1)");
  expect(vi.getTimerCount()).toBe(0);
  unmount();
});
