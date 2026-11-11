// @vitest-environment happy-dom

import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { Countdown } from "../src/components/Countdown";
import {
  describeSeconds,
  msUntilNextTick,
  secondsLeft,
  splitSeconds,
  trimLeading,
} from "../src/components/Countdown/countdown-time";
import { Digit } from "../src/components/Countdown/Digit";

afterEach(() => vi.useRealTimers());
it("clock arithmetic rounds up, aligns the next tick and rolls unused larger units into the first", () => {
  expect(secondsLeft(1001, 1000)).toBe(1);
  expect(secondsLeft(Number.NaN, 0)).toBe(0);
  expect(msUntilNextTick(2500, 1000)).toBe(500);
  expect(splitSeconds(172_801, ["seconds", "hours"])).toEqual([
    { unit: "hours", value: 48 },
    { unit: "seconds", value: 1 },
  ]);
  expect(trimLeading(splitSeconds(3))).toEqual([
    { unit: "minutes", value: 0 },
    { unit: "seconds", value: 3 },
  ]);
  expect(describeSeconds(125)).toBe("2 minutes left");
});
it("delayed clock reads catch up and completion fires once per target, with timer cleanup", () => {
  vi.useFakeTimers();
  vi.setSystemTime(1000);
  const complete = vi.fn();
  const tick = vi.fn();
  const { rerender, unmount } = render(
    <Countdown to={3500} onComplete={complete} onTick={tick} />
  );
  expect(screen.getByRole("timer").getAttribute("aria-label")).toBe(
    "3 seconds left"
  );
  act(() => vi.advanceTimersByTime(508));
  expect(tick).toHaveBeenLastCalledWith(2);
  act(() => {
    vi.setSystemTime(10_000);
    vi.advanceTimersByTime(1000);
  });
  expect(complete).toHaveBeenCalledOnce();
  act(() => vi.advanceTimersByTime(5000));
  expect(complete).toHaveBeenCalledOnce();
  rerender(<Countdown to={20_000} onComplete={complete} onTick={tick} />);
  expect(tick).toHaveBeenLastCalledWith(4);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("digit roll keeps the outgoing glyph for 260ms and reduced motion removes both transitions", () => {
  vi.useFakeTimers();
  const { container, rerender } = render(
    <Digit value="9" animate className="digit" />
  );
  expect(container.querySelector(".panelui-countdown-digit--in")).toBeNull();
  rerender(<Digit value="0" animate className="digit" />);
  expect(
    container.querySelector(".panelui-countdown-digit--out")?.textContent
  ).toBe("9");
  expect(
    container.querySelector(".panelui-countdown-digit--in")?.textContent
  ).toBe("0");
  act(() => vi.advanceTimersByTime(260));
  expect(container.querySelector(".panelui-countdown-digit--out")).toBeNull();
  rerender(<Digit value="1" animate={false} className="digit" />);
  expect(container.querySelector(".panelui-countdown-digit--in")).toBeNull();
});
