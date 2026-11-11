// @vitest-environment happy-dom
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { setTestMeasurement } from "../../../test/taro-api";
import {
  Pressable,
  ScrollView,
  View,
  useSafeAreaInsets,
} from "../runtime/native";
import type { NativeScrollHandle } from "../runtime/native";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

afterEach(() => setTestMeasurement(40, 375));

it.each([320, 375, 390, 430])(
  "round trips measured artwork widths through rpx at a %i pixel viewport",
  async (viewport) => {
    const measuredWidth = 96;
    setTestMeasurement(measuredWidth, viewport);
    const onLayout = vi.fn();
    const { container } = render(
      <View data-testid="artwork-column" className="flex-1" onLayout={onLayout}>
        <img alt="Flight path" width={280} height={44} />
      </View>
    );
    // A measured image must not impose its intrinsic width on the flex row.
    const view = container.querySelector(
      '[data-testid="artwork-column"]'
    ) as HTMLElement;
    expect(view.style.minWidth).toBe("0");
    await waitFor(() => expect(onLayout).toHaveBeenCalled());
    const { layout } = onLayout.mock.calls[0][0].nativeEvent;
    expect(layout.width * 2 * (viewport / 750)).toBeCloseTo(measuredWidth);
  }
);

it.each([320, 375, 390, 430])(
  "keeps measured paging, scroll events and scrollTo in the same coordinates at %i pixels",
  async (viewport) => {
    setTestMeasurement(96, viewport);
    const scale = 375 / viewport;
    const ref = createRef<NativeScrollHandle>();
    const onLayout = vi.fn();
    const onScroll = vi.fn();
    const { getByTestId } = render(
      <ScrollView
        data-testid="scroller"
        ref={ref}
        onLayout={onLayout}
        onScroll={onScroll}
      >
        <View style={{ height: 2000 }} />
      </ScrollView>
    );
    await waitFor(() => expect(onLayout).toHaveBeenCalled());
    const scroller = getByTestId("scroller");
    act(() =>
      dispatchTaroEvent(scroller, TARO_TEST_EVENTS.scroll, {
        scrollHeight: 2000,
        scrollLeft: 12,
        scrollTop: 210,
        scrollWidth: 96,
      })
    );
    const event = onScroll.mock.calls[0][0].nativeEvent;
    expect(event.contentOffset.y).toBeCloseTo(210 * scale);
    expect(event.contentOffset.x).toBeCloseTo(12 * scale);
    expect(event.contentSize.height).toBeCloseTo(2000 * scale);
    expect(event.layoutMeasurement.width).toBeCloseTo(96 * scale);
    act(() =>
      ref.current?.scrollTo({
        x: event.contentOffset.x,
        y: event.contentOffset.y,
      })
    );
    expect(Number(scroller.getAttribute("scrollTop"))).toBeCloseTo(210);
    expect(Number(scroller.getAttribute("scrollLeft"))).toBeCloseTo(12);
    // Sortable's explicitly native handle must continue to use platform pixels.
    expect(ref.current?.readNativeMetrics()?.offset).toBe(210);
    act(() => ref.current?.scrollToNative(80));
    expect(Number(scroller.getAttribute("scrollTop"))).toBe(80);
    const { result } = renderHook(useSafeAreaInsets);
    expect(result.current.bottom).toBeCloseTo(34 * scale);
  }
);

it("lets a pressable flex item shrink without dropping explicit sizing", () => {
  const { getByTestId } = render(
    <>
      <Pressable data-testid="flex-tile" className="flex-1">
        Tile
      </Pressable>
      <View data-testid="class-sized" className="min-w-36">
        Minimum
      </View>
      <Pressable data-testid="fixed-tile" style={{ minWidth: 120 }}>
        Fixed
      </Pressable>
    </>
  );
  expect(getByTestId("flex-tile").style.minWidth).toBe("0");
  expect(getByTestId("class-sized").style.minWidth).toBe("");
  expect(getByTestId("fixed-tile").getAttribute("style")).toContain("240rpx");
});
