// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { entry } from "../example/src/official/stack-card";
import { PanelUIProvider } from "../src/components/Provider";
import { readTaroStyle } from "./taro-style";

it.each(entry.demos.slice(0, 5))(
  "$label preserves the Native 560-point deck height cap",
  ({ render: Demo }) => {
    const view = render(
      <PanelUIProvider reducedMotion>
        <Demo />
      </PanelUIProvider>
    );
    const styles = [
      ...view.container.querySelectorAll("[data-taro-style]"),
    ].map((node) => JSON.parse(readTaroStyle(node) ?? "{}"));
    expect(styles.some((style) => style.maxHeight === "1120rpx")).toBe(true);
  }
);

it("hiring cards retain Native View's column layout so space-between places the note and tags", () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    const Demo = entry.demos[0].render;
    render(
      <PanelUIProvider reducedMotion>
        <Demo />
      </PanelUIProvider>
    );
    const card = screen.getByText("Amara Okafor").closest(".h-full")!;
    expect(getComputedStyle(card).display).toBe("flex");
    expect(getComputedStyle(card).flexDirection).toBe("column");
  } finally {
    style.remove();
  }
});
