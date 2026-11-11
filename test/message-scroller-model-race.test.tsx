// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  MessageScroller,
  useMessageScroller,
} from "../src/components/MessageScroller";
import { MessageScrollerViewport } from "../src/components/MessageScroller/viewport";
import { setTestMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const ticks = vi.hoisted(() => [] as (() => void)[]);
vi.mock("@tarojs/taro", async (original) => ({
  ...(await original<object>()),
  nextTick: (tick: () => void) => ticks.push(tick),
}));
const drain = async (step = 0): Promise<void> => {
  if (step >= 40 || ticks.length === 0) {
    return;
  }
  const batch = ticks.splice(0);
  await act(async () => {
    for (const tick of batch) {
      tick();
    }
    await Promise.resolve();
  });
  await drain(step + 1);
};
const model = (position: number, height: number) => ({
  anchor: () => "message-25",
  height,
  lastAnchor: () => "message-25",
  position: () => position,
});
const Commands = () => {
  const controls = useMessageScroller();
  return <button onClick={() => controls.scrollToStart(false)}>Start</button>;
};
const tree = (value: ReturnType<typeof model>) => (
  <MessageScroller defaultScrollPosition="last-anchor">
    <MessageScrollerViewport id="race-chat" model={value}>
      <span>Rows</span>
    </MessageScrollerViewport>
    <Commands />
  </MessageScroller>
);

it("rejects an older queued model measurement before it supersedes the latest message target", async () => {
  setTestMeasurement(356, 390);
  const mounted = render(tree(model(2103.8461538461524, 2573.4615384615367)));
  await drain();
  mounted.rerender(tree(model(2102.9999999999986, 2572.615384615383)));
  mounted.rerender(tree(model(2097.9230769230758, 2563.307692307691)));
  await drain();
  const requested = Number(
    document.querySelector("#race-chat")?.getAttribute("scrollTop")
  );
  expect(requested).toBeCloseTo((2097.9230769230758 - 24) * 1.04, 6);
});

it.each(["none", "touch", "drag", "start"])(
  "keeps an arrived message intent through late row measurement unless a real touch cancels it (%s)",
  async (cancel) => {
    setTestMeasurement(356, 390);
    const first = model(2102.9999999999986, 2572.615384615383);
    const mounted = render(tree(first));
    await drain();
    const viewport = document.querySelector("#race-chat");
    if (!viewport) {
      throw new Error("Missing viewport");
    }
    const arrived = Math.floor((2102.9999999999986 - 24) * 1.04);
    act(() =>
      dispatchTaroEvent(viewport, TARO_TEST_EVENTS.scroll, {
        scrollHeight: 2666,
        scrollLeft: 0,
        scrollTop: arrived,
        scrollWidth: 356,
      })
    );
    await drain();
    if (cancel === "touch") {
      fireEvent.touchStart(viewport);
    }
    if (cancel === "drag") {
      fireEvent.dragStart(viewport);
    }
    if (cancel === "start") {
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
    }
    mounted.rerender(tree(model(2097.9230769230758, 2563.307692307691)));
    await drain();
    const requested = Number(viewport.getAttribute("scrollTop"));
    expect(requested).toBeCloseTo(
      cancel === "start"
        ? 0
        : ((cancel === "none" ? 2097.9230769230758 : 2102.9999999999986) - 24) *
            1.04,
      6
    );
  }
);
