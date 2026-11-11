// @vitest-environment happy-dom

import { act, render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { TextAnimation } from "../src/components/TextAnimation";
import {
  scrollingValues,
  withAlpha,
} from "../src/components/TextAnimation/math";
import FIXTURES from "./fixtures/text-animation-source.json";

const advance = (time: number) => act(() => vi.advanceTimersByTime(time));
it.each(FIXTURES.scales)(
  "matches source numeric scale %#",
  ({ value, step, around, values, target }) => {
    const actual = scrollingValues(value, step, around);
    expect({
      ...actual,
      values: actual.values.map((item) => (item === 0 ? 0 : item)),
    }).toEqual({
      rows: around * 2 + 1,
      target,
      values,
    });
  }
);
it.each(FIXTURES.traces)(
  "matches source typing/erasing trace %#",
  ({ strings, repeat, frames }) => {
    vi.useFakeTimers();
    try {
      let elapsed = 0;
      const done = vi.fn();
      const view = render(
        <TextAnimation.Typing
          text={strings}
          duration={55}
          delay={40}
          hold={100}
          loop={repeat}
          onDone={done}
          data-testid="typed"
        />
      );
      for (const frame of frames) {
        advance(frame.time - elapsed);
        elapsed = frame.time;
        if ("done" in frame) {
          expect(done).toHaveBeenCalled();
        } else {
          expect(screen.getByTestId("typed").textContent).toBe(
            String.fromCodePoint(...frame.codeUnits)
          );
        }
      }
      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  }
);
const defaultSample = (onDone: () => void, enabled?: boolean) => (
  <TextAnimation duration={100} delay={10} enabled={false}>
    <TextAnimation.Typing
      text="ab"
      enabled={enabled}
      onDone={onDone}
      data-testid="own"
    />
  </TextAnimation>
);
it("keeps root defaults overridable, uses latest done callback, and cancels on disable", () => {
  vi.useFakeTimers();
  try {
    const first = vi.fn();
    const second = vi.fn();

    const view = render(defaultSample(first, true));
    advance(110);
    expect(screen.getByTestId("own").textContent).toBe("a");
    view.rerender(defaultSample(second, true));
    advance(100);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    view.rerender(defaultSample(second, false));
    expect(screen.getByTestId("own").textContent).toBe("ab");
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("reserves a single phrase height and animates rotation with source distances", () => {
  vi.useFakeTimers();
  try {
    const view = render(
      <TextAnimation.Rotating
        text={["short", "a much longer phrase"]}
        duration={1000}
        delay={20}
      />
    );
    const rows = [
      ...document.querySelectorAll<HTMLElement>(".panel-text-phrase"),
    ];
    expect(rows).toHaveLength(2);
    expect(rows[1].dataset.taroStyle).toContain("44rpx");
    advance(1020);
    advance(300);
    expect(rows[1].getAttribute("aria-hidden")).toBe("false");
    expect(rows[1].dataset.taroStyle).toContain("0rpx");
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("counts using cubic-out rounded updates and labels the final value throughout", () => {
  vi.useFakeTimers();
  try {
    const view = render(
      <TextAnimation.Counting
        value={100}
        duration={1000}
        delay={100}
        data-testid="count"
      />
    );
    expect(screen.getByTestId("count").getAttribute("aria-label")).toBe("100");
    advance(100);
    advance(496);
    expect(Number(screen.getByTestId("count").textContent)).toBeGreaterThan(85);
    advance(504);
    expect(screen.getByTestId("count").textContent).toBe("100");
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("renders source odometer padding, grouping, fractional digits and relative transforms", () => {
  render(
    <PanelUIProvider reducedMotion>
      <TextAnimation.Sliding
        value={-1234.56}
        padStart={6}
        decimals={2}
        thousandSeparator=","
        decimalSeparator=","
      />
    </PanelUIProvider>
  );
  const digits = [
    ...document.querySelectorAll<HTMLElement>(".panel-text-digit"),
  ];
  expect(digits).toHaveLength(8);
  expect(digits[7].dataset.taroStyle).toContain("translateY(-60%)");
  expect(document.querySelector('[aria-label="-001234,56"]')).not.toBeNull();
  for (const digit of digits) {
    expect(digit.getAttribute("aria-hidden")).toBe("true");
  }
});
it("centres a numeric scale using hidden rows and same-color gradient fades", () => {
  render(
    <PanelUIProvider reducedMotion>
      <TextAnimation.Scrolling
        value={120}
        step={10}
        around={2}
        highlight
        fadeColor="#123456"
      />
    </PanelUIProvider>
  );
  const column = document.querySelector<HTMLElement>(".panel-text-scale");
  expect(column?.dataset.taroStyle).toContain(
    "translateY(-70.58823529411765%)"
  );
  expect(withAlpha("#123456", 0)).toBe("rgba(18, 52, 86, 0)");
  expect(withAlpha("#abc", 0.5)).toBe("rgba(170, 187, 204, 0.5)");
  expect(document.querySelector('[aria-label="120"]')).not.toBeNull();
  expect(
    [...document.querySelectorAll<HTMLElement>("[data-taro-style]")].some(
      (node) => node.dataset.taroStyle?.includes("linear-gradient")
    )
  ).toBe(true);
});
it("stops all five parts on reduced motion without leaving animation timers", () => {
  vi.useFakeTimers();
  try {
    render(
      <PanelUIProvider reducedMotion>
        <TextAnimation>
          <TextAnimation.Typing text="done" caret />
          <TextAnimation.Rotating text={["one", "two"]} />
          <TextAnimation.Counting value={14} />
          <TextAnimation.Sliding value={9} />
          <TextAnimation.Scrolling value={20} />
        </TextAnimation>
      </PanelUIProvider>
    );
    expect(screen.getByText("done")).toBeDefined();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("keeps a visible phrase when the rotating domain shrinks during a later turn", () => {
  vi.useFakeTimers();
  try {
    const view = render(
      <TextAnimation.Rotating text={["first", "second"]} duration={1000} />
    );
    advance(1000);
    advance(300);
    view.rerender(<TextAnimation.Rotating text={["solo"]} duration={1000} />);
    const phrase = document.querySelector(".panel-text-phrase");
    expect(phrase?.getAttribute("aria-hidden")).toBe("false");
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("reserves formatted multi-digit scale width instead of clipping it to one zero", () => {
  render(
    <PanelUIProvider reducedMotion>
      <TextAnimation.Scrolling value={120} step={10} />
    </PanelUIProvider>
  );
  const column = document.querySelector(".panel-text-scale");
  const sizer = column?.parentElement?.querySelector(".opacity-0");
  expect(sizer?.textContent).toBe("120".repeat(5));
});

it("retains only the pending typing timer across repeated loops", () => {
  vi.useFakeTimers();
  const clear = vi.spyOn(globalThis, "clearTimeout");
  try {
    const view = render(
      <TextAnimation.Typing text="x" loop duration={10} hold={10} />
    );
    advance(1000);
    const before = clear.mock.calls.length;
    view.unmount();
    expect(clear.mock.calls.length - before).toBeLessThanOrEqual(1);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    clear.mockRestore();
    vi.useRealTimers();
  }
});
