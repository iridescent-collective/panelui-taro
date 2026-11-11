// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { AIInputShowcase } from "../example/src/components/AIInputShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it("keeps discard and confirm available when recording starts in the inline demo", () => {
  render(
    <PanelUIProvider reducedMotion>
      <AIInputShowcase />
    </PanelUIProvider>
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Toggle inline composer" })
  );
  fireEvent.click(screen.getByRole("button", { name: "Record" }));
  expect(
    screen.queryByRole("button", { name: "Discard recording" })
  ).not.toBeNull();
  expect(screen.queryByRole("button", { name: "Record" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Discard recording" }));
  expect(screen.getByRole("button", { name: "Record" })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Record" }));
  fireEvent.click(screen.getByRole("button", { name: "Use recording" }));
  expect(screen.getByPlaceholderText("Ask anything")).toHaveProperty(
    "value",
    "Recorded prompt"
  );
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.getByRole("button", { name: "Stop" })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Stop" }));
  expect(screen.getByRole("button", { name: "Send" })).toBeDefined();
});
it("preserves an active recording when switching between stacked and inline layouts", () => {
  render(
    <PanelUIProvider reducedMotion>
      <AIInputShowcase />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Record" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Toggle inline composer" })
  );
  expect(
    screen.queryByRole("button", { name: "Use recording" })
  ).not.toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Toggle inline composer" })
  );
  expect(screen.getAllByRole("button", { name: "Use recording" })).toHaveLength(
    1
  );
  fireEvent.click(screen.getByRole("button", { name: "Discard recording" }));
  expect(screen.getByRole("button", { name: "Record" })).toBeDefined();
});
it("keeps only the official three controls in the inline row and model selection available separately", () => {
  render(
    <PanelUIProvider reducedMotion>
      <AIInputShowcase />
    </PanelUIProvider>
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Toggle inline composer" })
  );
  const field = screen.getByPlaceholderText("Ask anything");
  const row = field.parentElement;
  expect(row).not.toBeNull();
  expect(row?.querySelectorAll('[role="button"]')).toHaveLength(3);
  expect(row?.contains(screen.getByText("Model A"))).toBe(false);
  expect(
    row?.firstElementChild?.contains(
      screen.getByRole("button", { name: "Add" })
    )
  ).toBe(true);
  fireEvent.click(screen.getByText("Model A"));
  expect(screen.getByText("Options")).toBeDefined();
});
