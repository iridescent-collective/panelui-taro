// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import { Direction } from "../src/components/Direction";
import { Drawer } from "../src/components/Drawer";
import { drawerGeometry } from "../src/components/Drawer/math";
import type { DrawerSide, DrawerSize } from "../src/components/Drawer/types";
import { useDrawerMotion } from "../src/components/Drawer/use-motion";
import { PanelUIProvider } from "../src/components/Provider";
import type { DirectionValue } from "../src/hooks/use-direction";
import FIXTURES from "./fixtures/drawer-source.json";

const sample = (props: React.ComponentProps<typeof Drawer.Content> = {}) => (
  <PanelUIProvider reducedMotion>
    <Drawer defaultOpen>
      <Drawer.Content {...props}>
        {props.children ?? (
          <>
            <Drawer.Header title="Workspace" description="Manage projects" />
            <Drawer.Body>Projects</Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close>
                <Button>Done</Button>
              </Drawer.Close>
            </Drawer.Footer>
          </>
        )}
      </Drawer.Content>
    </Drawer>
  </PanelUIProvider>
);
const externalCloseSample = (open: boolean) => (
  <PanelUIProvider reducedMotion>
    <Drawer open={open}>
      <Drawer.Content>
        <Drawer.Header title="External close" />
      </Drawer.Content>
    </Drawer>
  </PanelUIProvider>
);

const point = (x: number, y: number) => ({
  clientX: x,
  clientY: y,
  identifier: 1,
});
it.each([
  [375, 812, "start", "sm", 232.5, -1, "left"],
  [375, 812, "end", "md", 292.5, 1, "right"],
  [1024, 768, "start", "lg", 400, -1, "left"],
  [1024, 768, "end", "full", 962.56, 1, "right"],
  [375, 812, "top", "md", 365.4, -1, "top"],
  [375, 812, "bottom", "full", 763.28, 1, "bottom"],
] as const)(
  "preserves source edge fraction/cap %s %s %s %s",
  (width, height, side, size, extent, outward, physical) => {
    expect(drawerGeometry(width, height, side, size, "ltr").extent).toBeCloseTo(
      extent
    );
    expect(drawerGeometry(width, height, side, size, "ltr")).toMatchObject({
      outward,
      physical,
    });
  }
);
it("mirrors logical edges and drag direction together in RTL", () => {
  expect(drawerGeometry(375, 812, "start", "md", "rtl")).toMatchObject({
    outward: 1,
    physical: "right",
  });
  expect(drawerGeometry(375, 812, "end", "md", "rtl")).toMatchObject({
    outward: -1,
    physical: "left",
  });
});
it("renders a real scrolling body and close/footer/header clearance", () => {
  render(sample());
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.getByText("Workspace").parentElement?.className).toContain(
    "pe-[112px]"
  );
  expect(document.querySelector(".panel-drawer-body")?.outerHTML).toContain(
    "panel-drawer-body"
  );
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(
    screen.getByRole("dialog", { hidden: true }).getAttribute("aria-hidden")
  ).toBe("true");
});
it("composes trigger callbacks and respects a controlled refusal to close", () => {
  const own = vi.fn();
  const change = vi.fn();
  const controlled = (open: boolean) => (
    <PanelUIProvider reducedMotion>
      <Drawer open={open} onOpenChange={change}>
        <Drawer.Trigger>
          <Button onPress={own}>Open</Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header title="Controlled" />
        </Drawer.Content>
      </Drawer>
    </PanelUIProvider>
  );
  const view = render(controlled(false));
  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  expect(own).toHaveBeenCalledOnce();
  expect(change).toHaveBeenLastCalledWith(true);
  view.rerender(controlled(true));
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(change).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole("dialog")).toBeTruthy();
});
it("preserves direction inside the portal and puts an end drawer close in its start corner", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <Drawer defaultOpen>
          <Drawer.Content side="end">
            <Drawer.Header title="RTL" />
          </Drawer.Content>
        </Drawer>
      </Direction>
    </PanelUIProvider>
  );
  expect(screen.getByText("RTL").parentElement?.className).toContain(
    "ps-[112px]"
  );
  const panel = screen.getByRole("dialog");
  expect(panel.style.left).toBe("0px");
  expect(panel.parentElement?.style.direction).toBe("rtl");
});
it("does not allow a nondismissible backdrop to close, and plain body avoids a nested scroller", () => {
  render(
    sample({
      children: <Drawer.Body scrollable={false}>Plain content</Drawer.Body>,
      dismissible: false,
    })
  );
  fireEvent.click(screen.getByLabelText("Close drawer"));
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(document.querySelector(".panel-drawer-body")).toBeNull();
});
it("dismisses an outward drag and allows the cross-axis scroll to win", () => {
  vi.useFakeTimers();
  try {
    render(sample());
    const panel = screen.getByRole("dialog");

    fireEvent.touchStart(panel, {
      touches: [point(200, 200)],
    });
    fireEvent.touchMove(panel, {
      touches: [point(190, 240)],
    });
    fireEvent.touchEnd(panel, {
      changedTouches: [point(190, 240)],
    });
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    fireEvent.touchStart(panel, {
      touches: [point(200, 200)],
    });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.touchMove(panel, {
      touches: [point(100, 202)],
    });
    fireEvent.touchEnd(panel, {
      changedTouches: [point(100, 202)],
    });
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  } finally {
    vi.useRealTimers();
  }
});

