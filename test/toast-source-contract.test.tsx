// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Toast, toast, useToast } from "../src/components/Toast";
import { useToastSwipe } from "../src/components/Toast/use-swipe";
import { emitAppHide, emitAppShow } from "./taro-api";

afterEach(() => {
  toast.hideAll();
});
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const touches = (y: number, identifier = 1) => [
  { clientX: 50, clientY: y, identifier },
];
it("all six parts render in source anatomy, Action calls the owner before hiding and Close dismisses", () => {
  const events: string[] = [];
  render(
    <PanelUIProvider>
      <Toast variant="success" onHide={() => events.push("hide")}>
        <Toast.Indicator />
        <Toast.Content>
          <Toast.Title>Saved</Toast.Title>
          <Toast.Description>Ready</Toast.Description>
        </Toast.Content>
        <Toast.Action onPress={() => events.push("action")}>Undo</Toast.Action>
        <Toast.Close />
      </Toast>
    </PanelUIProvider>
  );
  expect(screen.getByRole("alert").getAttribute("aria-live")).toBe("polite");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(events).toEqual(["action", "hide"]);
  fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
  expect(events).toEqual(["action", "hide", "hide"]);
});
it("Provider mounts the queue without a separate viewport and builds optional action/icon/close rules", async () => {
  render(<PanelUIProvider reducedMotion />);
  act(() =>
    toast.show({
      actionLabel: "Undo",
      description: "Description",
      duration: 0,
      icon: null,
      label: "Queued",
    })
  );
  await settle();
  const alert = screen.getByRole("alert");
  expect(within(alert).getByText("Description")).toBeTruthy();
  expect(within(alert).getByRole("button", { name: "Undo" })).toBeTruthy();
  expect(
    within(alert).queryByRole("button", { name: "Dismiss notification" })
  ).toBeNull();
});
it("custom components are mounted once, supplied a working hide handle and hook shares imperative API", async () => {
  const mounted = vi.fn();
  render(<PanelUIProvider reducedMotion />);
  const hook = renderHook(useToast);
  expect(hook.result.current.toast).toBe(toast);
  act(() =>
    toast.show({
      component: (handle) => {
        mounted();
        return (
          <Toast onHide={handle.hide}>
            <Toast.Title>Custom</Toast.Title>
            <Toast.Close />
          </Toast>
        );
      },
      duration: 0,
    })
  );
  await settle();
  expect(mounted).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
  expect(
    document.querySelector('[aria-hidden="true"] .panelui-toast-fade-out')
  ).toBeNull();
});
it("hiding retains exit for 120ms in reduced motion and cleans all records afterwards", async () => {
  vi.useFakeTimers();
  try {
    const view = render(<PanelUIProvider reducedMotion />);
    let id = "";
    act(() => {
      id = toast.show({ duration: 0, label: "Transient" });
    });
    await settle();
    act(() => toast.hide(id));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector(".panelui-toast-fade-out")).toBeTruthy();
    act(() => vi.advanceTimersByTime(120));
    expect(document.querySelector(".panelui-toast-fade-out")).toBeNull();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("foreground countdown survives background time and one nested provider unmount does not pause others", async () => {
  vi.useFakeTimers();
  try {
    const first = render(<PanelUIProvider reducedMotion />);
    const second = render(<PanelUIProvider reducedMotion />);
    act(() => toast.show({ duration: 1000, label: "Timed" }));
    await settle();
    act(() => vi.advanceTimersByTime(300));
    act(emitAppHide);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    second.unmount();
    act(emitAppShow);
    act(() => vi.advanceTimersByTime(699));
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("alert")).toBeNull();
    first.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("top/bottom stacks have their own three visible cards and a fourth faded record", async () => {
  render(<PanelUIProvider reducedMotion />);
  act(() => {
    for (let index = 0; index < 5; index += 1) {
      toast.show({ duration: 0, label: `Bottom ${index}` });
    }
    toast.show({ duration: 0, label: "Top", placement: "top" });
  });
  await settle();
  expect(screen.getAllByRole("alert")).toHaveLength(4);
  expect(screen.queryByText("Bottom 0")).toBeNull();
  expect(screen.queryByRole("alert", { name: "Bottom 1" })).toBeNull();
  expect(screen.getByText("Bottom 1")).toBeTruthy();
  expect(screen.getByText("Top")).toBeTruthy();
});
it.each(["top", "bottom"] as const)(
  "swipes toward the %s edge dismiss after 50dp; away movement rubber bands and cancellation never hides",
  (placement) => {
    vi.useFakeTimers();
    try {
      const hide = vi.fn();
      const sign = placement === "top" ? -1 : 1;
      const view = renderHook(() =>
        useToastSwipe(placement, hide, true, false)
      );
      act(() => view.result.current.onTouchStart({ touches: touches(100) }));
      act(() => {
        vi.advanceTimersByTime(100);
        view.result.current.onTouchMove({ touches: touches(100 - sign * 100) });
      });
      expect(view.result.current.offset).toBe(-sign * 10);
      act(() => view.result.current.onTouchCancel());
      expect(hide).not.toHaveBeenCalled();
      act(() => view.result.current.onTouchStart({ touches: touches(100) }));
      act(() => {
        vi.advanceTimersByTime(100);
        view.result.current.onTouchMove({ touches: touches(100 + sign * 60) });
      });
      act(() => view.result.current.onTouchEnd({ changedTouches: touches(0) }));
      expect(hide).toHaveBeenCalledTimes(1);
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  }
);
it("a fast flick carries momentum until exit/unmount while a stale velocity and wrong contact cannot dismiss", () => {
  vi.useFakeTimers();
  try {
    const hide = vi.fn();
    const view = renderHook(() => useToastSwipe("bottom", hide, false, false));
    act(() => view.result.current.onTouchStart({ touches: touches(100) }));
    act(() => {
      vi.advanceTimersByTime(20);
      view.result.current.onTouchMove({ touches: touches(120) });
    });
    act(() => view.result.current.onTouchEnd({ changedTouches: touches(120) }));
    expect(hide).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(32));
    expect(view.result.current.offset).toBeGreaterThan(20);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    const slow = renderHook(() => useToastSwipe("bottom", hide, true, false));
    act(() => slow.result.current.onTouchStart({ touches: touches(100) }));
    act(() => {
      vi.advanceTimersByTime(20);
      slow.result.current.onTouchMove({ touches: touches(120) });
      vi.advanceTimersByTime(101);
    });
    act(() => slow.result.current.onTouchEnd({ changedTouches: touches(120) }));
    expect(hide).toHaveBeenCalledTimes(1);
    act(() => slow.result.current.onTouchStart({ touches: touches(100) }));
    act(() => slow.result.current.onTouchMove({ touches: touches(200, 2) }));
    act(() =>
      slow.result.current.onTouchEnd({ changedTouches: touches(200, 2) })
    );
    expect(hide).toHaveBeenCalledTimes(1);
    slow.unmount();
  } finally {
    vi.useRealTimers();
  }
});
it("the Taro onClick action alias invokes the native handler then dismisses exactly once", () => {
  const events: string[] = [];
  render(
    <PanelUIProvider>
      <Toast onHide={() => events.push("hide")}>
        <Toast.Action onClick={() => events.push("native")}>
          Native action
        </Toast.Action>
      </Toast>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Native action" }));
  expect(events).toEqual(["native", "hide"]);
});
