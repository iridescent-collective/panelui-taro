// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Fab } from "../src/components/Fab";
import { PanelUIProvider } from "../src/components/Provider";
import { readTaroStyle } from "./taro-style";

const observed = vi.hoisted(() => ({
  signals: [] as { count: () => number; set: (value: number) => void }[],
}));
vi.mock("../src/primitives/observable-number", async (original) => {
  const actual =
    await original<typeof import("../src/primitives/observable-number")>();
  return {
    ...actual,
    createObservableNumber: (initial = 0) => {
      const signal = actual.createObservableNumber(initial);
      let subscribers = 0;
      const subscribe = signal.subscribe;
      signal.subscribe = (listener) => {
        subscribers++;
        const off = subscribe(listener);
        return () => {
          subscribers--;
          off();
        };
      };
      observed.signals.push({
        count: () => subscribers,
        set: (value) => {
          signal.value = value;
        },
      });
      return signal;
    },
  };
});
it("one subscription drives the trigger and every action without remounting the trigger", () => {
  observed.signals.length = 0;
  render(
    <PanelUIProvider reducedMotion>
      <Fab.Group open glass blur icon="+" accessibilityLabel="Add">
        <Fab.Action label="Photo" />
        <Fab.Action label="Voice" />
      </Fab.Group>
    </PanelUIProvider>
  );
  expect(
    observed.signals.reduce((sum, signal) => sum + signal.count(), 0)
  ).toBe(1);
  const trigger = screen.getByRole("button", { name: "Add" });
  act(() => observed.signals[0].set(0.5));
  expect(screen.getByRole("button", { name: "Add" })).toBe(trigger);
  expect(trigger.textContent).toBe("+");
  const rotation = trigger.querySelector('[data-taro-style*="rotate"]');
  expect(readTaroStyle(rotation)).toContain("22.5deg");
});
it("rapid reopening retains the trigger and actions after the closing spring is cancelled", async () => {
  vi.useFakeTimers();
  try {
    render(
      <PanelUIProvider>
        <Fab.Group glass accessibilityLabel="Toggle">
          <Fab.Action label="Photo" />
        </Fab.Group>
      </PanelUIProvider>
    );
    const trigger = screen.getByRole("button", { name: "Toggle" });
    fireEvent.click(trigger);
    act(() => vi.advanceTimersByTime(96));
    fireEvent.click(trigger);
    act(() => vi.advanceTimersByTime(32));
    fireEvent.click(trigger);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("button", { name: "Toggle" })).toBe(trigger);
    expect(screen.getByRole("button", { name: "Photo" })).toBeTruthy();
  } finally {
    vi.useRealTimers();
  }
});
