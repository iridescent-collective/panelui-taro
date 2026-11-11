// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { StackCardShowcase } from "../example/src/components/StackCardShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it("the undo action has a visible glyph as well as its accessible name", () => {
  render(
    <PanelUIProvider reducedMotion>
      <StackCardShowcase />
    </PanelUIProvider>
  );
  const undo = screen.getByRole("button", { name: "Undo" });
  expect(undo.querySelector("img")).not.toBeNull();
});
