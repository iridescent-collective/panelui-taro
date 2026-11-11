// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { BottomSheet } from "../src/components/BottomSheet";
import { Button } from "../src/components/Button";
import { Dialog } from "../src/components/Dialog";
import { ViewerStore } from "../src/components/ImageViewer/store";
import { useViewerOverlayModel } from "../src/components/ImageViewer/use-overlay-model";
import type { OverlayProps } from "../src/components/ImageViewer/use-overlay-model";
import { PanelUIProvider } from "../src/components/Provider";
import { AnimatedPressable } from "../src/primitives/animated-pressable";
import {
  setElementComputedStyle,
  setTestMeasurement,
  emitTestResize,
} from "./taro-api";

const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
afterEach(() => vi.useRealTimers());

it.each(["dialog", "sheet"] as const)(
  "%s releases the page at the beginning of exit and can reopen before unmount",
  (kind) => {
    vi.useFakeTimers();
    const content = (open: boolean) => (
      <PanelUIProvider>
        {kind === "dialog" ? (
          <Dialog open={open}>
            <Dialog.Content>Overlay</Dialog.Content>
          </Dialog>
        ) : (
          <BottomSheet open={open}>
            <BottomSheet.Content>Overlay</BottomSheet.Content>
          </BottomSheet>
        )}
      </PanelUIProvider>
    );
    const view = render(content(true));
    const page = view.container.querySelector<HTMLElement>(
      "[data-panelui-content]"
    );
    const overlay = screen.getByRole("dialog");
    expect(page?.style.pointerEvents).toBe("none");
    view.rerender(content(false));
    expect(document.body.contains(overlay)).toBe(true);
    expect(page?.style.pointerEvents).toBe("auto");
    expect(
      overlay.closest<HTMLElement>(".panelui-background-transparent")?.style
        .pointerEvents
    ).toBe("none");
    view.rerender(content(true));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("dialog")).toBe(overlay);
    expect(page?.style.pointerEvents).toBe("none");
  }
);

it("an exiting nested dialog does not release the parent modal's isolation", () => {
  const content = (child: boolean) => (
    <PanelUIProvider>
      <Dialog open>
        <Dialog.Content>
          Parent
          <Dialog open={child}>
            <Dialog.Content>Child</Dialog.Content>
          </Dialog>
        </Dialog.Content>
      </Dialog>
    </PanelUIProvider>
  );
  const view = render(content(true));
  view.rerender(content(false));
  expect(
    view.container.querySelector<HTMLElement>("[data-panelui-content]")?.style
      .pointerEvents
  ).toBe("none");
});

it("press feedback leaves a disabled class opacity alone when style is a string", () => {
  render(
    <>
      <style>{".dimmed { opacity: 0.64; }"}</style>
      <AnimatedPressable
        disabled
        className="dimmed"
        style="width:32px"
        accessibilityRole="button"
      >
        Disabled
      </AnimatedPressable>
    </>
  );
  expect(getComputedStyle(screen.getByRole("button")).opacity).toBe("0.64");
});

it.each(["button", "pressable"] as const)(
  "%s keeps its class opacity for scale-only feedback and fades relative to its resting opacity",
  async (kind) => {
    const content = (fades: boolean) =>
      kind === "button" ? (
        <Button
          id="fade-target"
          className="dimmed"
          pressOpacity={fades ? 0.5 : 1}
        >
          Fade
        </Button>
      ) : (
        <AnimatedPressable
          id="fade-target"
          className="dimmed"
          accessibilityRole="button"
          pressOpacity={fades ? 0.5 : 1}
        >
          Fade
        </AnimatedPressable>
      );
    setElementComputedStyle("fade-target", { opacity: "0.4" });
    const view = render(
      <>
        <style>{".dimmed { opacity: 0.4; }"}</style>
        {content(false)}
      </>
    );
    const button = screen.getByRole("button");
    fireEvent.touchStart(button, { touches: [{ clientX: 10, clientY: 10 }] });
    expect(getComputedStyle(button).opacity).toBe("0.4");
    fireEvent.touchEnd(button);
    view.rerender(
      <>
        <style>{".dimmed { opacity: 0.4; }"}</style>
        {content(true)}
      </>
    );
    await flush();
    fireEvent.touchStart(button, { touches: [{ clientX: 10, clientY: 10 }] });
    expect(getComputedStyle(button).opacity).toBe("0.2");
    fireEvent.touchCancel(button);
    expect(getComputedStyle(button).opacity).toBe("0.4");
  }
);

