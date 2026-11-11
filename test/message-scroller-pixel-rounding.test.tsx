// @vitest-environment happy-dom

import { act, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { expect, it } from "vitest";

import {
  MessageScroller,
  useMessageScrollerVisibility,
} from "../src/components/MessageScroller";
import { useScroller } from "../src/components/MessageScroller/context";
import {
  ANCHOR_PEEK,
  anchorAtOffset,
} from "../src/components/MessageScroller/math";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementMeasurement, setTestMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const SCALE = 390 / 375;
const ROW_Y = 2083.2;
const NATIVE_TARGET = Math.floor((ROW_Y - ANCHOR_PEEK) * SCALE);
const rows = new Map([
  ["message-20", { anchor: true, height: 72, y: 1663.2 }],
  ["message-25", { anchor: true, height: 72, y: ROW_Y }],
]);
const RegisteredRows = () => {
  const { registerItem } = useScroller("pixel-rounding-test");
  const visible = useMessageScrollerVisibility();
  useEffect(() => {
    for (const [id, row] of rows) {
      registerItem(id, row);
    }
  }, [registerItem]);
  return <span data-testid="anchor">{visible.currentAnchorId ?? "none"}</span>;
};

it("reproduces the 1.04 native floor boundary and limits compensation to one pixel", () => {
  expect(NATIVE_TARGET).toBe(2141);
  expect(anchorAtOffset(rows, NATIVE_TARGET / SCALE)).toBe("message-20");
  expect(anchorAtOffset(rows, NATIVE_TARGET / SCALE, 1 / SCALE)).toBe(
    "message-25"
  );
  expect(anchorAtOffset(rows, (NATIVE_TARGET - 1) / SCALE, 1 / SCALE)).toBe(
    "message-20"
  );
  expect(anchorAtOffset(rows, (NATIVE_TARGET - 2) / SCALE, 1 / SCALE)).toBe(
    "message-20"
  );
});

it.each([
  [NATIVE_TARGET, "message-25"],
  [NATIVE_TARGET - 1, "message-20"],
  [NATIVE_TARGET - 2, "message-20"],
] as const)(
  "keeps native scroll/settle callbacks bounded at offset %s",
  async (nativeOffset, expected) => {
    setTestMeasurement(356, 390);
    setElementMeasurement("pixel-chat", {
      height: 353.015625,
      left: 17,
      top: 305.171875,
      width: 356,
    });
    render(
      <PanelUIProvider reducedMotion>
        <MessageScroller defaultScrollPosition="start">
          <RegisteredRows />
          <MessageScroller.Viewport id="pixel-chat">
            <MessageScroller.Content>Transcript</MessageScroller.Content>
          </MessageScroller.Viewport>
        </MessageScroller>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const content = document.querySelector<HTMLElement>(
      '[id^="panel-messages-content"]'
    );
    expect(content).not.toBeNull();
    if (!content) {
      throw new Error("Missing transcript content");
    }
    setElementMeasurement(content.id, {
      height: 2650,
      left: 17,
      top: 305.171875,
      width: 356,
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const viewport = document.querySelector("#pixel-chat");
    if (!viewport) {
      throw new Error("Missing transcript viewport");
    }
    act(() => {
      dispatchTaroEvent(viewport, TARO_TEST_EVENTS.scroll, {
        scrollHeight: 2650,
        scrollLeft: 0,
        scrollTop: nativeOffset,
        scrollWidth: 356,
      });
      dispatchTaroEvent(viewport, TARO_TEST_EVENTS.scrollEnd, {});
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByTestId("anchor").textContent).toBe(expected);
  }
);
