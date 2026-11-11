// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import { Dialog } from "../src/components/Dialog";
import { PanelUIProvider } from "../src/components/Provider";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

afterEach(() => vi.useRealTimers());
it("Taro click and source press aliases each invoke their caller once and open the same dialog", () => {
  const clicked = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Dialog>
        <Dialog.Trigger>
          <Button onClick={clicked}>打开</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>标题</Dialog.Title>
          <Dialog.Close>
            <Button>关闭</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "打开" }));
  expect(clicked).toHaveBeenCalledOnce();
  expect(screen.getByRole("dialog").textContent).toContain("标题");
  fireEvent.click(screen.getByRole("button", { name: "关闭" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("controlled close refusal keeps the dialog and rearms the native back guard", () => {
  const changed = vi.fn();
  const { container } = render(
    <PanelUIProvider>
      <Dialog open onOpenChange={changed}>
        <Dialog.Content>受控</Dialog.Content>
      </Dialog>
    </PanelUIProvider>
  );
  const guard = container.querySelector("section");
  if (!guard) {
    throw new Error("Missing page guard");
  }
  act(() => dispatchTaroEvent(guard, TARO_TEST_EVENTS.beforeLeave, {}));
  expect(changed).toHaveBeenCalledWith(false);
  expect(screen.getByRole("dialog").textContent).toBe("受控");
  act(() => dispatchTaroEvent(guard, TARO_TEST_EVENTS.afterLeave, {}));
  expect(container.querySelector("section")).not.toBe(guard);
});
it("a pinned dialog ignores the backdrop and creates no active back handler", () => {
  const changed = vi.fn();
  const { container } = render(
    <PanelUIProvider>
      <Dialog open onOpenChange={changed}>
        <Dialog.Content dismissible={false}>固定</Dialog.Content>
      </Dialog>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
  expect(changed).not.toHaveBeenCalled();
  const guard = container.querySelector("section");
  if (!guard) {
    throw new Error("Missing page guard");
  }
  act(() => dispatchTaroEvent(guard, TARO_TEST_EVENTS.beforeLeave, {}));
  expect(changed).not.toHaveBeenCalled();
});
it("rapid exit reversal cancels teardown while panel footer bleeds exactly the source padding", () => {
  vi.useFakeTimers();
  const { rerender } = render(
    <PanelUIProvider>
      <Dialog open>
        <Dialog.Content>
          <Dialog.Footer variant="panel" data-testid="footer">
            底栏
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </PanelUIProvider>
  );
  expect(readTaroStyle(screen.getByTestId("footer"))).toContain(
    '"marginLeft":"-40rpx"'
  );
  rerender(
    <PanelUIProvider>
      <Dialog open={false}>
        <Dialog.Content>内容</Dialog.Content>
      </Dialog>
    </PanelUIProvider>
  );
  act(() => vi.advanceTimersByTime(75));
  rerender(
    <PanelUIProvider>
      <Dialog open>
        <Dialog.Content>再次打开</Dialog.Content>
      </Dialog>
    </PanelUIProvider>
  );
  act(() => vi.advanceTimersByTime(150));
  expect(screen.getByRole("dialog").textContent).toBe("再次打开");
});
