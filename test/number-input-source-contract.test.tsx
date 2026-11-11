// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { NumberInput } from "../src/components/NumberInput";
import {
  normalize,
  precisionOf,
} from "../src/components/NumberInput/number-input-math";

const field = (): HTMLInputElement => {
  const input = document.querySelector<HTMLInputElement>("input");
  if (!input) {
    throw new Error("NumberInput native field missing");
  }
  return input;
};
afterEach(() => {
  vi.useRealTimers();
});

it("decimal steps snap from a finite minimum without binary drift", () => {
  expect(normalize(0.36, 0.05, 1, 0.1)).toBe(0.35);
  expect(normalize(1e20, 0, Infinity, 0.001)).toBe(1e20);
  expect(precisionOf(2e-7)).toBe(7);
});

it("typing stays unfinished until blur and unreadable text restores the last number", async () => {
  const onValueChange = vi.fn();
  render(
    <NumberInput
      defaultValue={2}
      min={0}
      max={10}
      step={0.5}
      onValueChange={onValueChange}
    />
  );
  fireEvent.focus(field());
  fireEvent.input(field(), { target: { value: "-" } });
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.blur(field());
  await waitFor(() => {
    expect(field().value).toBe("2");
  });
  fireEvent.focus(field());
  fireEvent.input(field(), { target: { value: "12.2" } });
  fireEvent.blur(field());
  await waitFor(() => {
    expect(field().value).toBe("10");
  });
  expect(onValueChange).toHaveBeenLastCalledWith(10);
});

it("held stepping uses live values, stops at a bound and never doubles the release click", () => {
  vi.useFakeTimers();
  const change = vi.fn();
  render(
    <NumberInput defaultValue={0} min={0} max={3} onValueChange={change} />
  );
  const plus = screen.getByRole("button", { name: "Increase value" });
  fireEvent.touchStart(plus);
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(field().value).toBe("3");
  expect(change.mock.calls).toEqual([[1], [2], [3]]);
  fireEvent.touchEnd(plus);
  fireEvent.click(plus);
  expect(change).toHaveBeenCalledTimes(3);
});

it("a rejected controlled step never advances to phantom values on repeat", () => {
  vi.useFakeTimers();
  const change = vi.fn();
  render(<NumberInput value={0} min={0} max={3} onValueChange={change} />);
  const plus = screen.getByRole("button", { name: "Increase value" });
  fireEvent.touchStart(plus);
  act(() => {
    vi.advanceTimersByTime(600);
  });
  fireEvent.touchCancel(plus);
  expect(field().value).toBe("0");
  expect(change.mock.calls.length).toBeGreaterThan(1);
  expect(change.mock.calls.every(([value]) => value === 1)).toBe(true);
});

it("disable and unmount cancel held timers and an error replaces description", () => {
  vi.useFakeTimers();
  const change = vi.fn();
  const { rerender, unmount } = render(
    <NumberInput defaultValue={1} onValueChange={change} description="提示" />
  );
  fireEvent.touchStart(screen.getByRole("button", { name: "Increase value" }));
  rerender(
    <NumberInput
      disabled
      defaultValue={1}
      onValueChange={change}
      description="提示"
      errorMessage="错误"
    />
  );
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(change).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("提示")).toBeNull();
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
