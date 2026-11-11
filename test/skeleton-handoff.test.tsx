// @vitest-environment happy-dom

import { act, render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Skeleton } from "../src/components/Skeleton";
import { useSkeletonHandoff } from "../src/primitives/skeleton-handoff";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <PanelUIProvider reducedMotion={false}>{children}</PanelUIProvider>
);
it("fades for source 220ms, cancels stale fade when loading returns and clears timers on unmount", () => {
  vi.useFakeTimers();
  try {
    const hook = renderHook(({ loading }) => useSkeletonHandoff(loading), {
      initialProps: { loading: true },
      wrapper: Wrapper,
    });
    expect(hook.result.current).toEqual({ mounted: true, opacity: 1 });
    hook.rerender({ loading: false });
    act(() => vi.advanceTimersByTime(110));
    expect(hook.result.current.mounted).toBe(true);
    expect(hook.result.current.opacity).toBeGreaterThan(0);
    expect(hook.result.current.opacity).toBeLessThan(1);
    hook.rerender({ loading: true });
    act(() => vi.advanceTimersByTime(300));
    expect(hook.result.current).toEqual({ mounted: true, opacity: 1 });
    hook.rerender({ loading: false });
    act(() => vi.advanceTimersByTime(220));
    expect(hook.result.current).toEqual({ mounted: false, opacity: 0 });
    hook.rerender({ loading: true });
    hook.rerender({ loading: false });
    hook.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

it("allows the business skin to own pulse animation without changing the default", () => {
  const view = render(
    <Wrapper>
      <Skeleton />
    </Wrapper>
  );
  expect(
    view.container.querySelector('[aria-hidden="true"]')?.className
  ).toContain("panelui-skeleton-pulse");
  view.rerender(
    <Wrapper>
      <Skeleton animated={false} className="animate-pulse" />
    </Wrapper>
  );
  expect(
    view.container.querySelector('[aria-hidden="true"]')?.className
  ).not.toContain("panelui-skeleton-pulse");
  expect(
    view.container.querySelector('[aria-hidden="true"]')?.className
  ).toContain("animate-pulse");
});