it.each(["object", "string"] as const)(
  "fades relative to an explicit %s opacity and restores it on release",
  async (kind) => {
    render(
      <AnimatedPressable
        accessibilityRole="button"
        pressOpacity={0.5}
        style={kind === "object" ? { opacity: 0.6 } : "opacity:0.6;width:32px"}
      >
        Inline
      </AnimatedPressable>
    );
    await flush();
    const button = screen.getByRole("button");
    fireEvent.touchStart(button, { touches: [{ clientX: 10, clientY: 10 }] });
    expect(getComputedStyle(button).opacity).toBe("0.3");
    fireEvent.touchEnd(button);
    expect(getComputedStyle(button).opacity).toBe("0.6");
  }
);

it("gesture close remeasures a moved thumbnail before starting its return animation", async () => {
  vi.useFakeTimers();
  const store = new ViewerStore();
  let rect = { height: 60, width: 80, x: 20, y: 30 };
  const measure = vi.fn((done: (value: typeof rect) => void) => done(rect));
  store.set({
    id: "image",
    measure,
    order: 0,
    radius: 8,
    size: { height: 60, width: 80 },
    source: "image.png",
  });
  const exited = vi.fn();
  const props: OverlayProps = {
    blur: false,
    closeLabel: "Close",
    cornerRadius: 16,
    doubleTapScale: 2.5,
    haptics: false,
    index: 0,
    inset: 16,
    maxScale: 4,
    onExited: exited,
    onIndexChange: vi.fn(),
    onRequestClose: vi.fn(),
    onShow: vi.fn(),
    open: true,
    showClose: true,
    store,
  };
  const view = renderHook((value) => useViewerOverlayModel(value), {
    initialProps: props,
    wrapper: ({ children }) => (
      <PanelUIProvider reducedMotion>{children}</PanelUIProvider>
    ),
  });
  await flush();
  act(() => vi.advanceTimersByTime(400));
  expect(view.result.current.origin).toEqual(rect);
  rect = { ...rect, x: 150, y: 240 };
  act(() => view.result.current.startClose(0, 100));
  expect(measure).toHaveBeenCalledTimes(2);
  expect(view.result.current.origin).toEqual(rect);
  act(() => vi.advanceTimersByTime(200));
  expect(exited).toHaveBeenCalledOnce();
});

