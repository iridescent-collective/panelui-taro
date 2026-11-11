// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { Swipe } from "../src/components/Swipe";
import type { SwipeHandle } from "../src/components/Swipe";
import { swipeOffset, swipeRelease } from "../src/components/Swipe/math";
import FIXTURES from "./fixtures/swipe-source.json";
import { deferred } from "./helpers/deferred";
import {
  emitTestResize,
  setElementMeasurement,
  setDeepElementMeasurement,
  setTestMeasurement,
  showActionSheet,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const measure = async () => {
  await settle();
  for (const area of document.querySelectorAll(".panel-swipe-tiles")) {
    const width = area.className.includes("panel-swipe-start") ? 160 : 80;
    const rect = { height: 64, left: 0, top: 0, width };
    setElementMeasurement(area.id, rect);
    setDeepElementMeasurement(area.id, rect);
  }
  act(() => emitTestResize());
  await settle();
};
const row = (
  name: string,
  ref: React.Ref<SwipeHandle>,
  onOpenChange?: (side: "start" | "end" | null) => void,
  onPress?: () => void
) => (
  <Swipe ref={ref} onOpenChange={onOpenChange}>
    <Swipe.Start>
      <Swipe.Action label={`${name} Pin`} color="info" onPress={onPress} />
    </Swipe.Start>
    <Swipe.End>
      <Swipe.Action
        label={`${name} Delete`}
        color="destructive"
        onPress={onPress}
      />
    </Swipe.End>
    <span>{name}</span>
  </Swipe>
);
it("preserves source overshoot, projected settle, and post-rubber full swipe threshold", () => {
  expect(swipeOffset(240, 160, 80)).toBe(170);
  expect(swipeOffset(-560, 160, 80)).toBe(-140);
  expect(swipeRelease(-140, 0, 160, 80, true).fire).toBe(true);
  expect(swipeRelease(-30, -100, 160, 80, false).side).toBe("end");
  expect(swipeOffset(50, 0, 80)).toBe(0);
});
it("measures tiles, opens via handle and closes on an actual tile press", async () => {
  setTestMeasurement(300, 375);
  const ref = createRef<SwipeHandle>();
  const open = vi.fn();
  const press = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      {row("First", ref, open, press)}
    </PanelUIProvider>
  );
  await measure();
  act(() => ref.current?.open("end"));
  expect(open).toHaveBeenLastCalledWith("end");
  expect(
    document.querySelector<HTMLElement>(".panel-swipe-row")?.dataset.taroStyle
  ).toContain("translateX(-160rpx)");
  fireEvent.click(screen.getByRole("button", { name: "First Delete" }));
  expect(press).toHaveBeenCalledOnce();
  expect(open).toHaveBeenLastCalledWith(null);
});
it("group closes siblings even through wrappers and uses the latest callback", async () => {
  const first = createRef<SwipeHandle>();
  const second = createRef<SwipeHandle>();
  const a = vi.fn();
  const b = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Swipe.Group>
        <div>{row("First", first, a)}</div>
        {row("Second", second, b)}
      </Swipe.Group>
    </PanelUIProvider>
  );
  await measure();
  act(() => first.current?.open("start"));
  act(() => second.current?.open("end"));
  expect(a).toHaveBeenLastCalledWith(null);
  expect(b).toHaveBeenLastCalledWith("end");
});
it("mirrors logical start offset in RTL", async () => {
  const ref = createRef<SwipeHandle>();
  render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">{row("RTL", ref)}</Direction>
    </PanelUIProvider>
  );
  await measure();
  act(() => ref.current?.open("start"));
  expect(
    document.querySelector<HTMLElement>(".panel-swipe-row")?.dataset.taroStyle
  ).toContain("translateX(-320rpx)");
});

