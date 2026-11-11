// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import path from "node:path";

import { render, screen } from "@testing-library/react";
import { createContext, createElement, useContext } from "react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import {
  captureFocusRestore,
  FocusRestorationStore,
} from "../src/primitives/focus-restoration-store";
import { ModalIsolationStore } from "../src/primitives/modal-isolation-store";
import { ModalPortal, Portal } from "../src/primitives/portal";

const BusinessContext = createContext("missing");
const Business = () => <span role="dialog">{useContext(BusinessContext)}</span>;
it("hoisted layers retain physical RTL direction and later mixed overlays stack above earlier ones", () => {
  render(
    <PanelUIProvider>
      <Direction dir="rtl">
        <ModalPortal>
          <span id="first-layer">第一层</span>
          <ModalPortal>
            <span id="second-layer">第二层</span>
          </ModalPortal>
        </ModalPortal>
      </Direction>
    </PanelUIProvider>
  );
  const first = screen.getByText("第一层").parentElement;
  const second = screen.getByText("第二层").parentElement;
  expect(first?.style.direction).toBe("rtl");
  expect(second?.style.direction).toBe("rtl");
  expect(Number(second?.style.zIndex)).toBeGreaterThan(
    Number(first?.style.zIndex)
  );
});
it("native portal keeps caller contexts while escaping the isolated page content", () => {
  const { container, rerender } = render(
    <PanelUIProvider>
      <BusinessContext.Provider value="family-owner">
        <ModalPortal>
          <Business />
        </ModalPortal>
      </BusinessContext.Provider>
    </PanelUIProvider>
  );
  expect(screen.getByRole("dialog").textContent).toBe("family-owner");
  expect(
    container
      .querySelector('[data-panelui-content="true"]')
      ?.getAttribute("aria-hidden")
  ).toBe("true");
  rerender(<PanelUIProvider>background</PanelUIProvider>);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    container
      .querySelector('[data-panelui-content="true"]')
      ?.getAttribute("aria-hidden")
  ).toBe("false");
});
it("nested modal isolation survives a parent closing first and releases idempotently", () => {
  const store = new ModalIsolationStore();
  const change = vi.fn();
  store.subscribe(change);
  const parent = store.acquire("parent");
  const child = store.acquire("child");
  parent();
  parent();
  expect(store.getSnapshot()).toBe(true);
  child();
  expect(store.getSnapshot()).toBe(false);
  expect(change).toHaveBeenCalledTimes(2);
});
it("nested focus releases restore only after the top closes and skip unusable targets", () => {
  const store = new FocusRestorationStore();
  const parentRestore = vi.fn(() => true);
  const childRestore = vi.fn(() => false);
  const parent = store.acquire("parent", parentRestore);
  const child = store.acquire("child", childRestore);
  parent();
  expect(parentRestore).not.toHaveBeenCalled();
  child();
  expect(childRestore).toHaveBeenCalledOnce();
  expect(parentRestore).toHaveBeenCalledOnce();
  const input = document.createElement("input");
  document.body.append(input);
  input.focus();
  const restore = captureFocusRestore({
    activeElement: input,
    body: document.body,
    documentElement: document.documentElement,
  });
  input.disabled = true;
  expect(restore()).toBe(false);
  input.remove();
});

it("theme hosts keep the same native system typeface inside a page and after portal hoisting", () => {
  const source = readFileSync(
    path.resolve(import.meta.dirname, "../src/styles/panel.scss"),
    "utf-8"
  );
  const theme = source.match(
    /\.panelui-theme \{(?<declarations>[\s\S]*?)\n\}/u
  )?.groups?.declarations;
  if (!theme) {
    throw new Error("Missing theme host styles");
  }
  const style = document.createElement("style");
  style.textContent = `body { font-family: "PingFang SC"; } .legacy-page { font-family: "Geist"; } .panelui-theme { ${theme} }`;
  document.head.append(style);
  try {
    render(
      <div className="legacy-page">
        <PanelUIProvider>
          <span data-testid="page-font">Same content</span>
          <Portal>
            <span data-testid="overlay-font">Same content</span>
          </Portal>
        </PanelUIProvider>
      </div>
    );
    const page = getComputedStyle(screen.getByTestId("page-font")).fontFamily;
    const overlay = getComputedStyle(
      screen.getByTestId("overlay-font")
    ).fontFamily;
    expect(page).toBe(overlay);
    expect(page).toContain("-apple-system");
  } finally {
    style.remove();
  }
});

it("keeps retained pages mounted while suppressing their portal layers", () => {
  const content = (
    <>
      <input aria-label="draft" defaultValue="preserved" />
      <Portal>
        <span>active layer</span>
      </Portal>
    </>
  );
  const { rerender } = render(
    <PanelUIProvider active>{content}</PanelUIProvider>
  );
  const field = screen.getByLabelText("draft");
  expect(screen.getByText("active layer")).toBeTruthy();
  rerender(<PanelUIProvider active={false}>{content}</PanelUIProvider>);
  expect(screen.queryByText("active layer")).toBeNull();
  expect(screen.getByLabelText("draft")).toBe(field);
  rerender(<PanelUIProvider active>{content}</PanelUIProvider>);
  expect(screen.getByText("active layer")).toBeTruthy();
  expect(screen.getByLabelText("draft")).toBe(field);
});

it("gives absolute-fill portal content a viewport-sized containing block without swallowing empty-space touches", () => {
  render(
    <PanelUIProvider>
      <Portal>
        {createElement("view", {
          "data-testid": "portal-canvas-frame",
          style: { position: "absolute", inset: 0 },
        })}
      </Portal>
    </PanelUIProvider>
  );
  const content = screen.getByTestId("portal-canvas-frame");
  const layer = content.closest<HTMLElement>(".panelui-theme")!;
  expect(layer.style.position).toBe("fixed");
  expect(layer.style.inset).toMatch(/^0(?:px)?$/u);
  expect(layer.style.pointerEvents).toBe("none");
});

it("keeps active portal content interactive and suppresses inactive descendant touch overrides", () => {
  const style = document.createElement("style");
  style.textContent = readFileSync(
    path.resolve(import.meta.dirname, "../src/styles/portal.scss"),
    "utf-8"
  );
  document.head.append(style);
  const content = (state: string) =>
    createElement(
      "view",
      { "data-testid": `portal-content-${state}` },
      createElement(
        "button",
        {
          "data-testid": `portal-action-${state}`,
          style: { pointerEvents: "auto" },
        },
        "Draw"
      )
    );
  try {
    render(
      <PanelUIProvider>
        <ModalPortal>{content("active")}</ModalPortal>
        <ModalPortal interactive={false}>{content("inactive")}</ModalPortal>
      </PanelUIProvider>
    );
    for (const name of ["portal-content-active", "portal-action-active"]) {
      expect(getComputedStyle(screen.getByTestId(name)).pointerEvents).toBe("auto");
    }
    expect(
      getComputedStyle(screen.getByTestId("portal-action-inactive")).pointerEvents
    ).toBe("none");
  } finally {
    style.remove();
  }
});
