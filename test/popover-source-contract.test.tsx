// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useEffect } from "react";
import { expect, it, vi } from "vitest";

import { Popover, usePopoverAnchor } from "../src/components/Popover";
import { placePopover } from "../src/components/Popover/placement";
import { PanelUIProvider } from "../src/components/Provider";

const bounds = { bottom: 633, left: 12, right: 363, top: 12 };
const Anchor = () => {
  const { anchorTo } = usePopoverAnchor("Anchor");
  useEffect(() => {
    anchorTo({ height: 0, width: 0, x: 300, y: 580 });
  }, [anchorTo]);
  return null;
};
it("source placement flips before clamping and keeps arrows attached to the actual trigger", () => {
  const position = placePopover({
    align: "end",
    alignOffset: 30,
    bounds,
    offset: 8,
    placement: "bottom",
    size: { height: 120, width: 180 },
    trigger: { height: 20, width: 20, x: 330, y: 580 },
  });
  expect(position).toEqual({
    arrowOffset: 157,
    left: 183,
    placement: "top",
    top: 452,
  });
  expect(
    placePopover({
      align: "center",
      alignOffset: 0,
      bounds,
      offset: 8,
      placement: "left",
      size: { height: 100, width: 100 },
      trigger: { height: 20, width: 20, x: 12, y: 300 },
    }).placement
  ).toBe("right");
});
it("trigger measures, preserves native callbacks and closes through its child action", async () => {
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Popover>
        <Popover.Trigger>
          <button onClick={click}>打开</button>
        </Popover.Trigger>
        <Popover.Content width="trigger">
          <Popover.Title>已测量</Popover.Title>
          <Popover.Close>
            <button>关闭内容</button>
          </Popover.Close>
        </Popover.Content>
      </Popover>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("打开"));
  await waitFor(() => {
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
  expect(click).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText("关闭内容"));
  await waitFor(() => {
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
it("default open measures its trigger on mount rather than waiting for a closing press", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Popover defaultOpen>
        <Popover.Trigger>
          <button>触发器</button>
        </Popover.Trigger>
        <Popover.Content>初始内容</Popover.Content>
      </Popover>
    </PanelUIProvider>
  );
  await waitFor(() => {
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
it("point anchors work without a trigger and a controlled caller can refuse outside dismissal", async () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Popover open onOpenChange={change}>
        <Anchor />
        <Popover.Content>
          <Popover.Arrow />
          <Popover.Title>指向单点</Popover.Title>
        </Popover.Content>
      </Popover>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const dialog = screen.getByRole("dialog");
  fireEvent.click(screen.getByLabelText("Close"));
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.getByRole("dialog")).toBe(dialog);
});
it("sheet presentation hands content off without creating a second anchored portal", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Popover defaultOpen presentation="bottom-sheet">
        <Popover.Content width={200}>
          <Popover.Title>移动端</Popover.Title>
          <Popover.Arrow />
        </Popover.Content>
      </Popover>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByText("移动端")).toBeTruthy();
});
it("modal adaptation isolates background and hides the pointer-only dismiss catcher", async () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Popover defaultOpen>
        <Anchor />
        <Popover.Content modal dismissLabel={false}>
          <Popover.Title>Modal list</Popover.Title>
        </Popover.Content>
      </Popover>
    </PanelUIProvider>
  );
  await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
  expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("true");
  expect(screen.queryByLabelText("Close")).toBeNull();
  expect(
    container.ownerDocument.querySelector(
      '.absolute.inset-0[aria-hidden="true"]'
    )
  ).toBeTruthy();
});
it.each([false, true])(
  "releases an exiting popover's layer immediately (modal: %s)",
  async (modal) => {
    vi.useFakeTimers();
    try {
      const content = (open: boolean) => (
        <PanelUIProvider>
          <Popover open={open}>
            <Anchor />
            <Popover.Content modal={modal}>Exit check</Popover.Content>
          </Popover>
        </PanelUIProvider>
      );
      const view = render(content(true));
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      const panel = screen.getByRole("dialog");
      const page = view.container.querySelector<HTMLElement>(
        "[data-panelui-content]"
      );
      expect(page?.style.pointerEvents).toBe(modal ? "none" : "auto");
      view.rerender(content(false));
      expect(document.body.contains(panel)).toBe(true);
      expect(page?.style.pointerEvents).toBe("auto");
      expect(
        panel.closest<HTMLElement>(".panelui-background-transparent")?.style
          .pointerEvents
      ).toBe("none");
      view.rerender(content(true));
      act(() => vi.advanceTimersByTime(200));
      expect(screen.getByRole("dialog")).toBe(panel);
      view.unmount();
    } finally {
      vi.useRealTimers();
    }
  }
);
