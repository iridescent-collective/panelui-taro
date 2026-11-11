import { View, ScrollView } from "@tarojs/components";
// @vitest-environment happy-dom
import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { ScrollCanvas } from "../src/components/ScrollCanvas";
import { revealFraction } from "../src/hooks/use-reveal-progress";
import { createObservableNumber } from "../src/primitives/observable-number";
import {
  ScrollProgress,
  useScrollProgress,
} from "../src/primitives/scroll-progress";
import { setElementMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

it("preserves the source four effects and updates external progress without replacing frames", () => {
  const progress = createObservableNumber(0);
  const { container, rerender } = render(
    <PanelUIProvider>
      <ScrollCanvas effect="parallax" source="test.png" progress={progress} />
    </PanelUIProvider>
  );
  expect(container.querySelector("img")?.style.height).toBe("125%");
  expect(container.querySelector("img")?.style.transform).toBe(
    "translateY(10%)"
  );
  act(() => {
    progress.value = 1;
  });
  expect(container.querySelector("img")?.style.transform).toBe(
    "translateY(-10%)"
  );
  rerender(
    <PanelUIProvider>
      <ScrollCanvas effect="zoom" source="test.png" progress={progress} />
    </PanelUIProvider>
  );
  expect(container.querySelector("img")?.style.transform).toBe("scale(1)");
  rerender(
    <PanelUIProvider>
      <ScrollCanvas
        effect="sequence"
        sources={["one.png", "two.png"]}
        progress={progress}
      />
    </PanelUIProvider>
  );
  const images = container.querySelectorAll("img");
  expect(images).toHaveLength(2);
  expect(images[1]?.parentElement?.style.opacity).toBe("1");
  act(() => {
    progress.value = 0;
  });
  expect(container.querySelectorAll("img")[1]).toBe(images[1]);
  expect(images[0]?.parentElement?.style.opacity).toBe("1");
  rerender(
    <PanelUIProvider>
      <ScrollCanvas effect="reveal" source="test.png" progress={progress} />
    </PanelUIProvider>
  );
  expect(
    readTaroStyle(container.querySelector('[aria-hidden="true"]'))
  ).toContain("translateY(0%)");
});
it("scrubs across both viewport travel and the block's height", () => {
  expect(revealFraction(600, 200, 600, 1, 0.3)).toBe(0);
  expect(revealFraction(-20, 200, 600, 1, 0.3)).toBe(1);
  expect(revealFraction(290, 200, 600, 1, 0.3)).toBe(0.5);
  expect(revealFraction(0, 0, 600, 1, 0.3)).toBe(0);
});
const Reader = () => {
  const scroll = useScrollProgress();
  const [value, setValue] = useState(0);
  return (
    <View onClick={() => setValue(scroll?.offset.value ?? 0)}>
      offset:{value}
    </View>
  );
};
it("composes the native scroll handler and keeps the user's scroll element mounted", async () => {
  const listener = vi.fn();
  const { container, rerender } = render(
    <PanelUIProvider>
      <ScrollProgress>
        <ScrollView id="native-scroll" onScroll={listener}>
          <Reader />
        </ScrollView>
      </ScrollProgress>
    </PanelUIProvider>
  );
  const scroll = container.querySelector("#native-scroll");
  expect(scroll).toBeTruthy();
  if (scroll) {
    act(() =>
      dispatchTaroEvent(scroll, TARO_TEST_EVENTS.scroll, {
        scrollHeight: 1200,
        scrollTop: 120,
      })
    );
  }
  act(() => {
    screen.getByText("offset:0").click();
  });
  expect(screen.getByText("offset:120")).toBeTruthy();
  expect(listener).toHaveBeenCalledTimes(1);
  rerender(
    <PanelUIProvider>
      <ScrollProgress>
        <ScrollView id="native-scroll" onScroll={listener}>
          <Reader />
        </ScrollView>
      </ScrollProgress>
    </PanelUIProvider>
  );
  expect(container.querySelector("#native-scroll")).toBe(scroll);
  await waitFor(() => expect(scroll).toBeTruthy());
});
it("uses the actual frame position and respects a caller's element id", async () => {
  setElementMeasurement("scrub-frame", {
    height: 200,
    left: 0,
    top: 600,
    width: 300,
  });
  const { container } = render(
    <PanelUIProvider>
      <ScrollCanvas id="scrub-frame" effect="zoom" source="test.png" />
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(container.querySelector("img")?.style.transform).toBe("scale(1.12)")
  );
});
it("disabled and reduced motion show the completed frame while external drivers stay explicit", async () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <ScrollCanvas effect="sequence" sources={["one.png", "two.png"]} />
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(
      container.querySelectorAll("img")[1]?.parentElement?.style.opacity
    ).toBe("1")
  );
});
it("publishes content height before scrolling and refreshes after content grows", async () => {
  let content: ReturnType<typeof useScrollProgress>;
  const ReadContent = () => {
    content = useScrollProgress();
    return <View>content</View>;
  };
  const { container, rerender } = render(
    <PanelUIProvider>
      <ScrollProgress>
        <ScrollView>
          <ReadContent />
        </ScrollView>
      </ScrollProgress>
    </PanelUIProvider>
  );
  await waitFor(() => expect(content?.content.value).toBeGreaterThan(0));
  const body = container.querySelector('[id^="panelui-scroll-content"]');
  expect(body).toBeTruthy();
  if (body?.id) {
    setElementMeasurement(body.id, {
      height: 900,
      left: 0,
      top: 0,
      width: 300,
    });
  }
  rerender(
    <PanelUIProvider>
      <ScrollProgress>
        <ScrollView>
          <ReadContent />
          <View>new content</View>
        </ScrollView>
      </ScrollProgress>
    </PanelUIProvider>
  );
  await waitFor(() => expect(content?.content.value).toBe(900));
});
it("content measurement preserves the enclosing flex layout contract", () => {
  const { container } = render(
    <PanelUIProvider>
      <ScrollProgress>
        <ScrollView
          enableFlex
          style={{ display: "flex", flexDirection: "row", gap: "16rpx" }}
        >
          <View>first</View>
          <View>second</View>
        </ScrollView>
      </ScrollProgress>
    </PanelUIProvider>
  );
  const content = container.querySelector('[id^="panelui-scroll-content"]');
  expect(readTaroStyle(content)).toContain('"display":"flex"');
  expect(readTaroStyle(content)).toContain('"flexDirection":"inherit"');
  expect(readTaroStyle(content)).toContain('"gap":"inherit"');
});
it("keeps fixed-height flex containers available to growing content children", () => {
  const { container } = render(
    <PanelUIProvider>
      <ScrollProgress>
        <ScrollView
          enableFlex
          style={{ display: "flex", flexDirection: "column", height: "400rpx" }}
        >
          <View className="flex-1">first</View>
          <View className="flex-1">second</View>
        </ScrollView>
      </ScrollProgress>
    </PanelUIProvider>
  );
  const content = container.querySelector('[id^="panelui-scroll-content"]');
  expect(readTaroStyle(content)).toContain('"flexGrow":1');
  expect(readTaroStyle(content)).toContain('"flexShrink":0');
});
