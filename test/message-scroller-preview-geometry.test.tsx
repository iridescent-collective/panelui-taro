// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { MessageScrollerShowcase } from "../example/src/components/MessageScrollerShowcase";
import { MessageScroller } from "../src/components/MessageScroller";
import { PanelUIProvider } from "../src/components/Provider";
import {
  emitTestResize,
  setElementComputedStyle,
  setElementMeasurement,
  setTestMeasurement,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const SCALE = 390 / 375;
const ROW_PIXELS = 74;
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const style = (node: Element) => JSON.parse(readTaroStyle(node) ?? "{}");
const pixels = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string") {
    return 0;
  }
  if (value.endsWith("rpx")) {
    return Math.floor((Number(value.slice(0, -3)) * SCALE) / 2);
  }
  return Number(value.replace(/px$/u, ""));
};

it("keeps the real quantized 390px virtual demo row at the requested 24-point peek", async () => {
  setTestMeasurement(356, 390);
  render(
    <PanelUIProvider reducedMotion>
      <MessageScrollerShowcase />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Virtual transcript" }));
  const viewport = document.querySelector("#panel-messages-demo");
  const content = document.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!viewport || !content) {
    throw new Error("Missing virtual preview viewport/content");
  }
  setElementMeasurement("panel-messages-demo", {
    height: 353.015625,
    left: 17,
    top: 81.171875,
    width: 356,
  });
  setElementMeasurement(content.id, {
    height: 2648,
    left: 17,
    top: 81.171875,
    width: 356,
  });
  setElementComputedStyle(content.id, {
    paddingBottom: "64px",
    paddingTop: "16px",
  });
  const measureWindow = async (fraction: number) => {
    for (const row of content.querySelectorAll<HTMLElement>(
      '[id^="panelui-measure"]'
    )) {
      setElementMeasurement(row.id, {
        height: ROW_PIXELS,
        left: 33,
        top: 100,
        width: 324,
      });
    }
    act(() => emitTestResize());
    await flush();
    await flush();
    const target = Number(viewport.getAttribute("scrollTop"));
    act(() =>
      dispatchTaroEvent(viewport, TARO_TEST_EVENTS.scroll, {
        scrollHeight: 2648,
        scrollLeft: 0,
        scrollTop: target * fraction,
        scrollWidth: 356,
      })
    );
    await flush();
  };
  await measureWindow(0.25);
  await measureWindow(0.5);
  await measureWindow(0.75);
  await measureWindow(1);
  const target = Number(viewport.getAttribute("scrollTop"));
  let nativeY = 16;
  let found = false;
  for (const child of content.children) {
    const label = child.textContent ?? "";
    if (label.startsWith("message-25")) {
      found = true;
      break;
    }
    nativeY += /^message-\d+/u.test(label)
      ? ROW_PIXELS + pixels(style(child).marginBottom)
      : pixels(style(child).height);
  }
  expect(found).toBe(true);
  expect(
    Math.abs(nativeY - target - 24 * SCALE),
    JSON.stringify({
      first: content.children[1]?.textContent,
      nativeY,
      spacer: style(content.children[0]),
      target,
    })
  ).toBeLessThanOrEqual(1);
});

it.each([0, 5500, 11_000])(
  "keeps rendered virtual content extent equal to its ledger at offset %s",
  async (offset) => {
    setTestMeasurement(300, 375);
    const data = Array.from({ length: 100 }, (_, index) => ({
      messageId: String(index),
    }));
    render(
      <MessageScroller defaultScrollPosition="start">
        <MessageScroller.List
          id="extent-chat"
          contentContainerClassName="p-0"
          data={data}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={1}
          getItemLayout={(_, index) => ({
            index,
            length: 100,
            offset: index * 112,
          })}
          renderItem={({ item }) => (
            <span>{`extent-row-${item.messageId}`}</span>
          )}
        />
      </MessageScroller>
    );
    const viewport = document.querySelector("#extent-chat");
    const content = document.querySelector<HTMLElement>(
      '[id^="panel-messages-content"]'
    );
    if (!viewport || !content) {
      throw new Error("Missing virtual extent fixture");
    }
    setElementMeasurement("extent-chat", {
      height: 200,
      left: 0,
      top: 0,
      width: 300,
    });
    setElementComputedStyle(content.id, {
      paddingBottom: "0px",
      paddingTop: "0px",
    });
    act(() => emitTestResize());
    await flush();
    act(() =>
      dispatchTaroEvent(viewport, TARO_TEST_EVENTS.scroll, {
        scrollHeight: 11_188,
        scrollLeft: 0,
        scrollTop: offset,
        scrollWidth: 300,
      })
    );
    await flush();
    let extent = 0;
    for (const child of content.children) {
      const row = (child.textContent ?? "").startsWith("extent-row-");
      const rawStyle = style(child);
      extent += row
        ? 100 + Number(String(rawStyle.marginBottom).replace(/px$/u, ""))
        : Number(String(rawStyle.height).replace(/px$/u, ""));
    }
    expect(extent).toBe(11_188);
  }
);
