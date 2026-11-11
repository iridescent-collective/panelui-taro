// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { ContextMenu } from "../src/components/ContextMenu";
import type { ContextMenuTriggerHandle } from "../src/components/ContextMenu";
import {
  contextMenuKeyInvocation,
  contextMenuAccessibilityInvocation,
} from "../src/components/ContextMenu/invocation";
import { usePopover } from "../src/components/Popover/context";
import { PanelUIProvider } from "../src/components/Provider";
import {
  setElementMeasurement,
  setTestMeasurement,
  vibrateShort,
} from "./taro-api";
import { readTaroStyle } from "./taro-style";

const TestGlyph = ({ color }: { color?: string }) => (
  <span data-testid="glyph" data-color={color} />
);

const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const node = () => {
  const element = document.querySelector<HTMLElement>("#context-target");
  if (!element) {
    throw new Error("Missing context target");
  }
  return element;
};
const touch = (x = 50, y = 70) => [{ clientX: x, clientY: y, identifier: 1 }];
const AnchorProbe = () => {
  const { open, trigger } = usePopover("probe");
  return (
    <>
      <span data-testid="context-open">{String(open)}</span>
      <span data-testid="context-anchor">{JSON.stringify(trigger)}</span>
    </>
  );
};
const harness = (
  props: React.ComponentProps<typeof ContextMenu.Trigger>,
  preview = false
) => (
  <PanelUIProvider reducedMotion>
    <ContextMenu>
      <ContextMenu.Trigger {...props} id="context-target" />
      <AnchorProbe />
      <ContextMenu.Content>
        {preview ? (
          <ContextMenu.Preview>
            <span data-testid="lifted">Preview content</span>
          </ContextMenu.Preview>
        ) : null}
        <ContextMenu.Item onSelect={vi.fn()}>Share</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  </PanelUIProvider>
);
it("short press and long hold are exclusive, including the native click callback", async () => {
  vi.useFakeTimers();
  try {
    const pressed = vi.fn();
    const clicked = vi.fn();
    render(harness({ children: "Target", onClick: clicked, onPress: pressed }));
    fireEvent.touchStart(node(), { touches: touch() });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.touchEnd(node());
    fireEvent.click(node());
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(clicked).toHaveBeenCalledTimes(1);
    fireEvent.touchStart(node(), { touches: touch() });
    act(() => vi.advanceTimersByTime(350));
    await settle();
    expect(screen.getByTestId("context-open").textContent).toBe("true");
    fireEvent.touchEnd(node());
    fireEvent.click(node());
    expect(pressed).toHaveBeenCalledTimes(1);
    expect(clicked).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});
it("movement, multitouch and cancellation reject the hold and following click", () => {
  vi.useFakeTimers();
  try {
    const pressed = vi.fn();
    render(harness({ children: "Target", onPress: pressed }));
    fireEvent.touchStart(node(), { touches: touch() });
    fireEvent.touchMove(node(), { touches: touch(70) });
    act(() => vi.advanceTimersByTime(400));
    fireEvent.touchEnd(node());
    fireEvent.click(node());
    expect(pressed).not.toHaveBeenCalled();
    expect(screen.getByTestId("context-open").textContent).toBe("false");
    fireEvent.touchStart(node(), {
      touches: [...touch(), { clientX: 50, clientY: 70, identifier: 2 }],
    });
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByTestId("context-open").textContent).toBe("false");
    fireEvent.touchStart(node(), { touches: touch() });
    fireEvent.touchCancel(node());
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByTestId("context-open").textContent).toBe("false");
  } finally {
    vi.useRealTimers();
  }
});
it("disabling a trigger cancels an in-flight measured open and reserved accessible actions", async () => {
  const ref = createRef<ContextMenuTriggerHandle>();
  const forwarded = vi.fn();
  const props = {
    children: "Target",
    haptics: true,
    onAccessibilityAction: forwarded,
    ref,
  };
  const view = render(harness(props));
  act(() => ref.current?.showMenu());
  view.rerender(harness({ ...props, disabled: true }));
  await settle();
  expect(screen.getByTestId("context-open").textContent).toBe("false");
  act(() =>
    ref.current?.handleAccessibilityAction({
      nativeEvent: { actionName: "activate" },
    })
  );
  act(() =>
    ref.current?.handleAccessibilityAction({
      nativeEvent: { actionName: "showMenu" },
    })
  );
  expect(forwarded).not.toHaveBeenCalled();
  expect(ref.current?.getAccessibilityActions()).toBeUndefined();
  act(() =>
    ref.current?.handleAccessibilityAction({
      nativeEvent: { actionName: "custom" },
    })
  );
  expect(forwarded).toHaveBeenCalledTimes(1);
  expect(vibrateShort).toHaveBeenCalledTimes(1);
});
it("target preview overrides point anchoring, keeps content inert and shares the menu context", async () => {
  const ref = createRef<ContextMenuTriggerHandle>();
  render(harness({ children: "Target", ref }, true));
  setElementMeasurement("context-target", {
    height: 80,
    left: 20,
    top: 100,
    width: 200,
  });
  act(() => ref.current?.showMenu());
  await settle();
  expect(screen.getByTestId("lifted")).toBeTruthy();
  const lifted = screen.getByTestId("lifted").parentElement;
  expect(lifted).not.toBeNull();
  const style = readTaroStyle(lifted as HTMLElement);
  if (!style) {
    throw new Error("Missing preview style");
  }
  expect(JSON.parse(style)).toMatchObject({
    left: "40rpx",
    pointerEvents: "none",
    top: "200rpx",
    transform: "scale(1.04)",
    width: "400rpx",
  });
  const anchor = JSON.parse(
    screen.getByTestId("context-anchor").textContent ?? "null"
  );
  expect(anchor.x).toBeCloseTo(16);
  expect(anchor.y).toBeCloseTo(98.4);
  expect(anchor.width).toBeCloseTo(208);
  expect(anchor.height).toBeCloseTo(83.2);
  expect(node().getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByText("Share"));
  await settle();
  expect(screen.getByTestId("context-open").textContent).toBe("false");
});
it("accessibility and key adapters retain source invocation and consumer prevention", async () => {
  const ref = createRef<ContextMenuTriggerHandle>();
  const press = vi.fn();
  const prevent = vi.fn();
  render(
    harness({
      accessibilityActions: [
        { label: "duplicate", name: "activate" },
        { name: "copy" },
      ],
      children: "Target",
      onPress: press,
      ref,
    })
  );
  expect(
    ref.current?.getAccessibilityActions()?.map((action) => action.name)
  ).toEqual(["activate", "showMenu", "copy"]);
  act(() => ref.current?.activate());
  expect(press).toHaveBeenCalledTimes(1);
  act(() =>
    ref.current?.handleKeyDown({
      isDefaultPrevented: () => false,
      nativeEvent: { key: "Enter" },
      preventDefault: prevent,
    })
  );
  expect(press).toHaveBeenCalledTimes(2);
  expect(prevent).toHaveBeenCalledTimes(1);
  act(() =>
    ref.current?.handleKeyDown({
      isDefaultPrevented: () => true,
      nativeEvent: { key: "ContextMenu" },
      preventDefault: prevent,
    })
  );
  await settle();
  expect(screen.getByTestId("context-open").textContent).toBe("false");
  act(() =>
    ref.current?.handleKeyDown({
      isDefaultPrevented: () => false,
      nativeEvent: { key: "F10", shiftKey: true },
      preventDefault: prevent,
    })
  );
  await settle();
  expect(screen.getByTestId("context-open").textContent).toBe("true");
});
it("key resolution and accessibility resolution follow upstream rules", () => {
  expect(
    contextMenuKeyInvocation({ key: "Enter", metaKey: true }, true, false)
  ).toBeUndefined();
  expect(
    contextMenuKeyInvocation({ key: " ", repeat: true }, true, false)
  ).toBeUndefined();
  expect(
    contextMenuKeyInvocation({ key: "ContextMenu" }, false, true)
  ).toBeUndefined();
  expect(contextMenuKeyInvocation({ key: "Enter" }, false, false)).toBe("menu");
  expect(contextMenuAccessibilityInvocation("activate", true, false)).toBe(
    "press"
  );
  expect(contextMenuAccessibilityInvocation("showMenu", true, false)).toBe(
    "menu"
  );
});
it("glyphs move to the trailing edge, inherit destructive tint and retain explicit color", () => {
  render(
    <PanelUIProvider>
      <ContextMenu>
        <ContextMenu.Item variant="destructive" icon={<TestGlyph />}>
          Remove
        </ContextMenu.Item>
        <ContextMenu.Item icon={<TestGlyph color="#123456" />}>
          Brand
        </ContextMenu.Item>
      </ContextMenu>
    </PanelUIProvider>
  );
  const icons = screen.getAllByTestId("glyph");
  expect(icons[0].dataset.color).toBe("#ef4444");
  expect(icons[1].dataset.color).toBe("#123456");
  expect(icons[0].previousElementSibling?.textContent).toBe("Remove");
});
it("measurements use current target bounds and missing targets never open", async () => {
  setTestMeasurement(40, 375);
  const ref = createRef<ContextMenuTriggerHandle>();
  render(harness({ children: "Target", ref }));
  setElementMeasurement("context-target", null);
  act(() => ref.current?.showMenu());
  await settle();
  expect(screen.getByTestId("context-open").textContent).toBe("false");
  setElementMeasurement("context-target", {
    height: 80,
    left: 20,
    top: 100,
    width: 200,
  });
  act(() => ref.current?.showMenu());
  await settle();
  expect(screen.getByTestId("context-open").textContent).toBe("true");
});

