// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { expect, it } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { ModalPortal, Portal } from "../src/primitives/portal";

it.each(["button", "input", "view", "picker", "slider"])(
  "modal isolation disables a background %s even when it explicitly enables pointer events",
  (tag) => {
    const style = document.createElement("style");
    style.textContent = readFileSync(
      path.resolve(import.meta.dirname, "../src/styles/portal.scss"),
      "utf-8"
    );
    document.head.append(style);
    try {
      const sample = (interactive: boolean) => (
        <PanelUIProvider>
          {createElement(tag, {
            "data-testid": "background",
            style: { pointerEvents: "auto" },
          })}
          <ModalPortal interactive={interactive}>
            <button
              data-testid="modal-action"
              style={{ pointerEvents: "auto" }}
            >
              Close
            </button>
          </ModalPortal>
        </PanelUIProvider>
      );
      const view = render(sample(true));
      const background = screen.getByTestId("background");
      expect(getComputedStyle(background).pointerEvents).toBe("none");
      expect(
        getComputedStyle(screen.getByTestId("modal-action")).pointerEvents
      ).toBe("auto");
      view.rerender(sample(false));
      expect(screen.getByTestId("background")).toBe(background);
      expect(getComputedStyle(background).pointerEvents).toBe("auto");
      expect(
        getComputedStyle(screen.getByTestId("modal-action")).pointerEvents
      ).toBe("none");
    } finally {
      style.remove();
    }
  }
);

it("a nonmodal portal leaves the underlying page interactive", () => {
  render(
    <PanelUIProvider>
      <button data-testid="plain-page" style={{ pointerEvents: "auto" }}>
        Page
      </button>
      <Portal>
        <span>Tooltip</span>
      </Portal>
    </PanelUIProvider>
  );
  expect(getComputedStyle(screen.getByTestId("plain-page")).pointerEvents).toBe(
    "auto"
  );
});

it("keeps the page disabled until the last nested modal releases isolation", () => {
  const style = document.createElement("style");
  style.textContent = readFileSync(
    path.resolve(import.meta.dirname, "../src/styles/portal.scss"),
    "utf-8"
  );
  document.head.append(style);
  try {
    const sample = (parent: boolean, child: boolean) => (
      <PanelUIProvider>
        <button data-testid="nested-page" style={{ pointerEvents: "auto" }}>
          Page
        </button>
        <ModalPortal interactive={parent}>
          <ModalPortal interactive={child}>
            <button data-testid="nested-top" style={{ pointerEvents: "auto" }}>
              Top modal
            </button>
          </ModalPortal>
        </ModalPortal>
      </PanelUIProvider>
    );
    const view = render(sample(true, true));
    view.rerender(sample(false, true));
    expect(
      getComputedStyle(screen.getByTestId("nested-page")).pointerEvents
    ).toBe("none");
    expect(
      getComputedStyle(screen.getByTestId("nested-top")).pointerEvents
    ).toBe("auto");
    view.rerender(sample(false, false));
    expect(
      getComputedStyle(screen.getByTestId("nested-page")).pointerEvents
    ).toBe("auto");
  } finally {
    style.remove();
  }
});

it("keeps native host selectors after Taro's production HTML-tag transform", async () => {
  const exampleRequire = createRequire(
    path.resolve(import.meta.dirname, "../example/package.json")
  );
  const runnerRequire = createRequire(
    exampleRequire.resolve("@tarojs/vite-runner")
  );
  const postcss = runnerRequire("postcss");
  const htmlTransform = runnerRequire("postcss-html-transform").default;
  const source = readFileSync(
    path.resolve(import.meta.dirname, "../src/styles/portal.scss"),
    "utf-8"
  );
  const output = await postcss([htmlTransform({ platform: "weapp" })]).process(
    source,
    { from: undefined }
  );
  expect(output.css).not.toContain(".h5-");
  for (const tag of ["button", "input", "textarea", "canvas", "video", "map"]) {
    expect(output.css).toContain(`:is(${tag})`);
  }
});
