// @vitest-environment happy-dom

import { ScrollView } from "@tarojs/components";
import { act, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { ScrollBlur } from "../src/components/ScrollBlur";
import { setElementMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

it("uses source three-stop fallback with a long tail and default 80dp band", async () => {
  setElementMeasurement("blur-scroll", {
    height: 100,
    left: 0,
    top: 0,
    width: 200,
  });
  const tree = render(
    <PanelUIProvider>
      <ScrollBlur color="#123456">
        <ScrollView id="blur-scroll">Rows</ScrollView>
      </ScrollBlur>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const start = tree.container.querySelector<HTMLElement>(
    '[data-blur-edge="start"]'
  );
  const end = tree.container.querySelector<HTMLElement>(
    '[data-blur-edge="end"]'
  );
  expect(readTaroStyle(start)).toContain('"height":"160rpx"');
  expect(start?.style.backgroundImage).toContain("rgba(18, 52, 86, 0.36) 55%");
  expect(end?.style.backgroundImage).toContain("rgba(18, 52, 86, 0.36) 45%");
  act(() =>
    dispatchTaroEvent(
      tree.container.querySelector("#blur-scroll") as Element,
      TARO_TEST_EVENTS.scroll,
      { scrollHeight: 300, scrollLeft: 0, scrollTop: 12, scrollWidth: 200 }
    )
  );
  expect(start?.style.opacity).toBe("0.5");
  expect(end?.style.opacity).toBe("1");
});
it("without a native blur renderer source fallback keeps a full wash even when tint is zero", () => {
  const tree = render(
    <PanelUIProvider>
      <ScrollBlur tint={0} layers={99} intensity={100} material="dark">
        <ScrollView>Rows</ScrollView>
      </ScrollBlur>
    </PanelUIProvider>
  );
  expect(tree.container.querySelectorAll("[data-blur-edge]")).toHaveLength(2);
  expect(
    tree.container.querySelector<HTMLElement>('[data-blur-edge="start"]')?.style
      .backgroundImage
  ).toContain("rgba(255, 255, 255, 1) 0%");
  expect(tree.container.querySelectorAll('[style*="backdrop"]')).toHaveLength(
    0
  );
});
it("horizontal fallback follows native scroll axis and preserves callbacks", async () => {
  const onScroll = vi.fn();
  setElementMeasurement("blur-x", { height: 20, left: 0, top: 0, width: 100 });
  const tree = render(
    <PanelUIProvider>
      <ScrollBlur edges="end">
        <ScrollView id="blur-x" scrollX onScroll={onScroll}>
          Cards
        </ScrollView>
      </ScrollBlur>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const end = tree.container.querySelector<HTMLElement>(
    '[data-blur-edge="end"]'
  );
  expect(end?.style.backgroundImage).toContain("to right");
  act(() =>
    dispatchTaroEvent(
      tree.container.querySelector("#blur-x") as Element,
      TARO_TEST_EVENTS.scroll,
      { scrollHeight: 20, scrollLeft: 300, scrollTop: 0, scrollWidth: 400 }
    )
  );
  expect(end?.style.opacity).toBe("0");
  expect(onScroll).toHaveBeenCalledOnce();
  expect(tree.container.querySelector('[data-blur-edge="start"]')).toBeNull();
});
it("disabled and none edges remove only bands without remounting the child", () => {
  const tree = render(
    <PanelUIProvider>
      <ScrollBlur>
        <ScrollView>
          <input defaultValue="Kept" />
        </ScrollView>
      </ScrollBlur>
    </PanelUIProvider>
  );
  const input = tree.container.querySelector("input");
  tree.rerender(
    <PanelUIProvider>
      <ScrollBlur edges="none">
        <ScrollView>
          <input defaultValue="Kept" />
        </ScrollView>
      </ScrollBlur>
    </PanelUIProvider>
  );
  expect(tree.container.querySelector("input")).toBe(input);
  expect(tree.container.querySelector('[data-blur-edge="start"]')).toBeNull();
});