it("point opens use logical viewport coordinates and target opens use fresh measured bounds", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(40, 750);
    render(harness({ children: "Target" }));
    setElementMeasurement("context-target", {
      height: 160,
      left: 40,
      top: 200,
      width: 400,
    });
    fireEvent.touchStart(node(), { touches: touch(100, 140) });
    act(() => vi.advanceTimersByTime(350));
    await settle();
    expect(
      JSON.parse(screen.getByTestId("context-anchor").textContent ?? "null")
    ).toEqual({ height: 0, width: 0, x: 50, y: 70 });
  } finally {
    setTestMeasurement(40, 375);
    vi.useRealTimers();
  }
});
it("unmount drops pending holds and measured replies", async () => {
  vi.useFakeTimers();
  try {
    const opening = vi.fn();
    const ref = createRef<ContextMenuTriggerHandle>();
    const view = render(
      <PanelUIProvider>
        <ContextMenu onOpenChange={opening}>
          <ContextMenu.Trigger id="context-target" ref={ref}>
            Target
          </ContextMenu.Trigger>
        </ContextMenu>
      </PanelUIProvider>
    );
    fireEvent.touchStart(node(), { touches: touch() });
    act(() => ref.current?.showMenu());
    view.unmount();
    act(() => vi.advanceTimersByTime(400));
    await settle();
    expect(opening).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
it("content remains unmodified but cannot receive native pointer actions inside the trigger", () => {
  render(harness({ children: <button type="button">Nested target</button> }));
  const parent = screen.getByText("Nested target").parentElement;
  if (!parent) {
    throw new Error("Missing child interaction boundary");
  }
  expect(readTaroStyle(parent)).toContain('"pointerEvents":"none"');
});

it("the inert boundary creates no layout box between the caller's flex row and its children", () => {
  render(
    harness({
      children: (
        <>
          <span>Avatar</span>
          <span>Name</span>
        </>
      ),
      className: "flex flex-row items-center gap-[16px]",
      style: { justifyContent: "space-between" },
    })
  );
  const boundary = screen.getByText("Avatar").parentElement;
  if (!boundary) {
    throw new Error("Missing inert boundary");
  }
  expect(readTaroStyle(boundary)).toContain('"display":"contents"');
  expect(node().className).toContain("flex-row");
  expect(readTaroStyle(node())).toContain('"justifyContent":"space-between"');
});
