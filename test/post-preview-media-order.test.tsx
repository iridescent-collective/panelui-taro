// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { PostShowcase } from "../example/src/components/PostShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it("places the image first for media posts while preserving the header-first feed composition", () => {
  render(
    <PanelUIProvider reducedMotion>
      <PostShowcase />
    </PanelUIProvider>
  );
  expect(screen.getByRole("link").firstElementChild?.textContent).toContain(
    "Learning parent"
  );
  for (let step = 0; step < 3; step += 1) {
    fireEvent.click(screen.getByRole("button", { name: "Next post variant" }));
  }
  const media = screen.getByRole("button", { name: "Learning desk" });
  expect(screen.getByRole("link").firstElementChild).toBe(media);
  expect(screen.getAllByRole("button", { name: "Learning desk" })).toHaveLength(
    1
  );
  fireEvent.click(media);
  expect(screen.getByText(/"action":"Opened image"/u)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Next post variant" }));
  expect(screen.getByRole("link").firstElementChild?.textContent).toContain(
    "Learning parent"
  );
});