const point = (x: number, y = 20) => ({
  clientX: x,
  clientY: y,
  identifier: 1,
});
const movingRow = () => {
  const node = document.querySelector<HTMLElement>(".panel-swipe-row");
  if (!node) {
    throw new Error("Missing moving row");
  }
  return node;
};
it("yields a vertical touch, settles a horizontal drag, and keeps an open origin on the next touch", async () => {
  vi.useFakeTimers();
  try {
    const ref = createRef<SwipeHandle>();
    const open = vi.fn();
    render(
      <PanelUIProvider reducedMotion>{row("Drag", ref, open)}</PanelUIProvider>
    );
    await measure();
    const node = movingRow();
    fireEvent.touchStart(node, { touches: [point(150)] });
    fireEvent.touchMove(node, { touches: [point(148, 50)] });
    fireEvent.touchEnd(node, { changedTouches: [point(148, 50)] });
    expect(open).not.toHaveBeenCalled();
    fireEvent.touchStart(node, { touches: [point(150)] });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.touchMove(node, { touches: [point(80)] });
    act(() => vi.advanceTimersByTime(150));
    fireEvent.touchEnd(node, { changedTouches: [point(80)] });
    expect(open).toHaveBeenLastCalledWith("end");
    fireEvent.touchStart(node, { touches: [point(150)] });
    fireEvent.touchMove(node, { touches: [point(170)] });
    expect(node.dataset.taroStyle).toContain("translateX(-120rpx)");
    fireEvent.touchCancel(node);
    expect(node.dataset.taroStyle).toContain("translateX(-160rpx)");
  } finally {
    vi.useRealTimers();
  }
});
it("fires the source outer action once after a full end swipe and ignores extra releases", async () => {
  vi.useFakeTimers();
  try {
    const action = vi.fn();
    const ref = createRef<SwipeHandle>();
    render(
      <PanelUIProvider reducedMotion>
        {row("Full", ref, undefined, action)}
      </PanelUIProvider>
    );
    await measure();
    const node = movingRow();
    fireEvent.touchStart(node, { touches: [point(600)] });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.touchMove(node, { touches: [point(40)] });
    fireEvent.touchEnd(node, { changedTouches: [point(40)] });
    fireEvent.touchEnd(node, { changedTouches: [point(40)] });
    expect(action).toHaveBeenCalledOnce();
    expect(node.dataset.taroStyle).toContain("translateX(0rpx)");
  } finally {
    vi.useRealTimers();
  }
});
it("keeps a tile open when asked and composes native click without bypassing close", async () => {
  const ref = createRef<SwipeHandle>();
  const press = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Swipe ref={ref}>
        <Swipe.End>
          <Swipe.Action label="Keep" keepOpen onClick={press} />
          <Swipe.Action label="Close" onClick={press} />
        </Swipe.End>
        <span>Row</span>
      </Swipe>
    </PanelUIProvider>
  );
  await measure();
  act(() => ref.current?.open("end"));
  fireEvent.click(screen.getByRole("button", { name: "Keep" }));
  expect(movingRow().dataset.taroStyle).toContain("translateX(-160rpx)");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(press).toHaveBeenCalledTimes(2);
  expect(movingRow().dataset.taroStyle).toContain("translateX(0rpx)");
});
it("imperative close cancels a held gesture so release cannot reopen it", async () => {
  const ref = createRef<SwipeHandle>();
  const open = vi.fn();
  render(
    <PanelUIProvider reducedMotion>{row("Held", ref, open)}</PanelUIProvider>
  );
  await measure();
  const node = movingRow();
  fireEvent.touchStart(node, { touches: [point(150)] });
  fireEvent.touchMove(node, { touches: [point(80)] });
  act(() => ref.current?.close());
  fireEvent.touchEnd(node, { changedTouches: [point(80)] });
  expect(node.dataset.taroStyle).toContain("translateX(0rpx)");
  expect(open).not.toHaveBeenCalled();
});

it.each(FIXTURES.frames)(
  "matches pinned source drag and release %#",
  ({ input, expected }) => {
    const dragged = swipeOffset(
      input.origin + input.translation * input.sign,
      input.start,
      input.end
    );
    const released = swipeRelease(
      dragged,
      input.velocity * input.sign,
      input.start,
      input.end,
      input.full
    );
    expect({ dragged, ...released }).toEqual(expected);
  }
);

const menuSample = (action: { onPress: () => void }) => (
  <PanelUIProvider reducedMotion>
    <Swipe id="scoped-menu">
      <Swipe.End>
        <Swipe.Action label="Delete" onPress={action.onPress} />
      </Swipe.End>
      <span>Record</span>
    </Swipe>
  </PanelUIProvider>
);
it("ignores a menu response if a same-label action was replaced for another record", async () => {
  const menu = deferred<{ errMsg: string; tapIndex: number }>();
  showActionSheet.mockReturnValueOnce(menu.promise);
  const first = vi.fn();
  const second = vi.fn();

  const view = render(menuSample({ onPress: first }));
  const root = document.querySelector("#scoped-menu");
  if (!root) {
    throw new Error("Missing menu row");
  }
  act(() => dispatchTaroEvent(root, TARO_TEST_EVENTS.longPress, {}));
  view.rerender(menuSample({ onPress: second }));
  await act(async () => {
    menu.resolve({ errMsg: "showActionSheet:ok", tapIndex: 0 });
    await menu.promise;
  });
  expect(first).not.toHaveBeenCalled();
  expect(second).not.toHaveBeenCalled();
});
