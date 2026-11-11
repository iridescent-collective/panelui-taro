// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { SectionRail } from "../src/components/SectionRail";
import type { SectionRailProps } from "../src/components/SectionRail";
import { proximityTo } from "../src/components/SectionRail/constants";
import { setElementMeasurement, vibrateShort } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const Rail = ({
  children: _children,
  ...props
}: Omit<SectionRailProps, "children"> & {
  children?: SectionRailProps["children"];
}) => (
  <SectionRail {...props}>
    <SectionRail.Trigger>
      <SectionRail.Bar value="intro" />
      <SectionRail.Bar value="setup" level={1} />
      <SectionRail.Bar value="finish" />
    </SectionRail.Trigger>
    <SectionRail.Content>
      <SectionRail.Item value="intro">Introduction</SectionRail.Item>
      <SectionRail.Item value="setup" level={1}>
        Setup
      </SectionRail.Item>
      <SectionRail.Item value="finish">Finish</SectionRail.Item>
    </SectionRail.Content>
  </SectionRail>
);
const draw = (value: string) => (
  <PanelUIProvider reducedMotion>
    <Rail open value={value} closeDelay={1000} haptics />
  </PanelUIProvider>
);
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
it("source rail proximity is restricted to immediate neighbours and wrapped bars fall back to selected", () => {
  expect(proximityTo("a", "b", ["a", "b", "c", "d"])).toBe(0.45);
  expect(proximityTo("b", "b", ["a", "b"])).toBe(1);
  expect(proximityTo("d", "b", ["a", "b", "c", "d"])).toBe(0);
  expect(proximityTo("b", "b", [])).toBe(1);
  expect(proximityTo("a", "b", [])).toBe(0);
});
it("collapsed rail preserves pointer pass-through, current bar silhouette and trigger expansion", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Rail id="rail" defaultValue="setup" offset={30} />
    </PanelUIProvider>
  );
  await settle();
  const root = document.querySelector("#rail");
  expect(readTaroStyle(root)).toContain('"pointerEvents":"none"');
  expect(readTaroStyle(root)).toContain('"right":"60rpx"');
  const trigger = screen.getByRole("button", { name: "Sections" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  const bars = [...trigger.querySelectorAll('[aria-hidden="true"]')];
  expect(
    bars
      .map((bar) => JSON.parse(readTaroStyle(bar) ?? "{}").width)
      .filter((width) => width !== undefined)
  ).toEqual(["37rpx", "42rpx", "37rpx"]);
  fireEvent.click(trigger);
  await settle();
  expect(screen.getByRole("menu")).toBeTruthy();
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
});
it("selecting a row changes the uncontrolled section then closes after its configured delay", async () => {
  vi.useFakeTimers();
  try {
    const change = vi.fn();
    const view = render(
      <PanelUIProvider reducedMotion>
        <Rail
          defaultOpen
          defaultValue="intro"
          closeDelay={100}
          onValueChange={change}
        />
      </PanelUIProvider>
    );
    await settle();
    fireEvent.click(screen.getByRole("menuitem", { name: "Setup" }));
    expect(change).toHaveBeenCalledExactlyOnceWith("setup");
    expect(
      screen
        .getByRole("menuitem", { name: "Setup" })
        .getAttribute("aria-selected")
    ).toBe("true");
    act(() => vi.advanceTimersByTime(99));
    expect(screen.getByRole("menu")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("menu")).toBeNull();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("controlled refusal keeps section and expansion while reporting both requested changes", async () => {
  const change = vi.fn();
  const open = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Rail
        open
        value="intro"
        closeDelay={0}
        onValueChange={change}
        onOpenChange={open}
      />
    </PanelUIProvider>
  );
  await settle();
  fireEvent.click(screen.getByRole("menuitem", { name: "Setup" }));
  expect(change).toHaveBeenCalledExactlyOnceWith("setup");
  expect(open).toHaveBeenCalledExactlyOnceWith(false);
  expect(
    screen
      .getByRole("menuitem", { name: "Introduction" })
      .getAttribute("aria-selected")
  ).toBe("true");
  expect(screen.getByRole("menu")).toBeTruthy();
});
it("jump transit and optimistic arrival tail are muted but ordinary subsequent scrolling ticks", async () => {
  vi.useFakeTimers();
  try {
    const view = render(draw("intro"));
    await settle();
    expect(vibrateShort).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Finish" }));
    view.rerender(draw("setup"));
    act(() => vi.advanceTimersByTime(0));
    expect(vibrateShort).not.toHaveBeenCalled();
    view.rerender(draw("finish"));
    act(() => vi.advanceTimersByTime(0));
    expect(vibrateShort).toHaveBeenCalledTimes(1);
    view.rerender(draw("setup"));
    view.rerender(draw("finish"));
    act(() => vi.advanceTimersByTime(259));
    expect(vibrateShort).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1));
    view.rerender(draw("setup"));
    act(() => vi.advanceTimersByTime(0));
    expect(vibrateShort).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("unreachable jumps expire after the source 900ms backstop", async () => {
  vi.useFakeTimers();
  try {
    const view = render(draw("intro"));
    await settle();
    fireEvent.click(screen.getByRole("menuitem", { name: "Finish" }));
    view.rerender(draw("setup"));
    act(() => vi.advanceTimersByTime(900));
    expect(vibrateShort).not.toHaveBeenCalled();
    view.rerender(draw("intro"));
    act(() => vi.advanceTimersByTime(0));
    expect(vibrateShort).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("RTL indentation uses the reading edge and root custom offset does not change the source panel offset", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <Rail defaultOpen placement="left" align="bottom" offset={40} />
      </Direction>
    </PanelUIProvider>
  );
  await settle();
  const item = screen.getByRole("menuitem", { name: "Setup" });
  expect(readTaroStyle(item)).toContain('"paddingRight":"40rpx"');
  expect(readTaroStyle(screen.getByRole("menu"))).toContain(
    '"minWidth":"368rpx"'
  );
  const floating = screen.getByRole("menu").parentElement?.parentElement;
  expect(readTaroStyle(floating)).toContain('"left":"24rpx"');
  expect(floating?.className).toContain("justify-end");
});
it("custom root geometry still preserves the source box-none touch behavior", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Rail id="custom-rail" style={{ width: "100rpx" }} />
    </PanelUIProvider>
  );
  await settle();
  const style = JSON.parse(
    readTaroStyle(document.querySelector("#custom-rail")) ?? "{}"
  );
  expect(style.pointerEvents).toBe("none");
  expect(style.width).toBe("100rpx");
  expect(style.top).toBeUndefined();
});
it("changing only the public panel style remeasures wrapped menu content", async () => {
  const items = (
    <SectionRail.Item value="intro">
      A section title that wraps at a narrower width
    </SectionRail.Item>
  );
  const drawPanel = (width: string) => (
    <PanelUIProvider reducedMotion>
      <SectionRail defaultOpen>
        <SectionRail.Content style={{ width }}>{items}</SectionRail.Content>
      </SectionRail>
    </PanelUIProvider>
  );
  const view = render(drawPanel("400rpx"));
  await settle();
  const measured = screen
    .getByRole("menu")
    .querySelector('[id^="panelui-measure-"]');
  if (!measured) {
    throw new Error("Menu content measurement missing");
  }
  setElementMeasurement(measured.id, {
    height: 80,
    left: 0,
    top: 0,
    width: 120,
  });
  view.rerender(drawPanel("240rpx"));
  await settle();
  expect(readTaroStyle(screen.getByRole("menu").firstElementChild)).toContain(
    '"height":"160rpx"'
  );
});
it("unmeasured native portal content uses intrinsic height instead of a full-screen initial viewport", async () => {
  setElementMeasurement("rail-panel-content", null);
  render(
    <PanelUIProvider reducedMotion>
      <SectionRail defaultOpen>
        <SectionRail.Content id="rail-panel">
          <SectionRail.Item value="intro">Introduction</SectionRail.Item>
        </SectionRail.Content>
      </SectionRail>
    </PanelUIProvider>
  );
  await settle();
  const style = JSON.parse(
    readTaroStyle(screen.getByRole("menu").firstElementChild) ?? "{}"
  );
  expect(style.height).toBe("auto");
  expect(style.maxHeight).toBeDefined();
});
