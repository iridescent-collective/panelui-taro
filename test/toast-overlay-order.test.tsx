// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { Dialog } from "../src/components/Dialog";
import { PanelUIProvider } from "../src/components/Provider";
import { Toast, toast } from "../src/components/Toast";
import { toastStore } from "../src/components/Toast/toast-store";
import {
  CanvasPaintStack,
  useCanvasPaintOccluded,
} from "../src/primitives/canvas-paint-context";

afterEach(() => toast.hideAll());
const layer = (node: Element) => node.closest<HTMLElement>(".panelui-theme")!;
const CanvasProbe = () => (
  <output data-testid="canvas-occluded">
    {String(useCanvasPaintOccluded())}
  </output>
);
const Fixture = ({
  open = false,
  nested = false,
}: {
  open?: boolean;
  nested?: boolean;
}) => (
  <PanelUIProvider reducedMotion>
    <Dialog open={open}>
      <Dialog.Content>
        <Dialog.Title>Parent</Dialog.Title>
        <CanvasProbe />
        <Dialog open={nested}>
          <Dialog.Content>
            <Dialog.Title>Child</Dialog.Title>
          </Dialog.Content>
        </Dialog>
      </Dialog.Content>
    </Dialog>
  </PanelUIProvider>
);
it("keeps an existing feedback layer above later nested dialogs without remounting its content", () => {
  const mounted = vi.fn();
  const Content = () => {
    useEffect(mounted, []);
    return (
      <Toast>
        <Toast.Title>Persistent feedback</Toast.Title>
      </Toast>
    );
  };
  const view = render(<Fixture />);
  act(() => {
    toast.show({ duration: 0, component: () => <Content /> });
  });
  const notification = screen.getByText("Persistent feedback");
  const originalLayer = layer(notification);
  for (const nested of [false, true, false]) {
    view.rerender(<Fixture open nested={nested} />);
    expect(layer(screen.getByText("Persistent feedback"))).toBe(originalLayer);
    for (const dialog of screen.getAllByRole("dialog", { hidden: true }))
      expect(Number(originalLayer.style.zIndex)).toBeGreaterThan(
        Number(layer(dialog).style.zIndex)
      );
    expect(screen.getByTestId("canvas-occluded").textContent).toBe("true");
  }
  expect(mounted).toHaveBeenCalledTimes(1);
});
it("does not let feedback layers chase each other and keeps Canvas occlusion ordered", () => {
  const stack = new CanvasPaintStack();
  const normal = stack.acquire(1);
  const first = stack.acquire(2, "feedback");
  const second = stack.acquire(3, "feedback");
  expect(stack.getNormalSnapshot()).toBe(1);
  expect(stack.getSnapshot()).toBe(3.5);
  const modal = stack.acquire(4);
  expect(stack.getNormalSnapshot()).toBe(4);
  expect(stack.getSnapshot()).toBe(4.5);
  modal();
  expect(stack.getSnapshot()).toBe(3.5);
  first();
  second();
  expect(stack.getSnapshot()).toBe(1);
  normal();
  expect(stack.getSnapshot()).toBe(0);
});
const swipeUp = (label: string) => {
  const surface = screen.getByText(label).closest('[role="alert"]')!
    .parentElement!.parentElement!;
  const points = (clientY: number) => [{ clientX: 50, clientY, identifier: 1 }];
  fireEvent.touchStart(surface, { touches: points(300) });
  fireEvent.touchMove(surface, { touches: points(-100) });
  fireEvent.touchEnd(surface, { changedTouches: points(-100) });
};
it("allows explicit non-dismissible loading while preserving Native's default swipe behavior", () => {
  render(<PanelUIProvider reducedMotion />);
  let id = "";
  act(() => {
    id = toast.show({
      label: "Pinned loading",
      duration: 0,
      placement: "top",
      closable: false,
      swipeToDismiss: false,
    });
  });
  act(() => swipeUp("Pinned loading"));
  expect(toastStore.getSnapshot().some((item) => item.id === id)).toBe(true);
  act(() => toast.hide(id));
  act(() => {
    toast.show({
      label: "Ordinary notice",
      duration: 0,
      placement: "top",
      closable: false,
    });
  });
  act(() => swipeUp("Ordinary notice"));
  expect(
    toastStore.getSnapshot().some((item) => item.label === "Ordinary notice")
  ).toBe(false);
});