it.each(FIXTURES.geometry)(
  "matches pinned drawer source geometry %#",
  ({ input, expected }) => {
    expect(
      drawerGeometry(
        input.width,
        input.height,
        input.side as DrawerSide,
        input.size as DrawerSize,
        input.direction as DirectionValue
      )
    ).toEqual(expected);
  }
);
it("exits from the current drag without a reset and rearms the next entry", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(({ open }) => useDrawerMotion(open, 292.5, false), {
      initialProps: { open: true },
    });
    act(() => vi.advanceTimersByTime(1600));
    expect(view.result.current.shift).toBeCloseTo(0);
    act(() => {
      view.result.current.begin();
      view.result.current.update(100);
    });
    expect(view.result.current.shift).toBe(100);
    view.rerender({ open: false });
    expect(view.result.current.shift).toBe(100);
    act(() => vi.advanceTimersByTime(96));
    expect(view.result.current.shift).toBeCloseTo(
      100 + (292.5 - 100) * (1 - (1 - 96 / 200) ** 2)
    );
    act(() => vi.advanceTimersByTime(104));
    expect(view.result.current.shift).toBe(292.5);
    view.rerender({ open: true });
    act(() => vi.advanceTimersByTime(1600));
    expect(view.result.current.shift).toBeCloseTo(0);
  } finally {
    vi.useRealTimers();
  }
});
it("cancels a mismatched or additional touch and springs back without dismissing", () => {
  vi.useFakeTimers();
  try {
    render(sample());
    const panel = screen.getByRole("dialog");
    fireEvent.touchStart(panel, { touches: [point(200, 200)] });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.touchMove(panel, { touches: [point(140, 200)] });
    fireEvent.touchMove(panel, {
      touches: [point(140, 200), { ...point(120, 200), identifier: 2 }],
    });
    fireEvent.touchEnd(panel, { changedTouches: [point(100, 200)] });
    expect(panel.getAttribute("aria-hidden")).toBe("false");
    act(() => vi.advanceTimersByTime(1600));
    expect(panel.style.transform).toContain("(0rpx)");
  } finally {
    vi.useRealTimers();
  }
});
it("does not restore an externally closed drawer while a contact is still held", () => {
  const view = render(externalCloseSample(true));
  const panel = screen.getByRole("dialog");
  fireEvent.touchStart(panel, { touches: [point(200, 200)] });
  fireEvent.touchMove(panel, { touches: [point(140, 200)] });
  view.rerender(externalCloseSample(false));
  expect(panel.getAttribute("aria-hidden")).toBe("true");
  expect(panel.style.transform).toBe("translateX(-585rpx)");
});
it("opens and closes through native Taro onClick without swallowing the child's callback", () => {
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Drawer>
        <Drawer.Trigger>
          <Button onClick={click}>Native open</Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Close>
            <Button onClick={click}>Native close</Button>
          </Drawer.Close>
        </Drawer.Content>
      </Drawer>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Native open" }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Native close" }));
  expect(click).toHaveBeenCalledTimes(2);
  expect(
    screen.getByRole("dialog", { hidden: true }).getAttribute("aria-hidden")
  ).toBe("true");
});
it("retains native content flex layout when callers arrange a body row", () => {
  render(
    sample({
      children: (
        <Drawer.Body contentContainerStyle={{ flexDirection: "row", gap: 12 }}>
          <span>A</span>
          <span>B</span>
        </Drawer.Body>
      ),
    })
  );
  const row = screen.getByText("A").parentElement;
  expect(row?.className).toContain("flex");
  expect(row?.style.flexDirection).toBe("row");
});
