// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { SketchShowcase } from "../example/src/components/SketchShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it("the bounded preview gives the flex canvas a column parent", () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    render(
      <PanelUIProvider reducedMotion>
        <SketchShowcase />
      </PanelUIProvider>
    );
    const canvas = screen.getByLabelText("Drawing canvas, empty");
    const frame = canvas.parentElement?.parentElement?.parentElement;
    expect(frame?.className).toContain("h-[1120px]");
    expect(getComputedStyle(frame as Element).display).toBe("flex");
    expect(getComputedStyle(frame as Element).flexDirection).toBe("column");
  } finally {
    style.remove();
  }
});
