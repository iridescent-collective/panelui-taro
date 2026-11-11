// @vitest-environment happy-dom
import "./geometry-renderer";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { SectionProgress } from "../src/components/SectionProgress";
import type { SectionProgressProps } from "../src/components/SectionProgress";
import { useTimingNumber } from "../src/hooks/use-timing-number";
import { createObservableNumber } from "../src/primitives/observable-number";
import { vibrateShort } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const ViewLabel = () => <span>Custom label</span>;
const sections = (
  <>
    <SectionProgress.Item value="intro">Introduction</SectionProgress.Item>
    <SectionProgress.Item value="setup" color="primary">
      Setup
    </SectionProgress.Item>
  </>
);
const items = [
  <SectionProgress.Item key="intro" value="intro">
    Introduction
  </SectionProgress.Item>,
  <SectionProgress.Item key="setup" value="setup" color="primary">
    Setup
  </SectionProgress.Item>,
];
const draw = (props: Omit<SectionProgressProps, "children"> = {}) => (
  <PanelUIProvider reducedMotion>
    <SectionProgress {...props}>{items}</SectionProgress>
  </PanelUIProvider>
);
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const ring = () => {
  const image = document.querySelector("img");
  return decodeURIComponent(image?.getAttribute("src")?.split(",")[1] ?? "");
};
it("the first direct item labels the closed pill, a five-percent rounded reading and exact ring geometry", async () => {
  render(draw({ progress: 0.526 }));
  await settle();
  expect(
    screen.getByRole("button", { name: "Sections. Introduction. 55% read." })
  ).toBeTruthy();
  expect(ring()).toContain('r="9.75"');
  expect(ring()).toContain('stroke-width="2.5"');
  expect(ring()).toContain('transform="rotate(-90 11 11)"');
  expect(ring()).toContain(
    `stroke-dasharray="${2 * Math.PI * 9.75 * 0.526} ${2 * Math.PI * 9.75}"`
  );
});
it("source reads only direct Item elements, preserving a custom non-string label without a verbal title", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <SectionProgress revealAt={0}>
        {sections}
        <SectionProgress.Item value="custom">
          <ViewLabel />
        </SectionProgress.Item>
      </SectionProgress>
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByRole("button", { name: "Sections" })).toBeTruthy();
  expect(screen.getByText("Custom label")).toBeTruthy();
});
it("controlled scroll signals drive fill and the actual source reveal toggles below threshold", async () => {
  const scroll = {
    content: createObservableNumber(500),
    offset: createObservableNumber(),
    viewport: createObservableNumber(100),
  };
  render(draw({ id: "reading", scroll }));
  await settle();
  expect(document.querySelector("#reading")?.getAttribute("aria-hidden")).toBe(
    "true"
  );
  act(() => {
    scroll.offset.value = 200;
  });
  expect(
    screen.getByRole("button", { name: "Sections. Introduction. 50% read." })
  ).toBeTruthy();
  act(() => {
    scroll.offset.value = 0;
  });
  expect(document.querySelector("#reading")?.getAttribute("aria-hidden")).toBe(
    "true"
  );
});
it("explicit observable progress overrides scroll fraction and clamps both ends", async () => {
  const progress = createObservableNumber(2);
  const scroll = {
    content: createObservableNumber(100),
    offset: createObservableNumber(100),
    viewport: createObservableNumber(100),
  };
  render(draw({ progress, scroll }));
  await settle();
  expect(screen.getByRole("button", { name: /100% read/u })).toBeTruthy();
  act(() => {
    progress.value = -3;
  });
  expect(screen.getByRole("button", { name: /0% read/u })).toBeTruthy();
});
it("opening uses one card, intrinsically sized capped scroll list, selected item tint and immediate close", async () => {
  const changed = vi.fn();
  render(draw({ defaultValue: "intro", onValueChange: changed }));
  await settle();
  fireEvent.click(screen.getByRole("button", { name: /Sections\./u }));
  await settle();
  const menu = screen.getByRole("menu");
  const scroll = menu.firstElementChild;
  expect(readTaroStyle(scroll)).toContain('"maxHeight":"520rpx"');
  expect(readTaroStyle(scroll)).toContain('"height":"40rpx"');
  fireEvent.click(screen.getByRole("menuitem", { name: "Setup" }));
  expect(changed).toHaveBeenCalledWith("setup");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Sections. Setup. 0% read." })
  ).toBeTruthy();
});
it("controlled owners can refuse expansion and selection without changing accepted state", async () => {
  const opened = vi.fn();
  const changed = vi.fn();
  const view = render(
    draw({ onOpenChange: opened, open: false, value: "intro" })
  );
  await settle();
  fireEvent.click(screen.getByRole("button", { name: /Sections\./u }));
  expect(opened).toHaveBeenCalledWith(true);
  expect(screen.queryByRole("menu")).toBeNull();
  view.rerender(draw({ onValueChange: changed, open: true, value: "intro" }));
  await settle();
  fireEvent.click(screen.getByRole("menuitem", { name: "Setup" }));
  expect(changed).toHaveBeenCalledWith("setup");
  expect(
    screen
      .getByRole("menuitem", { name: "Introduction" })
      .getAttribute("aria-selected")
  ).toBe("true");
});
it.each([
  ["top-left", "items-start"],
  ["top-center", "items-center"],
  ["top-right", "items-end"],
  ["bottom-left", "items-start"],
  ["bottom-center", "items-center"],
  ["bottom-right", "items-end"],
] as const)(
  "placement %s aligns the card and puts the list on the correct side",
  async (placement, alignment) => {
    render(draw({ defaultOpen: true, id: "placement", placement }));
    await settle();
    const root = document.querySelector("#placement");
    expect(root?.className).toContain(alignment);
    expect(readTaroStyle(root)).toContain(
      placement.startsWith("top") ? "flex-start" : "flex-end"
    );
    const menu = screen.getByRole("menu");
    expect(menu.parentElement?.firstElementChild === menu).toBe(false);
    expect(menu.nextElementSibling === null).toBe(placement.startsWith("top"));
  }
);
it("a jump mutes intermediate sections, ticks once on arrival, and unmount clears the backstop", async () => {
  vi.useFakeTimers();
  try {
    const drawValue = (value: string) =>
      draw({ haptics: true, open: true, value });
    const view = render(drawValue("intro"));
    await settle();
    expect(vibrateShort).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Setup" }));
    view.rerender(drawValue("between"));
    act(() => vi.advanceTimersByTime(200));
    expect(vibrateShort).not.toHaveBeenCalled();
    view.rerender(drawValue("setup"));
    act(() => vi.advanceTimersByTime(1));
    expect(vibrateShort).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("timing reaches exact endpoints and interrupted motion starts from the last published frame", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(
      ({ target }) => useTimingNumber(target, 160, false, 0),
      { initialProps: { target: 1 } }
    );
    act(() => vi.advanceTimersByTime(80));
    expect(view.result.current).toBe(0.5);
    view.rerender({ target: 0 });
    expect(view.result.current).toBe(0.5);
    act(() => vi.advanceTimersByTime(80));
    expect(view.result.current).toBe(0.25);
    act(() => vi.advanceTimersByTime(80));
    expect(view.result.current).toBe(0);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("caller style replaces source root layout while the overlay keeps touch pass-through", async () => {
  render(
    draw({
      id: "custom-reading",
      style: { paddingTop: "0rpx", position: "relative" },
    })
  );
  await settle();
  const root = document.querySelector("#custom-reading");
  expect(readTaroStyle(root)).toContain('"position":"relative"');
  expect(readTaroStyle(root)).toContain('"paddingTop":"0rpx"');
  expect(readTaroStyle(root)).toContain('"pointerEvents":"none"');
  expect(readTaroStyle(root)).not.toContain('"inset"');
});
