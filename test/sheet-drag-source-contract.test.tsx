// @vitest-environment happy-dom

import { View } from "@tarojs/components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { SheetSurfaceStore } from "../src/components/BottomSheet/surface-store";
import { useSheetDrag } from "../src/components/BottomSheet/use-sheet-drag";

const surface = new SheetSurfaceStore();
const close = vi.fn();
const DragHarness = ({
  initial = 0,
  open = true,
}: {
  initial?: number;
  open?: boolean;
}) => {
  const [translation, setTranslation] = useState(0);
  const [, setDragging] = useState(false);
  const handlers = useSheetDrag({
    close,
    dismissible: true,
    gap: 0,
    height: 600,
    measure: (active, listener) => {
      if (active()) {
        listener({ height: 300, left: 0, top: 300 + initial, width: 375 });
      }
    },
    open,
    scale: 1,
    setDragging,
    setTranslation,
    surface,
    translation,
  });
  return (
    <View id="drag" {...handlers}>
      <span aria-label="translation">{translation}</span>
    </View>
  );
};
const touch = (y: number, identifier = 1) => ({
  clientX: 10,
  clientY: y,
  identifier,
});
const dragSurface = () => {
  const element = screen.getByLabelText("translation").parentElement;
  if (!element) {
    throw new Error("Missing sheet drag surface");
  }
  return element;
};
it("external close and quick reopen release the body hold even without a touch end", () => {
  const release = surface.register("list");
  const { rerender } = render(<DragHarness />);
  const element = dragSurface();
  fireEvent.touchStart(element, { touches: [touch(100)] });
  fireEvent.touchMove(element, { touches: [touch(140)] });
  expect(surface.getSnapshot()).toBe(0);
  rerender(<DragHarness open={false} />);
  rerender(<DragHarness open />);
  expect(surface.getSnapshot()).toBeUndefined();
  release();
});
afterEach(() => {
  surface.offset = 0;
  surface.setHold(undefined);
  vi.useRealTimers();
});
it("a drag that interrupts arrival continues from the measured visual position", () => {
  render(<DragHarness initial={200} />);
  const el = dragSurface();
  fireEvent.touchStart(el, { touches: [touch(100)] });
  fireEvent.touchMove(el, { touches: [touch(140)] });
  expect(screen.getByLabelText("translation").textContent).toBe("240");
});
it("a second pointer cancels the drag and cannot dismiss on a stale velocity", async () => {
  render(<DragHarness />);
  const el = dragSurface();
  fireEvent.touchStart(el, { touches: [touch(100)] });
  fireEvent.touchMove(el, { touches: [touch(240)] });
  fireEvent.touchMove(el, { touches: [touch(240), touch(250, 2)] });
  await act(async () => {
    fireEvent.touchEnd(el);
    await Promise.resolve();
  });
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText("translation").textContent).toBe("0");
});
it("a body scrolled away from the top retains the drag and does not dismiss", async () => {
  const release = surface.register("list");
  surface.offset = 20;
  render(<DragHarness />);
  const el = dragSurface();
  fireEvent.touchStart(el, { touches: [touch(100)] });
  fireEvent.touchMove(el, { touches: [touch(240)] });
  await act(async () => {
    fireEvent.touchEnd(el);
    await Promise.resolve();
  });
  expect(close).not.toHaveBeenCalled();
  release();
});
