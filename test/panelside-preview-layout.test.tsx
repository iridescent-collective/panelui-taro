// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { PanelsideShowcase } from "../example/src/components/PanelsideShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it("preserves the bounded panel height across the Direction wrapper", () => {
  const style = document.createElement("style");
  style.textContent = ".h-full{height:100%}";
  document.head.append(style);
  try {
    const { container } = render(
      <PanelUIProvider reducedMotion>
        <PanelsideShowcase />
      </PanelUIProvider>
    );
    const frame = [...container.querySelectorAll("div")].find((node) =>
      node.classList.contains("h-[1040px]")
    );
    expect(frame).toBeTruthy();
    expect(getComputedStyle(frame?.firstElementChild as Element).height).toBe(
      "100%"
    );
  } finally {
    style.remove();
  }
});

it("stacks showcase page content vertically while retaining visited page state", () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    render(
      <PanelUIProvider reducedMotion>
        <PanelsideShowcase />
      </PanelUIProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Page count 0" }));
    const readingPage = screen.getByText("Reading page").parentElement;
    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation panel" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Activities" }));
    const title = screen.getByText("Activities page");
    const description = screen.getByText("Swipe the scene to open navigation.");
    const activitiesPage = title.parentElement;
    expect(description.parentElement).toBe(activitiesPage);
    expect(getComputedStyle(activitiesPage as Element).display).toBe("flex");
    expect(getComputedStyle(activitiesPage as Element).flexDirection).toBe(
      "column"
    );
    expect(
      getComputedStyle(activitiesPage?.parentElement as Element).display
    ).toBe("flex");
    expect(
      getComputedStyle(activitiesPage?.parentElement as Element).flexDirection
    ).toBe("column");
    expect(readingPage?.getAttribute("aria-hidden")).toBe("true");
    expect(readingPage?.style.display).toBe("none");
    fireEvent.click(
      screen.getByRole("button", { name: "Open navigation panel" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Reading" }));
    expect(screen.getByText("Reading page").parentElement).toBe(readingPage);
    expect(readingPage?.getAttribute("aria-hidden")).toBe("false");
    expect(screen.getByRole("button", { name: "Page count 1" })).toBeTruthy();
    expect(activitiesPage?.getAttribute("aria-hidden")).toBe("true");
    expect(activitiesPage?.style.display).toBe("none");
  } finally {
    style.remove();
  }
});
