// @vitest-environment happy-dom

import { ScrollView } from "@tarojs/components";
import { act, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { ScrollFade } from "../src/components/ScrollFade";
import { emitTestResize, setElementMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const edge = (container: HTMLElement, name: string) =>
  container.querySelector<HTMLElement>(`[data-fade-edge="${name}"]`);
it("end fade appears from measured content before the first scroll and start remains clear", async () => {
  setElementMeasurement("fade-scroll", {
    height: 100,
    left: 0,
    top: 0,
    width: 200,
  });
  const tree = render(
    <PanelUIProvider>
      <ScrollFade>
        <ScrollView id="fade-scroll" scrollY>
          Rows
        </ScrollView>
      </ScrollFade>
    </PanelUIProvider>
  );
  const content = tree.container.querySelector<HTMLElement>(
    '[id^="panelui-scroll-content-"]'
  );
  if (!content) {
    throw new Error("Expected measured native scroll content");
  }
  setElementMeasurement(content.id, {
    height: 400,
    left: 0,
    top: 0,
    width: 200,
  });
  await act(async () => {
    emitTestResize();
    await Promise.resolve();
  });
  expect(edge(tree.container, "start")?.style.opacity).toBe("0");
  expect(edge(tree.container, "end")?.style.opacity).toBe("1");
});
it("scroll updates compose the consumer handler and reverse fades at the end", async () => {
  const onScroll = vi.fn();
  setElementMeasurement("fade-scroll", {
    height: 100,
    left: 0,
    top: 0,
    width: 200,
  });
  const tree = render(
    <PanelUIProvider>
      <ScrollFade>
        <ScrollView id="fade-scroll" onScroll={onScroll}>
          Rows
        </ScrollView>
      </ScrollFade>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  act(() =>
    dispatchTaroEvent(
      tree.container.querySelector("#fade-scroll") as Element,
      TARO_TEST_EVENTS.scroll,
      { scrollHeight: 300, scrollLeft: 0, scrollTop: 12, scrollWidth: 200 }
    )
  );
  expect(edge(tree.container, "start")?.style.opacity).toBe("0.5");
  expect(onScroll).toHaveBeenCalledOnce();
  act(() =>
    dispatchTaroEvent(
      tree.container.querySelector("#fade-scroll") as Element,
      TARO_TEST_EVENTS.scroll,
      { scrollHeight: 300, scrollLeft: 0, scrollTop: 200, scrollWidth: 200 }
    )
  );
  expect(edge(tree.container, "end")?.style.opacity).toBe("0");
  expect(edge(tree.container, "start")?.style.opacity).toBe("1");
});
it("horizontal axis is inferred from native scrollX and explicit orientation wins", async () => {
  setElementMeasurement("fade-x", { height: 30, left: 0, top: 0, width: 100 });
  const tree = render(
    <PanelUIProvider>
      <ScrollFade color="#123456" size={20}>
        <ScrollView id="fade-x" scrollX>
          Cards
        </ScrollView>
      </ScrollFade>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  act(() =>
    dispatchTaroEvent(
      tree.container.querySelector("#fade-x") as Element,
      TARO_TEST_EVENTS.scroll,
      { scrollHeight: 30, scrollLeft: 12, scrollTop: 0, scrollWidth: 400 }
    )
  );
  expect(readTaroStyle(edge(tree.container, "start"))).toContain(
    '"width":"40rpx"'
  );
  expect(edge(tree.container, "start")?.style.opacity).toBe("0.5");
  expect(edge(tree.container, "start")?.style.backgroundImage).toContain(
    "to right"
  );
  expect(edge(tree.container, "start")?.style.backgroundImage).toContain(
    "rgba(18, 52, 86, 0)"
  );
  tree.rerender(
    <PanelUIProvider>
      <ScrollFade orientation="vertical">
        <ScrollView id="fade-x" scrollX>
          Cards
        </ScrollView>
      </ScrollFade>
    </PanelUIProvider>
  );
  expect(readTaroStyle(edge(tree.container, "start"))).toContain(
    '"height":"96rpx"'
  );
});
it("disabled and edge filtering retain the same scrollable and its state", () => {
  const tree = render(
    <PanelUIProvider>
      <ScrollFade edges="end">
        <ScrollView>
          <input defaultValue="Retained" />
        </ScrollView>
      </ScrollFade>
    </PanelUIProvider>
  );
  const input = screen.getByDisplayValue("Retained");
  expect(edge(tree.container, "start")).toBeNull();
  expect(edge(tree.container, "end")).toBeTruthy();
  tree.rerender(
    <PanelUIProvider>
      <ScrollFade enabled={false}>
        <ScrollView>
          <input defaultValue="Retained" />
        </ScrollView>
      </ScrollFade>
    </PanelUIProvider>
  );
  expect(screen.getByDisplayValue("Retained")).toBe(input);
  expect(edge(tree.container, "end")).toBeNull();
});
