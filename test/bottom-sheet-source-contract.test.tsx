// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { BottomSheet } from "../src/components/BottomSheet";
import {
  bottomSheetDetentHeight,
  sheetGeometry,
  shouldDismissSheet,
} from "../src/components/BottomSheet/geometry";
import { PanelUIProvider } from "../src/components/Provider";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

afterEach(() => {
  vi.useRealTimers();
});
it("source sizes, detached clearance and native detent helper retain their geometry", () => {
  expect(bottomSheetDetentHeight(["half"], 800)).toBe(400);
  expect(bottomSheetDetentHeight([{ height: 320 }], 800)).toBe(320);
  expect(
    sheetGeometry(800, { bottom: 34, top: 44 }, "android", true, "full")
  ).toEqual({ cap: 710, gap: 46, height: 710, paddingBottom: 16 });
  expect(shouldDismissSheet(130, 0)).toBe(true);
  expect(shouldDismissSheet(20, 900)).toBe(true);
  expect(shouldDismissSheet(30, -400)).toBe(false);
});
it("trigger preserves the child's native callback and explicit close still works in a locked sheet", async () => {
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <BottomSheet>
        <BottomSheet.Trigger>
          <button onClick={click}>打开</button>
        </BottomSheet.Trigger>
        <BottomSheet.Content dismissible={false}>
          <BottomSheet.Header title="标题" />
        </BottomSheet.Content>
      </BottomSheet>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("打开"));
  expect(click).toHaveBeenCalledTimes(1);
  const dialog = screen.getByRole("dialog");
  const backdrop = screen.getByLabelText("Close sheet");
  fireEvent.click(backdrop);
  expect(screen.getByRole("dialog")).toBe(dialog);
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => {
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
it("controlled refusal leaves the sheet visible and rapid close reopen retains one portal", async () => {
  const change = vi.fn();
  const sheet = (open: boolean) => (
    <PanelUIProvider>
      <BottomSheet open={open} onOpenChange={change}>
        <BottomSheet.Content>
          <BottomSheet.Header title="受控" />
        </BottomSheet.Content>
      </BottomSheet>
    </PanelUIProvider>
  );
  const { rerender } = render(sheet(true));
  await act(async () => {
    await Promise.resolve();
  });
  const dialog = screen.getByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole("dialog")).toBe(dialog);
  rerender(sheet(false));
  rerender(sheet(true));
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog")).toBe(dialog);
});
it("body scroll callbacks remain composed and a sized body fills remaining space", () => {
  const scroll = vi.fn();
  const { container } = render(
    <PanelUIProvider>
      <BottomSheet defaultOpen>
        <BottomSheet.Content size="half">
          <BottomSheet.Header title="滚动" />
          <BottomSheet.Body id="sheet-body" onScroll={scroll}>
            长列表
          </BottomSheet.Body>
          <BottomSheet.Footer>底栏</BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet>
    </PanelUIProvider>
  );
  const body = document.querySelector("#sheet-body");
  if (!body) {
    throw new Error("Sheet body missing");
  }
  dispatchTaroEvent(body, TARO_TEST_EVENTS.scroll, { scrollTop: 40 });
  expect(scroll).toHaveBeenCalledTimes(1);
  expect(body.className).toContain("h-0 flex-1");
  expect(container).toBeTruthy();
});
