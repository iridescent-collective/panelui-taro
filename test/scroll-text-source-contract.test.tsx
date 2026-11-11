// @vitest-environment happy-dom

import { act, render } from "@testing-library/react";
import { expect, it } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { ScrollText, splitScrollText } from "../src/components/ScrollText";
import { parseColor, formatColor } from "../src/lib/color";
import { interpolatePanelColor } from "../src/lib/interpolate-color";
import { createObservableNumber } from "../src/primitives/observable-number";
import { readTaroStyle } from "./taro-style";

it("keeps source token boundaries, punctuation and Unicode character splitting", () => {
  expect(splitScrollText("  Hello,  world! ", "word")).toEqual([
    "Hello,",
    "world!",
  ]);
  expect(splitScrollText("中😀文", "character")).toEqual(["中", "😀", "文"]);
  expect(splitScrollText("  ", "word")).toEqual([]);
});
it("scrubs color forwards and backwards with the source reveal windows", () => {
  const progress = createObservableNumber(0);
  const { container } = render(
    <PanelUIProvider>
      <ScrollText progress={progress} from="#000" to="#fff">
        one two
      </ScrollText>
    </PanelUIProvider>
  );
  const tokens = container.querySelectorAll<HTMLElement>("span > span");
  expect(tokens).toHaveLength(2);
  expect(readTaroStyle(tokens[0])).toContain('"color":"#000"');
  act(() => {
    progress.value = 0.5;
  });
  expect(readTaroStyle(tokens[0])).toContain('"color":"#fff"');
  expect(readTaroStyle(tokens[1])).toContain('"color":"#000"');
  act(() => {
    progress.value = 1;
  });
  expect(readTaroStyle(tokens[1])).toContain('"color":"#fff"');
  act(() => {
    progress.value = 0;
  });
  expect(readTaroStyle(tokens[0])).toContain('"color":"#000"');
});
it("fade keeps the minimum opacity and highlight fills within the glyph flow", () => {
  const progress = createObservableNumber(0);
  const { container, rerender } = render(
    <PanelUIProvider>
      <ScrollText effect="fade" progress={progress}>
        first last
      </ScrollText>
    </PanelUIProvider>
  );
  expect(
    container.querySelector<HTMLElement>("span > span")?.style.opacity
  ).toBe("0.18");
  rerender(
    <PanelUIProvider>
      <ScrollText effect="highlight" progress={progress}>
        first last
      </ScrollText>
    </PanelUIProvider>
  );
  expect(
    container.querySelector<HTMLElement>("span > span")?.style.backgroundColor
  ).toBe("transparent");
  act(() => {
    progress.value = 1;
  });
  expect(
    container.querySelector<HTMLElement>("span > span")?.style.backgroundColor
  ).not.toBe("transparent");
});
it("rise has 18dp travel, 6dp spacing and preserves caller text styles", () => {
  const progress = createObservableNumber(0);
  const { container } = render(
    <PanelUIProvider>
      <ScrollText
        effect="rise"
        progress={progress}
        size="3xl"
        weight="semibold"
        className="caller-style"
      >
        first last
      </ScrollText>
    </PanelUIProvider>
  );
  const token = container.querySelector<HTMLElement>(
    'div[style*="translateY"]'
  );
  expect(readTaroStyle(token)).toContain('"transform":"translateY(36rpx)"');
  expect(
    container.querySelector<HTMLElement>("span.caller-style")
  ).toBeTruthy();
  act(() => {
    progress.value = 1;
  });
  expect(readTaroStyle(token)).toContain('"transform":"translateY(0rpx)"');
});
it("color arithmetic keeps supported upstream formats and gamma-correct RGB mixing", () => {
  const color = parseColor("hsla(180, 100%, 50%, .5)");
  expect(color).toEqual({ a: 0.5, h: 180, s: 1, v: 1 });
  if (color) {
    expect(formatColor(color, "hex")).toBe("#00ffff80");
  }
  expect(parseColor("#f008")?.a).toBeCloseTo(136 / 255);
  expect(parseColor("rgb(100% 0% 0% / 50%)")).toEqual({
    a: 0.5,
    h: 0,
    s: 1,
    v: 1,
  });
  expect(parseColor("invalid")).toBeNull();
  expect(interpolatePanelColor("#000", "#fff", 0.5)).toBe(
    "rgba(186, 186, 186, 1)"
  );
});
