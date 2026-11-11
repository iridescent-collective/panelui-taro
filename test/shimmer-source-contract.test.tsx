// @vitest-environment happy-dom

import { render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { Shimmer } from "../src/components/Shimmer";
import { withShimmerAlpha } from "../src/components/Shimmer/colors";
import { readTaroStyle } from "./taro-style";

it("uses source sweep width, default duration and a glyph-only text background", async () => {
  render(
    <PanelUIProvider>
      <Shimmer>Thinking</Shimmer>
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByText("Thinking"))).toContain(
      "backgroundClip"
    )
  );
  const style = readTaroStyle(screen.getByText("Thinking"));
  expect(style).toContain('"backgroundSize":"160rpx 100%"');
  expect(style).toContain("2000ms linear infinite normal forwards");
  expect(style).toContain('"--panel-shimmer-from":"-160rpx"');
  expect(style).toContain('"--panel-shimmer-to":"80rpx"');
});
it("direction and reverse compose without changing the source once/ping-pong contract", async () => {
  const { rerender } = render(
    <PanelUIProvider>
      <Direction dir="rtl">
        <Shimmer once mode="ping-pong" duration={500}>
          RTL
        </Shimmer>
      </Direction>
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByText("RTL"))).toContain(
      '"--panel-shimmer-from":"80rpx"'
    )
  );
  expect(readTaroStyle(screen.getByText("RTL"))).toContain(
    "500ms linear 1 alternate forwards"
  );
  rerender(
    <PanelUIProvider>
      <Direction dir="rtl">
        <Shimmer reverse>RTL</Shimmer>
      </Direction>
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByText("RTL"))).toContain(
      '"--panel-shimmer-from":"-160rpx"'
    )
  );
});
it("disabled and reduced motion keep ordinary readable text with the caller's styles", () => {
  const { rerender } = render(
    <PanelUIProvider>
      <Shimmer
        enabled={false}
        baseColor="#123456"
        textClassName="custom"
        textStyle={{ fontWeight: 700 }}
      >
        Static
      </Shimmer>
    </PanelUIProvider>
  );
  expect(readTaroStyle(screen.getByText("Static"))).toContain(
    '"color":"#123456"'
  );
  expect(readTaroStyle(screen.getByText("Static"))).not.toContain("animation");
  expect(screen.getByText("Static").className).toContain("custom");
  rerender(
    <PanelUIProvider reducedMotion>
      <Shimmer>Static</Shimmer>
    </PanelUIProvider>
  );
  expect(readTaroStyle(screen.getByText("Static"))).not.toContain("animation");
});
it("deprecated intensity overrides the highlight alpha and remains bounded", () => {
  expect(withShimmerAlpha("#fff", 2)).toBe("rgba(255, 255, 255, 1)");
  expect(withShimmerAlpha("rgb(10, 20, 30)", -1)).toBe("rgba(10, 20, 30, 0)");
  expect(withShimmerAlpha("#f00", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
});
it("view adaptation preserves its children and uses an explicit image alpha mask when available", async () => {
  const { container } = render(
    <PanelUIProvider>
      <Shimmer as="view" maskSource="mask.png">
        <button>Existing action</button>
      </Shimmer>
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  );
  const overlay = container.querySelector('[aria-hidden="true"]');
  expect(readTaroStyle(overlay)).toContain('"maskImage":"url(\\"mask.png\\")"');
  expect(readTaroStyle(overlay)).toContain('"opacity":1');
  expect(screen.getByRole("button").textContent).toBe("Existing action");
});
