// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Compare } from "../src/components/Compare";
import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementMeasurement, showActionSheet } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const touches = (x: number, y = 50) => [
  { clientX: x, clientY: y, identifier: 1 },
];
const measure = () =>
  setElementMeasurement("compare-test", {
    height: 100,
    left: 0,
    top: 0,
    width: 200,
  });
const Content = () => (
  <>
    <Compare.Before data-testid="before">
      <span>Original</span>
    </Compare.Before>
    <Compare.Handle data-testid="handle" />
    <Compare.After data-testid="after">
      <span>Edited</span>
    </Compare.After>
    <Compare.Label data-testid="label">Original</Compare.Label>
  </>
);
it("source layering keeps full measured content behind a proportional clipping window", async () => {
  measure();
  render(
    <PanelUIProvider>
      <Compare id="compare-test" data-testid="root" defaultValue={0.25}>
        <Content />
      </Compare>
    </PanelUIProvider>
  );
  await settle();
  expect(readTaroStyle(screen.getByTestId("before"))).toContain(
    '"width":"400rpx"'
  );
  expect(readTaroStyle(screen.getByTestId("before").parentElement)).toContain(
    '"width":"100rpx"'
  );
  expect(readTaroStyle(screen.getByTestId("handle"))).toContain(
    "translateX(64rpx)"
  );
});
it("direct source layers are reordered independently of their declaration order", async () => {
  measure();
  render(
    <PanelUIProvider>
      <Compare id="compare-test" data-testid="root">
        <Compare.Before data-testid="before" />
        <Compare.Handle data-testid="handle" />
        <Compare.After data-testid="after" />
      </Compare>
    </PanelUIProvider>
  );
  await settle();
  const root = document.querySelector("#compare-test");
  expect(root?.firstElementChild).toBe(screen.getByTestId("after"));
  expect(root?.lastElementChild).toBe(screen.getByTestId("handle"));
});
it("drag reports each changed whole percent and commits the last displayed position", async () => {
  measure();
  const changed = vi.fn();
  const committed = vi.fn();
  render(
    <PanelUIProvider>
      <Compare
        id="compare-test"
        data-testid="root"
        onValueChange={changed}
        onValueCommit={committed}
      >
        <Content />
      </Compare>
    </PanelUIProvider>
  );
  await settle();
  const root = screen.getByTestId("root");
  fireEvent.touchStart(root, { touches: touches(100) });
  fireEvent.touchMove(root, { touches: touches(140) });
  fireEvent.touchMove(root, { touches: touches(140.2) });
  expect(changed).toHaveBeenCalledExactlyOnceWith(0.7);
  expect(readTaroStyle(screen.getByTestId("before").parentElement)).toContain(
    "280.4rpx"
  );
  fireEvent.touchEnd(root, { changedTouches: touches(150) });
  await settle();
  expect(committed).toHaveBeenCalledExactlyOnceWith(0.701);
});
it("controlled refusal restores the accepted position after release", async () => {
  measure();
  const committed = vi.fn();
  render(
    <PanelUIProvider>
      <Compare
        id="compare-test"
        data-testid="root"
        value={0.5}
        onValueCommit={committed}
      >
        <Content />
      </Compare>
    </PanelUIProvider>
  );
  await settle();
  const root = screen.getByTestId("root");
  fireEvent.touchStart(root, { touches: touches(100) });
  fireEvent.touchMove(root, { touches: touches(140) });
  expect(screen.getByTestId("handle").getAttribute("aria-valuenow")).toBe("70");
  fireEvent.touchEnd(root, { changedTouches: touches(150) });
  await settle();
  expect(committed).toHaveBeenCalledExactlyOnceWith(0.7);
  expect(screen.getByTestId("handle").getAttribute("aria-valuenow")).toBe("50");
});
it("RTL mirrors horizontal anchors while vertical travel retains its direction", async () => {
  measure();
  const view = render(
    <PanelUIProvider>
      <Direction dir="rtl">
        <Compare id="compare-test" data-testid="root">
          <Content />
        </Compare>
      </Direction>
    </PanelUIProvider>
  );
  await settle();
  const root = screen.getByTestId("root");
  fireEvent.touchStart(root, { touches: touches(100) });
  fireEvent.touchMove(root, { touches: touches(140) });
  fireEvent.touchEnd(root, { changedTouches: touches(140) });
  await settle();
  expect(screen.getByTestId("handle").getAttribute("aria-valuenow")).toBe("30");
  expect(readTaroStyle(screen.getByTestId("before"))).toContain('"right":0');
  expect(readTaroStyle(screen.getByTestId("label"))).toContain(
    '"right":"16rpx"'
  );
  view.rerender(
    <PanelUIProvider>
      <Direction dir="rtl">
        <Compare id="compare-test" data-testid="root" orientation="vertical">
          <Content />
        </Compare>
      </Direction>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.touchStart(root, { touches: touches(100, 50) });
  fireEvent.touchMove(root, { touches: touches(100, 70) });
  fireEvent.touchEnd(root, { changedTouches: touches(100, 70) });
  await settle();
  expect(screen.getByTestId("handle").getAttribute("aria-valuenow")).toBe("50");
  expect(readTaroStyle(screen.getByTestId("before"))).toContain('"left":0');
});
it("cross-axis and disabled changes cancel without persisting a gesture", async () => {
  measure();
  const committed = vi.fn();
  const view = render(
    <PanelUIProvider>
      <Compare id="compare-test" data-testid="root" onValueCommit={committed}>
        <Content />
      </Compare>
    </PanelUIProvider>
  );
  await settle();
  const root = screen.getByTestId("root");
  fireEvent.touchStart(root, { touches: touches(100) });
  fireEvent.touchMove(root, { touches: touches(100, 80) });
  fireEvent.touchEnd(root, { changedTouches: touches(100, 80) });
  expect(committed).not.toHaveBeenCalled();
  fireEvent.touchStart(root, { touches: touches(100) });
  fireEvent.touchMove(root, { touches: touches(140) });
  view.rerender(
    <PanelUIProvider>
      <Compare
        id="compare-test"
        data-testid="root"
        disabled
        onValueCommit={committed}
      >
        <Content />
      </Compare>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.touchEnd(root, { changedTouches: touches(140) });
  expect(committed).not.toHaveBeenCalled();
  expect(screen.getByTestId("handle").getAttribute("aria-valuenow")).toBe("50");
});
it("native long-press adjustment reports both change and commit with the configured step", async () => {
  measure();
  const change = vi.fn();
  const commit = vi.fn();
  render(
    <PanelUIProvider>
      <Compare
        id="compare-test"
        data-testid="root"
        step={0.1}
        onValueChange={change}
        onValueCommit={commit}
      >
        <Content />
      </Compare>
    </PanelUIProvider>
  );
  await settle();
  showActionSheet.mockResolvedValueOnce({ tapIndex: 0 });
  await act(async () => {
    dispatchTaroEvent(screen.getByTestId("handle"), TARO_TEST_EVENTS.longPress);
    await Promise.resolve();
  });
  expect(change).toHaveBeenCalledExactlyOnceWith(0.6);
  expect(commit).toHaveBeenCalledExactlyOnceWith(0.6);
  expect(screen.getByTestId("handle").getAttribute("aria-valuenow")).toBe("60");
});
