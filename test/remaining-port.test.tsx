// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

it("retains upstream breakpoint validation and physical window thresholds", async () => {
  const { breakpointAt, breakpointEntries } =
    await import("../src/hooks/breakpoint-contract");
  expect(breakpointAt(breakpointEntries({ phone: 0, tablet: 768 }), 800)).toBe(
    "tablet"
  );
  expect(() => breakpointEntries({ wide: 800, narrow: 400 })).toThrow(
    "ascending"
  );
  const { useBreakpoint } = await import("../src/hooks/use-breakpoint");
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current.width).toBe(375);
  expect(result.current.isAtLeast("md")).toBe(false);
});

it("scroll sections choose the last section at the bottom and preserve a programmatic jump", async () => {
  const { useScrollSections } =
    await import("../src/hooks/use-scroll-sections");
  const { result, unmount } = renderHook(() =>
    useScrollSections({ ids: ["one", "two", "three"], offset: 0 })
  );
  act(() => {
    result.current.measure("one")({ nativeEvent: { layout: { y: 0 } } });
    result.current.measure("two")({ nativeEvent: { layout: { y: 300 } } });
    result.current.measure("three")({ nativeEvent: { layout: { y: 700 } } });
    result.current.scrollProps.onLayout({
      nativeEvent: { layout: { height: 400 } },
    });
    result.current.scrollProps.onContentSizeChange(375, 900);
    result.current.scrollProps.onScroll({
      detail: { scrollTop: 500, scrollHeight: 900 },
    });
  });
  expect(result.current.active).toBe("three");
  act(() => result.current.scrollTo("two"));
  expect(result.current.active).toBe("two");
  unmount();
});

it("ports Camera arithmetic and complete compound anatomy", async () => {
  const model = await import("../src/components/Camera/camera-model");
  expect(model.nextFlash("photo", "off")).toBe("auto");
  expect(model.nextFlash("video", "off")).toBe("on");
  expect(model.nextTimer(10)).toBe(0);
  expect(model.zoomFromPinch(0.2, 2)).toBe(0.7);
  const { Camera } = await import("../src/components/Camera");
  for (const part of [
    "Preview",
    "Header",
    "Footer",
    "Controls",
    "Button",
    "Flash",
    "Timer",
    "Duration",
    "Zoom",
    "Modes",
    "Library",
    "Flip",
    "Shutter",
  ]) {
    expect(Camera).toHaveProperty(part);
  }
});

it("exposes the upstream solid Glass fallback instead of claiming native material", async () => {
  const { hasGlass, useGlassMaterial } =
    await import("../src/primitives/glass");
  expect(hasGlass).toBe(false);
  expect(renderHook(() => useGlassMaterial()).result.current).toBe(false);
});

it("keeps requested scroll targets separate from observations with a native Taro ref", async () => {
  const { useScrollSections } =
    await import("../src/hooks/use-scroll-sections");
  vi.useFakeTimers();
  try {
    const { result, unmount } = renderHook(() =>
      useScrollSections({ ids: ["one", "two"] })
    );
    result.current.ref.current = document.createElement(
      "div"
    ) as unknown as NonNullable<typeof result.current.ref.current>;
    act(() =>
      result.current.measure("two")({ nativeEvent: { layout: { y: 300 } } })
    );
    act(() => result.current.scrollTo("two"));
    act(() => vi.advanceTimersByTime(0));
    expect(result.current.scrollProps.scrollTop).toBe(300);
    act(() =>
      result.current.scrollProps.onScroll({
        detail: { scrollTop: 100, scrollHeight: 900 },
      })
    );
    expect(result.current.scrollProps.scrollTop).toBe(300);
    expect(result.current.scroll.offset.value).toBe(100);
    unmount();
  } finally {
    vi.useRealTimers();
  }
});