it("a resize and page update cannot strand an asynchronous close measurement", async () => {
  vi.useFakeTimers();
  const store = new ViewerStore();
  const callbacks: ((rect: {
    height: number;
    width: number;
    x: number;
    y: number;
  }) => void)[] = [];
  const measure = (
    done: (rect: {
      height: number;
      width: number;
      x: number;
      y: number;
    }) => void
  ) => {
    callbacks.push(done);
  };
  for (const [order, id] of ["first", "second"].entries()) {
    store.set({
      id,
      measure,
      order,
      radius: 8,
      size: { height: 60, width: 80 },
      source: "image.png",
    });
  }
  const exited = vi.fn();
  const props: OverlayProps = {
    blur: false,
    closeLabel: "Close",
    cornerRadius: 16,
    doubleTapScale: 2.5,
    haptics: false,
    index: 0,
    inset: 16,
    maxScale: 4,
    onExited: exited,
    onIndexChange: vi.fn(),
    onRequestClose: vi.fn(),
    onShow: vi.fn(),
    open: true,
    showClose: true,
    store,
  };
  const view = renderHook((value) => useViewerOverlayModel(value), {
    initialProps: props,
    wrapper: ({ children }) => (
      <PanelUIProvider reducedMotion>{children}</PanelUIProvider>
    ),
  });
  const rect = { height: 60, width: 80, x: 20, y: 30 };
  act(() => callbacks[0](rect));
  act(() => vi.advanceTimersByTime(400));
  act(() => view.result.current.startClose());
  view.rerender({ ...props, index: 1, open: false });
  act(() => {
    setTestMeasurement(100, 414);
    emitTestResize();
  });
  act(() => {
    for (const done of callbacks.slice(1)) {
      done(rect);
    }
  });
  act(() => vi.advanceTimersByTime(200));
  expect(exited).toHaveBeenCalledOnce();
  view.unmount();
  setTestMeasurement(100, 375);
});
it("does not sample its own feedback when the caller changes class during a press", async () => {
  vi.useFakeTimers();
  setElementComputedStyle("dynamic-fade", { opacity: "0.4" });
  const content = (extra: string) => (
    <AnimatedPressable
      id="dynamic-fade"
      accessibilityRole="button"
      className={`dimmed ${extra}`}
      pressOpacity={0.5}
    >
      Dynamic
    </AnimatedPressable>
  );
  const view = render(content("before"));
  await flush();
  const button = screen.getByRole("button");
  fireEvent.touchStart(button);
  expect(button.style.opacity).toBe("0.2");
  setElementComputedStyle("dynamic-fade", { opacity: "0.2" });
  view.rerender(content("after"));
  await flush();
  expect(button.style.opacity).toBe("0.2");
  fireEvent.touchEnd(button);
  setElementComputedStyle("dynamic-fade", { opacity: "0.4" });
  act(() => vi.advanceTimersByTime(300));
  await flush();
  fireEvent.touchStart(button);
  expect(button.style.opacity).toBe("0.2");
});

it("reopening during close adopts the current page and viewport", async () => {
  vi.useFakeTimers();
  const store = new ViewerStore();
  const measure = (
    done: (rect: {
      height: number;
      width: number;
      x: number;
      y: number;
    }) => void
  ) => done({ height: 60, width: 80, x: 20, y: 30 });
  for (const [order, id] of ["first", "second"].entries()) {
    store.set({
      id,
      measure,
      order,
      radius: 8,
      size: { height: 60, width: 80 },
      source: "image.png",
    });
  }
  const shown = vi.fn();
  const props: OverlayProps = {
    blur: false,
    closeLabel: "Close",
    cornerRadius: 16,
    doubleTapScale: 2.5,
    haptics: false,
    index: 0,
    inset: 16,
    maxScale: 4,
    onExited: vi.fn(),
    onIndexChange: vi.fn(),
    onRequestClose: vi.fn(),
    onShow: shown,
    open: true,
    showClose: true,
    store,
  };
  const view = renderHook((value) => useViewerOverlayModel(value), {
    initialProps: props,
    wrapper: ({ children }) => (
      <PanelUIProvider reducedMotion>{children}</PanelUIProvider>
    ),
  });
  act(() => vi.advanceTimersByTime(400));
  view.rerender({ ...props, open: false });
  view.rerender({ ...props, index: 1, open: false });
  act(() => {
    setTestMeasurement(100, 414);
    emitTestResize();
  });
  view.rerender({ ...props, index: 1 });
  expect(view.result.current.activePage.current).toBe(1);
  expect(view.result.current.motion.signal.value.pagerX).toBe(
    -(view.result.current.W + 16)
  );
  expect(shown).toHaveBeenLastCalledWith("second");
  act(() => vi.advanceTimersByTime(400));
  expect(props.onExited).not.toHaveBeenCalled();
  view.unmount();
  setTestMeasurement(100, 375);
});
