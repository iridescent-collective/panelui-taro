// @vitest-environment happy-dom

import Glyph from "@hugeicons/core-free-icons/ArrowRight01Icon";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { createIcon, icon, IconColorProvider } from "../src/icons";
import type { IconDefaults } from "../src/icons";

const defaults: IconDefaults = {
  color: "#737373",
  fillable: true,
  flip: true,
  size: 16,
};
const svg = () =>
  decodeURIComponent(
    screen.getByTestId("custom-icon").getAttribute("src") ?? ""
  );

it("exports both factory names as the same implementation", () => {
  expect(typeof icon).toBe("function");
  expect(icon).toBe(createIcon);
});

it("custom glyphs inherit provider color and honor explicit overrides and host events", () => {
  const Custom = createIcon(Glyph, defaults);
  const onPress = vi.fn();
  const { rerender } = render(
    <IconColorProvider color="#123456">
      <Custom data-testid="custom-icon" onPress={onPress} />
    </IconColorProvider>
  );
  expect(svg()).toContain("#123456");
  fireEvent.click(screen.getByTestId("custom-icon"));
  expect(onPress).toHaveBeenCalledOnce();
  rerender(
    <IconColorProvider color="#123456">
      <Custom data-testid="custom-icon" color="#abcdef" />
    </IconColorProvider>
  );
  expect(svg()).toContain("#abcdef");
  expect(svg()).not.toContain("#123456");
});

it("custom glyphs use defaults, fill, stroke, dimensions and mirror only in RTL", () => {
  const Custom = icon(Glyph, { ...defaults, strokeWidth: 3 });
  const { rerender } = render(
    <Direction dir="rtl">
      <Custom data-testid="custom-icon" filled size={24} />
    </Direction>
  );
  expect(svg()).toContain('fill="#737373"');
  expect(svg()).toContain('stroke-width="3"');
  expect(screen.getByTestId("custom-icon").dataset.taroStyle).toContain(
    "48rpx"
  );
  expect(screen.getByTestId("custom-icon").parentElement?.style.transform).toBe(
    "scaleX(-1)"
  );
  rerender(
    <Direction dir="ltr">
      <Custom data-testid="custom-icon" strokeWidth={1.5} />
    </Direction>
  );
  expect(svg()).toContain('fill="none"');
  expect(svg()).toContain('stroke-width="1.5"');
  expect(screen.getByTestId("custom-icon").parentElement?.style.transform).toBe(
    "scaleX(1)"
  );
});
