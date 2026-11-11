// @vitest-environment happy-dom

import { act, render } from "@testing-library/react";
import { expect, it } from "vitest";

import { CompareShowcase } from "../example/src/components/CompareShowcase";
import { PanelUIProvider } from "../src/components/Provider";
import { setTestMeasurement } from "./taro-api";

it("the clipped original has an opaque backdrop underneath its translucent muted fill", async () => {
  const style = document.createElement("style");
  style.textContent = `.${CSS.escape("bg-[var(--panel-background)]")}{background-color:rgb(255,255,255)}`;
  document.head.append(style);
  try {
    setTestMeasurement(350, 375);
    const { container } = render(
      <PanelUIProvider reducedMotion>
        <CompareShowcase />
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const original = [...container.querySelectorAll("div")].find(
      (node) =>
        node.classList.contains("bg-[var(--panel-muted)]") &&
        node.textContent === "原始画面"
    );
    expect(original).toBeTruthy();
    expect(
      getComputedStyle(original?.parentElement as Element).backgroundColor
    ).toBe("rgb(255, 255, 255)");
  } finally {
    style.remove();
  }
});
