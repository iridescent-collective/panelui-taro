// @vitest-environment happy-dom

import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { useKeyboard } from "../src/hooks/use-keyboard";
import { keyboardLift } from "../src/hooks/use-keyboard-avoidance";
import { KeyboardAvoider } from "../src/primitives/keyboard-avoider";
import {
  emitKeyboardHeight,
  keyboardListenerCount,
  setElementMeasurement,
} from "./taro-api";
import { readTaroStyle } from "./taro-style";

const Reader = ({ label }: { label: string }) => {
  const keyboard = useKeyboard();
  return (
    <span>
      {label}:{keyboard.height}:{String(keyboard.isVisible)}
    </span>
  );
};
it("shares one native keyboard listener and releases it when the last consumer unmounts", () => {
  const { unmount } = render(
    <>
      <Reader label="one" />
      <Reader label="two" />
    </>
  );
  expect(keyboardListenerCount()).toBe(1);
  act(() => emitKeyboardHeight(300));
  expect(screen.getByText("one:300:true")).toBeTruthy();
  expect(screen.getByText("two:300:true")).toBeTruthy();
  act(() => emitKeyboardHeight(0));
  expect(screen.getByText("one:0:false")).toBeTruthy();
  unmount();
  expect(keyboardListenerCount()).toBe(0);
});
it("dock subtracts the existing bottom inset and disabled boxes do not move", () => {
  const { container, rerender } = render(
    <PanelUIProvider reducedMotion>
      <KeyboardAvoider id="dock" mode="dock" bottomInset={20}>
        dock
      </KeyboardAvoider>
    </PanelUIProvider>
  );
  act(() => emitKeyboardHeight(300));
  expect(readTaroStyle(container.querySelector("#dock"))).toContain(
    "translateY(-560rpx)"
  );
  rerender(
    <PanelUIProvider reducedMotion>
      <KeyboardAvoider id="dock" mode="dock" bottomInset={20} active={false}>
        dock
      </KeyboardAvoider>
    </PanelUIProvider>
  );
  expect(readTaroStyle(container.querySelector("#dock"))).toContain(
    "translateY(0rpx)"
  );
});
it("lift recovers the resting edge instead of chasing its own previous translation", () => {
  expect(keyboardLift(500, 0, 650, 300, 16)).toBe(-166);
  expect(keyboardLift(334, -166, 650, 300, 16)).toBe(-166);
  expect(keyboardLift(170, -166, 650, 300, 16)).toBe(-2);
  expect(keyboardLift(100, 0, 650, 300, 16)).toBe(-0);
});
it("lift queries stop on hidden keyboard or unmount and leave no tracking timers", async () => {
  vi.useFakeTimers();
  try {
    const { unmount } = render(
      <PanelUIProvider reducedMotion>
        <KeyboardAvoider>tracked</KeyboardAvoider>
      </PanelUIProvider>
    );
    await act(async () => {
      emitKeyboardHeight(300);
      await Promise.resolve();
    });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    await act(async () => {
      emitKeyboardHeight(0);
      await Promise.resolve();
    });
    expect(vi.getTimerCount()).toBe(0);
    unmount();
    expect(keyboardListenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("resumes lift after a first null frame becomes measurable", async () => {
  setElementMeasurement("late-lift", null);
  const { container, rerender } = render(
    <PanelUIProvider reducedMotion>
      <KeyboardAvoider id="late-lift">Before</KeyboardAvoider>
    </PanelUIProvider>
  );
  await act(async () => {
    emitKeyboardHeight(300);
    await Promise.resolve();
  });
  expect(readTaroStyle(container.querySelector("#late-lift"))).toContain(
    "translateY(0rpx)"
  );
  setElementMeasurement("late-lift", {
    height: 40,
    left: 0,
    top: 600,
    width: 300,
  });
  rerender(
    <PanelUIProvider reducedMotion>
      <KeyboardAvoider id="late-lift">After</KeyboardAvoider>
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(readTaroStyle(container.querySelector("#late-lift"))).not.toContain(
      "translateY(0rpx)"
    )
  );
});

it("settles both lifted fields when dismissed and rejects measurements queued before dismissal", async () => {
  setElementMeasurement("upper", { height: 40, left: 0, top: 420, width: 300 });
  setElementMeasurement("lower", { height: 40, left: 0, top: 600, width: 300 });
  const { container } = render(
    <PanelUIProvider>
      <KeyboardAvoider id="upper">Upper</KeyboardAvoider>
      <KeyboardAvoider id="lower">Lower</KeyboardAvoider>
    </PanelUIProvider>
  );
  act(() => emitKeyboardHeight(300));
  await waitFor(() => {
    expect(readTaroStyle(container.querySelector("#upper"))).not.toContain(
      "translateY(0rpx)"
    );
    expect(readTaroStyle(container.querySelector("#lower"))).not.toContain(
      "translateY(0rpx)"
    );
  });
  vi.useFakeTimers({ toFake: ["queueMicrotask"] });
  try {
    await waitFor(() => expect(vi.getTimerCount()).toBeGreaterThan(0));
    act(() => emitKeyboardHeight(0));
    act(() => vi.runAllTicks());
    for (const id of ["upper", "lower"]) {
      const style = readTaroStyle(container.querySelector(`#${id}`));
      expect(style).toContain("translateY(0rpx)");
      expect(style).toContain("transform 200ms ease");
    }
  } finally {
    vi.useRealTimers();
  }
});
