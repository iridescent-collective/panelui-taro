// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { AnimatedPressable } from "../src/primitives/animated-pressable";

it("absolute slot positioning survives press feedback and hit slop defaults", () => {
  render(
    <>
      <style>{".absolute { position: absolute; }"}</style>
      <AnimatedPressable
        accessibilityRole="button"
        className="absolute"
        hitSlop={8}
      >
        关闭
      </AnimatedPressable>
    </>
  );
  const button = screen.getByRole("button");
  expect(window.getComputedStyle(button).position).toBe("absolute");
  expect(button.className).not.toContain("relative");
});
it("keeps native ARIA attributes when source accessibility aliases are absent", () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <AnimatedPressable
        role="combobox"
        aria-label="Native label"
        aria-expanded
        aria-selected
      >
        native
      </AnimatedPressable>
    </PanelUIProvider>
  );
  const target = container.querySelector('[aria-label="Native label"]');
  expect(target).toBeTruthy();
  expect(target?.getAttribute("role")).toBe("combobox");
  expect(target?.getAttribute("aria-expanded")).toBe("true");
  expect(target?.getAttribute("aria-selected")).toBe("true");
});

it("unstyled pressable keeps the business layout and feedback styles untouched", () => {
  const onClick = vi.fn();
  const { rerender } = render(
    <AnimatedPressable
      unstyled
      accessibilityRole="button"
      className="business-row"
      style={{ opacity: 0.7 }}
      onClick={onClick}
    >
      打开
    </AnimatedPressable>
  );
  const button = screen.getByRole("button");
  fireEvent.touchStart(button);
  expect(button.className).toBe("business-row");
  expect(button.style.transform).toBe("");
  expect(button.style.transition).toBe("");
  expect(button.style.opacity).toBe("0.7");
  fireEvent.touchEnd(button);
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
  rerender(
    <AnimatedPressable
      unstyled
      accessibilityRole="button"
      disabled
      onClick={onClick}
    >
      打开
    </AnimatedPressable>
  );
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});
