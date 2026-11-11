// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { SplitView, useSplitView } from "../src/components/SplitView";
import {
  nearestSnapIndex,
  normalizeSnapIndex,
  resolveLength,
  resolveSnapPoints,
} from "../src/components/SplitView/split-view-math";
import { deferred } from "./helpers/deferred";
import {
  emitTestResize,
  setElementMeasurement,
  showActionSheet,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const POINTS = [0.25, 0.5, 0.75];
const touches = (y: number, x = 0) => [
  { clientX: x, clientY: y, identifier: 1 },
];
const measure = () => {
  setElementMeasurement("split-view", {
    height: 300,
    left: 0,
    top: 0,
    width: 200,
  });
  setElementMeasurement("drag-area", {
    height: 20,
    left: 0,
    top: 0,
    width: 200,
  });
};
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const heightStyle = () => readTaroStyle(screen.getByTestId("top"));
const SnapControl = () => {
  const context = useSplitView();
  const height = useSyncExternalStore(
    context.topHeight.subscribe,
    context.topHeight.getSnapshot,
    context.topHeight.getSnapshot
  );
  return (
    <>
      <button onClick={() => context.snapTo(2)}>Snap last</button>
      <button onClick={() => context.snapTo(0)}>Snap first</button>
      <span data-testid="index">{context.snapIndex}</span>
      <span data-testid="live-height">{height}</span>
    </>
  );
};
it("source lengths resolve ratios, absolute and bottom-relative limits with ordered deduplicated points", () => {
  expect(resolveLength(0.5, 300, 100)).toBe(150);
  expect(resolveLength(-80, 300, 100)).toBe(220);
  expect(resolveLength(Number.NaN, 300, 100)).toBe(100);
  expect(
    resolveSnapPoints([0.5, 0.5001, 0.25, Number.NaN, 1], 300, 100, 250)
  ).toEqual([100, 150, 250]);
  expect(resolveSnapPoints([Number.NaN], 300, 100, 250)).toEqual([100]);
  expect(nearestSnapIndex(140, [70, 140, 210], 300, 280)).toBe(2);
  expect(nearestSnapIndex(70, [70, 80, 90, 100, 110], 10_000, 280)).toBe(1);
  expect(normalizeSnapIndex(9, 3)).toBe(2);
});
it("panes share the measured room excluding the actual drag area and hook requests update all parts", async () => {
  measure();
  const snap = vi.fn();
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SplitView
        id="split-view"
        snapPoints={POINTS}
        minHeight={0}
        onSnap={snap}
        onSnapIndexChange={changed}
      >
        <SplitView.Top data-testid="top">Top</SplitView.Top>
        <SplitView.DragArea id="drag-area">
          <SplitView.Handle />
        </SplitView.DragArea>
        <SplitView.Bottom data-testid="bottom">
          <SnapControl />
        </SplitView.Bottom>
      </SplitView>
    </PanelUIProvider>
  );
  await settle();
  expect(heightStyle()).toContain('"height":"280rpx"');
  expect(snap).toHaveBeenLastCalledWith(1, 140);
  expect(screen.getByTestId("bottom").className).toContain("min-h-0");
  snap.mockClear();
  fireEvent.click(screen.getByText("Snap last"));
  await settle();
  expect(changed).toHaveBeenCalledExactlyOnceWith(2);
  expect(snap).toHaveBeenCalledExactlyOnceWith(2, 210);
  expect(heightStyle()).toContain('"height":"420rpx"');
  expect(screen.getByTestId("live-height").textContent).toBe("210");
});
it("uncontrolled default index survives the initial empty measurement", async () => {
  setElementMeasurement("split-view", null);
  setElementMeasurement("drag-area", {
    height: 20,
    left: 0,
    top: 0,
    width: 200,
  });
  render(
    <PanelUIProvider reducedMotion>
      <SplitView
        id="split-view"
        defaultSnapIndex={2}
        snapPoints={POINTS}
        minHeight={0}
      >
        <SplitView.Top data-testid="top">Top</SplitView.Top>
        <SplitView.DragArea id="drag-area">
          <SplitView.Handle />
        </SplitView.DragArea>
        <SplitView.Bottom>
          <SnapControl />
        </SplitView.Bottom>
      </SplitView>
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByTestId("index").textContent).toBe("0");
  measure();
  act(() => emitTestResize());
  await settle();
  expect(screen.getByTestId("index").textContent).toBe("2");
  expect(heightStyle()).toContain('"height":"420rpx"');
});
it("controlled rejection settles at the accepted index while velocity biases a release by one snap", async () => {
  vi.useFakeTimers();
  try {
    measure();
    const changed = vi.fn();
    const snap = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <SplitView
          id="split-view"
          snapIndex={1}
          snapPoints={POINTS}
          minHeight={0}
          onSnapIndexChange={changed}
          onSnap={snap}
        >
          <SplitView.Top data-testid="top">Top</SplitView.Top>
          <SplitView.DragArea id="drag-area">
            <SplitView.Handle />
          </SplitView.DragArea>
          <SplitView.Bottom>Bottom</SplitView.Bottom>
        </SplitView>
      </PanelUIProvider>
    );
    await settle();
    snap.mockClear();
    const area = screen.getByRole("separator");
    fireEvent.touchStart(area, { touches: touches(100) });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.touchMove(area, { touches: touches(130) });
    fireEvent.touchEnd(area, { changedTouches: touches(130) });
    await settle();
    expect(changed).toHaveBeenCalledExactlyOnceWith(2);
    expect(snap).toHaveBeenCalledExactlyOnceWith(1, 140);
    expect(heightStyle()).toContain('"height":"280rpx"');
  } finally {
    vi.useRealTimers();
  }
});
it("onSnap waits for the actual spring and a new request cancels the previous completion", async () => {
  vi.useFakeTimers();
  try {
    measure();
    const snap = vi.fn();
    const tree = render(
      <PanelUIProvider>
        <SplitView
          id="split-view"
          snapPoints={POINTS}
          minHeight={0}
          onSnap={snap}
        >
          <SplitView.Top data-testid="top">Top</SplitView.Top>
          <SplitView.DragArea id="drag-area">
            <SplitView.Handle />
          </SplitView.DragArea>
          <SplitView.Bottom>
            <SnapControl />
          </SplitView.Bottom>
        </SplitView>
      </PanelUIProvider>
    );
    await settle();
    act(() => vi.advanceTimersByTime(2000));
    snap.mockClear();
    fireEvent.click(screen.getByText("Snap last"));
    act(() => vi.advanceTimersByTime(160));
    expect(snap).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2000));
    expect(snap).toHaveBeenCalledExactlyOnceWith(2, 210);
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("cross axis failure and disabling during a drag restore the accepted pane without new index requests", async () => {
  measure();
  const changed = vi.fn();
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SplitView
        id="split-view"
        snapPoints={POINTS}
        minHeight={0}
        onSnapIndexChange={changed}
      >
        <SplitView.Top data-testid="top">Top</SplitView.Top>
        <SplitView.DragArea id="drag-area">
          <SplitView.Handle />
        </SplitView.DragArea>
        <SplitView.Bottom>Bottom</SplitView.Bottom>
      </SplitView>
    </PanelUIProvider>
  );
  await settle();
  const area = screen.getByRole("separator");
  fireEvent.touchStart(area, { touches: touches(100) });
  fireEvent.touchMove(area, { touches: touches(102, 20) });
  fireEvent.touchEnd(area, { changedTouches: touches(102, 20) });
  await settle();
  expect(changed).not.toHaveBeenCalled();
  fireEvent.touchStart(area, { touches: touches(100) });
  fireEvent.touchMove(area, { touches: touches(160) });
  tree.rerender(
    <PanelUIProvider reducedMotion>
      <SplitView
        id="split-view"
        snapPoints={POINTS}
        minHeight={0}
        disabled
        onSnapIndexChange={changed}
      >
        <SplitView.Top data-testid="top">Top</SplitView.Top>
        <SplitView.DragArea id="drag-area">
          <SplitView.Handle />
        </SplitView.DragArea>
        <SplitView.Bottom>Bottom</SplitView.Bottom>
      </SplitView>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.touchEnd(area, { changedTouches: touches(160) });
  await settle();
  expect(changed).not.toHaveBeenCalled();
  expect(heightStyle()).toContain('"height":"280rpx"');
});
it("native adjustment is bounded and late menu replies cannot update an unmounted split", async () => {
  measure();
  const changed = vi.fn();
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SplitView
        id="split-view"
        snapPoints={POINTS}
        minHeight={0}
        onSnapIndexChange={changed}
      >
        <SplitView.Top data-testid="top">Top</SplitView.Top>
        <SplitView.DragArea id="drag-area">
          <SplitView.Handle />
        </SplitView.DragArea>
        <SplitView.Bottom>Bottom</SplitView.Bottom>
      </SplitView>
    </PanelUIProvider>
  );
  await settle();
  const area = screen.getByRole("separator");
  dispatchTaroEvent(area, TARO_TEST_EVENTS.longPress, {});
  await settle();
  expect(changed).toHaveBeenCalledExactlyOnceWith(2);
  const pending = deferred<{
    tapIndex: number;
  }>();
  showActionSheet.mockImplementationOnce(() => pending.promise);
  dispatchTaroEvent(area, TARO_TEST_EVENTS.longPress, {});
  tree.unmount();
  await act(async () => {
    pending.resolve({ tapIndex: 1 });
    await Promise.resolve();
  });
  expect(changed).toHaveBeenCalledTimes(1);
});
it("release uses the last displayed pane and its last observed velocity", async () => {
  vi.useFakeTimers();
  try {
    measure();
    const changed = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <SplitView
          id="split-view"
          snapPoints={POINTS}
          minHeight={0}
          onSnapIndexChange={changed}
        >
          <SplitView.Top data-testid="top">Top</SplitView.Top>
          <SplitView.DragArea id="drag-area">
            <SplitView.Handle />
          </SplitView.DragArea>
          <SplitView.Bottom>Bottom</SplitView.Bottom>
        </SplitView>
      </PanelUIProvider>
    );
    await settle();
    const area = screen.getByRole("separator");
    fireEvent.touchStart(area, { touches: touches(100) });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.touchMove(area, { touches: touches(130) });
    fireEvent.touchEnd(area, { changedTouches: touches(60) });
    await settle();
    expect(changed).toHaveBeenCalledExactlyOnceWith(2);
  } finally {
    vi.useRealTimers();
  }
});
