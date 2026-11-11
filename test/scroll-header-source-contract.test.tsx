// @vitest-environment happy-dom

import { ScrollView, View } from "@tarojs/components";
import { act, fireEvent, render } from "@testing-library/react";
import { forwardRef } from "react";
import type { ComponentRef } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { ScrollHeader } from "../src/components/ScrollHeader";
import {
  bandHeight,
  collapseProgress,
  contentInset,
  isCrossing,
  snapTarget,
} from "../src/components/ScrollHeader/math";
import type { HeaderScrollableProps } from "../src/components/ScrollHeader/types";
import { createObservableNumber } from "../src/primitives/observable-number";
import { emitTestResize, setElementMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const customSnapshots: HeaderScrollableProps[] = [];
const CustomScroll = forwardRef<
  ComponentRef<typeof ScrollView>,
  HeaderScrollableProps
>((props, ref) => {
  customSnapshots.push(props);
  return (
    <ScrollView {...props} ref={ref}>
      <View style={props.contentContainerStyle}>Custom rows</View>
    </ScrollView>
  );
});
const LAYOUT_TITLE = <ScrollHeader.Title>Title</ScrollHeader.Title>;
const HeaderLayoutFixture = ({
  largeClass,
  scrollTop,
}: {
  largeClass?: string;
  scrollTop?: number;
}) => (
  <PanelUIProvider>
    <ScrollHeader inset={false}>
      <ScrollHeader.Bar>
        <ScrollHeader.Title>Title</ScrollHeader.Title>
      </ScrollHeader.Bar>
      <ScrollHeader.Large id="layout-large" className={largeClass}>
        {LAYOUT_TITLE}
      </ScrollHeader.Large>
      <ScrollView id="layout-scroll" scrollTop={scrollTop}>
        Rows
      </ScrollView>
    </ScrollHeader>
  </PanelUIProvider>
);
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};
const rect = (height: number) => ({ height, left: 0, top: 0, width: 375 });
const scrollDetail = (scrollTop: number) => ({
  deltaX: 0,
  deltaY: 0,
  scrollHeight: 1000,
  scrollLeft: 0,
  scrollTop,
  scrollWidth: 375,
});
const node = (id: string) => {
  const element = document.querySelector(`#${id}`);
  if (!element) {
    throw new Error(`Missing ${id}`);
  }
  return element;
};
const setup = (
  onCollapsedChange = vi.fn(),
  progress = createObservableNumber(),
  reducedMotion = false
) => {
  setElementMeasurement("header-large", rect(100));
  const tree = render(
    <PanelUIProvider reducedMotion={reducedMotion}>
      <ScrollHeader
        id="header"
        inset={false}
        progress={progress}
        onCollapsedChange={onCollapsedChange}
      >
        <ScrollHeader.Bar id="header-bar">
          <ScrollHeader.Title>Library</ScrollHeader.Title>
          <ScrollHeader.Actions>
            <button type="button">Search</button>
          </ScrollHeader.Actions>
        </ScrollHeader.Bar>
        <ScrollHeader.Large id="header-large">
          <ScrollHeader.Title>Library</ScrollHeader.Title>
          <ScrollHeader.Description>All books</ScrollHeader.Description>
        </ScrollHeader.Large>
        <ScrollView id="header-scroll" scrollY>
          <input defaultValue="Retained" />
        </ScrollView>
      </ScrollHeader>
    </PanelUIProvider>
  );
  return { onCollapsedChange, progress, tree };
};
it("retains exact source band, collapse, snap and inset math at boundaries", () => {
  expect(collapseProgress(50, 100, 1)).toBe(0.5);
  expect(collapseProgress(50, 100, 0.5)).toBe(1);
  expect(collapseProgress(1, 0, 1)).toBe(1);
  expect(collapseProgress(0, 0, 1)).toBe(0);
  expect(collapseProgress(5, 100, 0)).toBe(1);
  expect(bandHeight(48, 100, -30, true)).toBe(178);
  expect(bandHeight(48, 100, -30, false)).toBe(148);
  expect(bandHeight(48, 100, 300, true)).toBe(48);
  expect(snapTarget(50, 100, 0)).toBe(100);
  expect(snapTarget(49, 100, 0)).toBe(0);
  expect(snapTarget(50, 100, 0.051)).toBeNull();
  expect(snapTarget(1, 100, 0)).toBeNull();
  expect(snapTarget(99, 100, 0)).toBeNull();
  expect(contentInset(148, 12)).toBe(160);
  expect(contentInset(148, "10%")).toBe(148);
  expect(isCrossing(false, null)).toBe(false);
  expect(isCrossing(true, false)).toBe(true);
});
it("hands over the band in ordered opacity ramps with one crossing callback and one accessible title", async () => {
  const { progress, onCollapsedChange } = setup();
  await settle();
  const band = node("header").lastElementChild;
  expect(readTaroStyle(band)).toContain('"height":"296rpx"');
  expect(onCollapsedChange).not.toHaveBeenCalled();
  act(() =>
    dispatchTaroEvent(
      node("header-scroll"),
      TARO_TEST_EVENTS.scroll,
      scrollDetail(50)
    )
  );
  expect(progress.value).toBe(0.5);
  expect(readTaroStyle(band)).toContain('"height":"196rpx"');
  expect(readTaroStyle(node("header-large"))).toContain('"opacity":0');
  expect(node("header-large").getAttribute("aria-hidden")).toBe("false");
  act(() =>
    dispatchTaroEvent(
      node("header-scroll"),
      TARO_TEST_EVENTS.scroll,
      scrollDetail(100)
    )
  );
  expect(onCollapsedChange).toHaveBeenCalledExactlyOnceWith(true);
  expect(node("header-large").getAttribute("aria-hidden")).toBe("true");
  act(() =>
    dispatchTaroEvent(
      node("header-scroll"),
      TARO_TEST_EVENTS.scroll,
      scrollDetail(200)
    )
  );
  expect(onCollapsedChange).toHaveBeenCalledOnce();
  act(() =>
    dispatchTaroEvent(
      node("header-scroll"),
      TARO_TEST_EVENTS.scroll,
      scrollDetail(20)
    )
  );
  expect(onCollapsedChange.mock.calls).toEqual([[true], [false]]);
});
it("drag end at rest settles immediately without its quiet fallback cancelling the native scroll command", async () => {
  setup();
  await settle();
  act(() =>
    dispatchTaroEvent(node("header-scroll"), TARO_TEST_EVENTS.dragEnd, {
      ...scrollDetail(60),
      velocity: 0,
    })
  );
  await settle();
  expect(node("header-scroll").getAttribute("scrollTop")).toBe("100");
});
it("momentum-end snap uses full large height even when threshold finishes the handover early", async () => {
  setup();
  await settle();
  act(() =>
    dispatchTaroEvent(
      node("header-scroll"),
      TARO_TEST_EVENTS.scrollEnd,
      scrollDetail(30)
    )
  );
  await settle();
  expect(node("header-scroll").getAttribute("scrollTop")).toBe("0");
});
it("measurement changes preserve child identity and update resting content inset", async () => {
  setup();
  await settle();
  const input = node("header-scroll").querySelector("input");
  expect(readTaroStyle(node("header-scroll").firstElementChild)).toContain(
    '"paddingTop":"296rpx"'
  );
  setElementMeasurement("header-large", rect(140));
  act(() => emitTestResize());
  await settle();
  expect(readTaroStyle(node("header-scroll").firstElementChild)).toContain(
    '"paddingTop":"376rpx"'
  );
  expect(node("header-scroll").querySelector("input")).toBe(input);
});
it("reduced motion prevents elastic stretch and preserves direct scroll-linked progress", async () => {
  const { progress } = setup(vi.fn(), createObservableNumber(), true);
  await settle();
  act(() =>
    dispatchTaroEvent(
      node("header-scroll"),
      TARO_TEST_EVENTS.scroll,
      scrollDetail(-30)
    )
  );
  expect(readTaroStyle(node("header").lastElementChild)).toContain(
    '"height":"296rpx"'
  );
  expect(progress.value).toBe(0);
});
it("bar-only title remains visible while its surface hands over over 200ms", () => {
  vi.useFakeTimers();
  const progress = createObservableNumber();
  const tree = render(
    <PanelUIProvider>
      <ScrollHeader inset={false} progress={progress}>
        <ScrollHeader.Bar id="only-bar">
          <ScrollHeader.Title>Library</ScrollHeader.Title>
        </ScrollHeader.Bar>
        <ScrollView id="only-scroll">Rows</ScrollView>
      </ScrollHeader>
    </PanelUIProvider>
  );
  expect(
    readTaroStyle(node("only-bar").querySelector("span")?.parentElement)
  ).toContain('"opacity":1');
  act(() =>
    dispatchTaroEvent(
      node("only-scroll"),
      TARO_TEST_EVENTS.scroll,
      scrollDetail(1)
    )
  );
  expect(progress.value).toBe(0);
  act(() => vi.advanceTimersByTime(100));
  expect(progress.value).toBeGreaterThan(0);
  expect(progress.value).toBeLessThan(1);
  act(() => vi.advanceTimersByTime(100));
  expect(progress.value).toBe(1);
  tree.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("falling back from blur keeps an opaque token surface and preserves action interactivity", () => {
  const click = vi.fn();
  render(
    <PanelUIProvider>
      <ScrollHeader>
        <ScrollHeader.Bar
          id="blur-bar"
          surface="blur"
          material="dark"
          intensity={80}
          divider={false}
        >
          <ScrollHeader.Title>Title</ScrollHeader.Title>
          <ScrollHeader.Actions>
            <button type="button" onClick={click}>
              Action
            </button>
          </ScrollHeader.Actions>
        </ScrollHeader.Bar>
        <ScrollView>Rows</ScrollView>
      </ScrollHeader>
    </PanelUIProvider>
  );
  expect(node("blur-bar").firstElementChild?.className).toContain(
    "bg-[var(--panel-background)]"
  );
  fireEvent.click(document.querySelector("button") as Element);
  expect(click).toHaveBeenCalledOnce();
});
it("custom scrollables retain numeric content spacing, non-dimensional styles, indicators, refs and the same scroll event", async () => {
  const forwarded = vi.fn();
  customSnapshots.length = 0;
  const sourceRef = { current: null as ComponentRef<typeof ScrollView> | null };
  const childProps = {
    contentContainerStyle: {
      flexGrow: 1,
      opacity: 0.8,
      padding: 16,
      paddingTop: 20,
    },
    id: "custom-scroll",
    onScroll: forwarded,
    ref: sourceRef,
    scrollEventThrottle: 32,
    scrollIndicatorInsets: { bottom: 8, top: 7 },
  };
  const tree = render(
    <PanelUIProvider>
      <ScrollHeader inset={false}>
        <ScrollHeader.Bar>
          <ScrollHeader.Title>Title</ScrollHeader.Title>
        </ScrollHeader.Bar>
        <CustomScroll {...childProps} />
      </ScrollHeader>
    </PanelUIProvider>
  );
  const props = customSnapshots.at(-1);
  if (!props) {
    throw new Error("Custom scrollable did not render");
  }
  expect(sourceRef.current).toBe(node("custom-scroll"));
  expect(props.contentContainerStyle).toEqual({
    flexGrow: 1,
    opacity: 0.8,
    padding: "32rpx",
    paddingTop: "136rpx",
  });
  expect(props.scrollIndicatorInsets).toEqual({ bottom: 8, top: 7 });
  expect(props.scrollEventThrottle).toBe(32);
  expect(props.contentInsetAdjustmentBehavior).toBe("never");
  act(() =>
    dispatchTaroEvent(
      node("custom-scroll"),
      TARO_TEST_EVENTS.scroll,
      scrollDetail(12)
    )
  );
  expect(forwarded.mock.calls[0]?.[0].detail).toEqual(scrollDetail(12));
  tree.unmount();
  await settle();
});
it("quiet fallback waits for momentum to stop and cleans timers on unmount", async () => {
  const { tree } = setup();
  await settle();
  vi.useFakeTimers();
  const scroll = node("header-scroll");
  fireEvent.touchStart(scroll);
  act(() =>
    dispatchTaroEvent(scroll, TARO_TEST_EVENTS.scroll, scrollDetail(60))
  );
  fireEvent.touchEnd(scroll);
  act(() => vi.advanceTimersByTime(100));
  expect(scroll.getAttribute("scrollTop")).toBeNull();
  act(() =>
    dispatchTaroEvent(scroll, TARO_TEST_EVENTS.scroll, scrollDetail(70))
  );
  act(() => vi.advanceTimersByTime(100));
  expect(scroll.getAttribute("scrollTop")).toBeNull();
  act(() => vi.advanceTimersByTime(60));
  await act(async () => {
    await vi.runAllTimersAsync();
  });
  expect(scroll.getAttribute("scrollTop")).toBe("100");
  fireEvent.touchStart(scroll);
  fireEvent.touchEnd(scroll);
  tree.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("a new caller scrollTop request takes ownership after the header has snapped", async () => {
  setElementMeasurement("layout-large", rect(100));
  const tree = render(<HeaderLayoutFixture scrollTop={0} />);
  await settle();
  act(() =>
    dispatchTaroEvent(
      node("layout-scroll"),
      TARO_TEST_EVENTS.scrollEnd,
      scrollDetail(60)
    )
  );
  await settle();
  expect(node("layout-scroll").getAttribute("scrollTop")).toBe("100");
  tree.rerender(<HeaderLayoutFixture scrollTop={220} />);
  await settle();
  expect(node("layout-scroll").getAttribute("scrollTop")).toBe("220");
});
it("class-only large layout changes refresh measured height and the content inset", async () => {
  setElementMeasurement("layout-large", rect(100));
  const tree = render(<HeaderLayoutFixture largeClass="h-[200px]" />);
  await settle();
  expect(readTaroStyle(node("layout-scroll").firstElementChild)).toContain(
    '"paddingTop":"296rpx"'
  );
  setElementMeasurement("layout-large", rect(140));
  tree.rerender(<HeaderLayoutFixture largeClass="h-[280px]" />);
  await settle();
  expect(readTaroStyle(node("layout-scroll").firstElementChild)).toContain(
    '"paddingTop":"376rpx"'
  );
});
it("bar content is positioned above the opaque absolute surface in the WeChat CSS paint order", async () => {
  setup();
  await settle();
  const bar = node("header-bar");
  const content = bar.lastElementChild;
  expect(readTaroStyle(content)).toContain('"zIndex":1');
  expect(content?.className).toContain("relative");
});
