// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { Fragment } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Tabs } from "../src/components/Tabs";
import { collectPanels } from "../src/components/Tabs/collect-panels";
import {
  pagerTarget,
  usePagerDrag,
} from "../src/components/Tabs/use-pager-drag";
import { setElementMeasurement, setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const Panels = ({ keepMounted = false }: { keepMounted?: boolean }) => (
  <PanelUIProvider reducedMotion>
    <Tabs defaultValue="a" keepMounted={keepMounted}>
      <Tabs.List>
        <Tabs.Trigger value="a">页面 A</Tabs.Trigger>
        <Tabs.Trigger value="b">页面 B</Tabs.Trigger>
        <Tabs.Trigger value="c" disabled>
          页面 C
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">
        <input aria-label="练习内容" />
      </Tabs.Content>
      <Tabs.Content value="b">第二页</Tabs.Content>
    </Tabs>
  </PanelUIProvider>
);
it("source fixed panels unmount by default, disabled tabs stay inactive, and the indicator is shared", () => {
  const { container } = render(<Panels />);
  fireEvent.input(screen.getByLabelText("练习内容"), {
    target: { value: "已填写" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "页面 C" }));
  expect(
    screen.getByRole("tab", { name: "页面 A" }).getAttribute("aria-selected")
  ).toBe("true");
  fireEvent.click(screen.getByRole("tab", { name: "页面 B" }));
  expect(screen.queryByLabelText("练习内容")).toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: "页面 A" }));
  expect((screen.getByLabelText("练习内容") as HTMLInputElement).value).toBe(
    ""
  );
  expect(
    container.querySelectorAll('[role="tablist"] > [aria-hidden="true"]')
  ).toHaveLength(1);
});
it("kept panels preserve their input while hidden and controlled requests remain owned by the caller", () => {
  const change = vi.fn();
  const tree = render(<Panels keepMounted />);
  fireEvent.input(screen.getByLabelText("练习内容"), {
    target: { value: "保留内容" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "页面 B" }));
  expect(
    screen
      .getByLabelText("练习内容")
      .closest('[role="tabpanel"]')
      ?.getAttribute("aria-hidden")
  ).toBe("true");
  fireEvent.click(screen.getByRole("tab", { name: "页面 A" }));
  expect((screen.getByLabelText("练习内容") as HTMLInputElement).value).toBe(
    "保留内容"
  );
  tree.rerender(
    <PanelUIProvider reducedMotion>
      <Tabs value="a" defaultValue="a" onValueChange={change}>
        <Tabs.List>
          <Tabs.Trigger value="a">页面 A</Tabs.Trigger>
          <Tabs.Trigger value="b">页面 B</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("tab", { name: "页面 B" }));
  expect(change).toHaveBeenCalledWith("b");
  expect(
    screen.getByRole("tab", { name: "页面 A" }).getAttribute("aria-selected")
  ).toBe("true");
});
it("source panel collection descends through fragments while preserving other children", () => {
  const collected = collectPanels(
    <>
      <span>头部</span>
      <Fragment>
        <Tabs.Content value="a">A</Tabs.Content>
        <Tabs.Content value="b">B</Tabs.Content>
      </Fragment>
    </>
  );
  expect(collected.panels.map((panel) => panel.props.value)).toEqual([
    "a",
    "b",
  ]);
  expect(collected.rest).toHaveLength(1);
});
it("measured trigger geometry is relative to the same row snapshot", async () => {
  setTestMeasurement(300, 375);
  setElementMeasurement("tab-row", {
    height: 40,
    left: 10,
    top: 8,
    width: 300,
  });
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Tabs defaultValue="a">
        <Tabs.List id="tab-row">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    </PanelUIProvider>
  );
  const a = screen.getByRole("tab", { name: "A" });
  const b = screen.getByRole("tab", { name: "B" });
  setElementMeasurement(a.id, { height: 40, left: 30, top: 8, width: 100 });
  setElementMeasurement(b.id, { height: 40, left: 150, top: 8, width: 120 });
  const indicator = () =>
    readTaroStyle(container.querySelector('#tab-row > [aria-hidden="true"]'));
  await waitFor(() => expect(indicator()).toContain('"width":"200rpx"'));
  expect(indicator()).toContain("translateX(40rpx)");
  fireEvent.click(b);
  await waitFor(() => expect(indicator()).toContain("translateX(280rpx)"));
});
it("all expanding tab labels remain accessible when their visible width closes", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Tabs defaultValue="a" variant="expanding" size="xs">
        <Tabs.List>
          <Tabs.Trigger value="a" icon={<span aria-hidden>+</span>}>
            收件箱
          </Tabs.Trigger>
          <Tabs.Trigger value="b" icon={<span aria-hidden>+</span>}>
            归档
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    </PanelUIProvider>
  );
  expect(screen.getByRole("tab", { name: "归档" })).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "归档" }));
  expect(
    screen.getByRole("tab", { name: "归档" }).getAttribute("aria-selected")
  ).toBe("true");
});
it("source pager decisions prefer flick direction over conflicting distance", () => {
  expect(pagerTarget(1, 1.5, -600, 3)).toBe(0);
  expect(pagerTarget(1, 1.3, 0, 3)).toBe(2);
  expect(pagerTarget(0, -0.5, -600, 3)).toBe(0);
});
it("a short flick retains its last moving velocity at release", () => {
  vi.useFakeTimers();
  try {
    let position = 0;
    const select = vi.fn();
    const motion = {
      read: () => position,
      setImmediate: (value: number) => {
        position = value;
      },
      springTo: vi.fn(),
      value: 0,
    };
    const { result } = renderHook(() =>
      usePagerDrag({
        active: 0,
        count: 3,
        motion,
        onSelect: select,
        sign: 1,
        width: 300,
      })
    );
    act(() =>
      result.current.onTouchStart({
        touches: [{ clientX: 100, clientY: 20, identifier: 1 }],
      })
    );
    act(() => vi.advanceTimersByTime(16));
    act(() =>
      result.current.onTouchMove({
        touches: [{ clientX: 80, clientY: 20, identifier: 1 }],
      })
    );
    act(() => vi.advanceTimersByTime(5));
    act(() =>
      result.current.onTouchEnd({
        changedTouches: [{ clientX: 80, clientY: 20, identifier: 1 }],
      })
    );
    expect(select).toHaveBeenCalledWith(1);
  } finally {
    vi.useRealTimers();
  }
});
it("paged panels retain visited state and preload the adjacent panel without mounting every far panel", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Tabs defaultValue="a" swipeable>
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
          <Tabs.Trigger value="c">C</Tabs.Trigger>
          <Tabs.Trigger value="d">D</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">第一页</Tabs.Content>
        <Tabs.Content value="b">
          <input aria-label="相邻页" />
        </Tabs.Content>
        <Tabs.Content value="c">第三页</Tabs.Content>
        <Tabs.Content value="d">
          <input aria-label="远端页" />
        </Tabs.Content>
      </Tabs>
    </PanelUIProvider>
  );
  await screen.findByLabelText("相邻页");
  expect(screen.queryByLabelText("远端页")).toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: "D" }));
  const field = screen.getByLabelText<HTMLInputElement>("远端页");
  fireEvent.input(field, { target: { value: "保留远端状态" } });
  fireEvent.click(screen.getByRole("tab", { name: "A" }));
  expect(screen.getByLabelText<HTMLInputElement>("远端页").value).toBe(
    "保留远端状态"
  );
});
it("vertical intent and multiple pointers never claim or commit a panel swipe", () => {
  let position = 0;
  const select = vi.fn();
  const motion = {
    read: () => position,
    setImmediate: (next: number) => {
      position = next;
    },
    springTo: vi.fn(),
    value: 0,
  };
  const { result } = renderHook(() =>
    usePagerDrag({
      active: 0,
      count: 3,
      motion,
      onSelect: select,
      sign: 1,
      width: 300,
    })
  );
  act(() =>
    result.current.onTouchStart({
      touches: [{ clientX: 200, clientY: 20, identifier: 1 }],
    })
  );
  act(() =>
    result.current.onTouchMove({
      touches: [{ clientX: 100, clientY: 60, identifier: 1 }],
    })
  );
  act(() =>
    result.current.onTouchEnd({
      changedTouches: [{ clientX: 100, clientY: 60, identifier: 1 }],
    })
  );
  expect(select).not.toHaveBeenCalled();
  expect(position).toBe(0);
  act(() =>
    result.current.onTouchStart({
      touches: [
        { clientX: 200, clientY: 20, identifier: 1 },
        { clientX: 150, clientY: 20, identifier: 2 },
      ],
    })
  );
  act(() =>
    result.current.onTouchEnd({
      changedTouches: [{ clientX: 50, clientY: 20, identifier: 1 }],
    })
  );
  expect(select).not.toHaveBeenCalled();
});
it("RTL reverses the panel direction and cancellation settles on the caller-owned active panel", () => {
  let position = 0;
  const select = vi.fn();
  const motion = {
    read: () => position,
    setImmediate: (next: number) => {
      position = next;
    },
    springTo: vi.fn(),
    value: 0,
  };
  const { result } = renderHook(() =>
    usePagerDrag({
      active: 0,
      count: 3,
      motion,
      onSelect: select,
      sign: -1,
      width: 300,
    })
  );
  act(() =>
    result.current.onTouchStart({
      touches: [{ clientX: 100, clientY: 20, identifier: 1 }],
    })
  );
  act(() =>
    result.current.onTouchMove({
      touches: [{ clientX: 200, clientY: 20, identifier: 1 }],
    })
  );
  expect(position).toBeGreaterThan(0);
  act(() => result.current.onTouchCancel());
  expect(motion.springTo).toHaveBeenLastCalledWith(0);
  expect(select).not.toHaveBeenCalled();
});

it.each(["segmented", "underline", "pill", "expanding"] as const)(
  "%s merges caller colours after defaults and moves selected styles on selection",
  (variant) => {
    const { container } = render(
      <PanelUIProvider reducedMotion>
        <Tabs variant={variant} defaultValue="a">
          <Tabs.List indicatorClassName="bg-primary">
            {["a", "b"].map((value) => (
              <Tabs.Trigger
                key={value}
                value={value}
                icon={<span aria-hidden>+</span>}
                className="bg-muted"
                activeClassName="bg-primary"
                labelClassName="text-muted-foreground"
                activeLabelClassName="text-primary-foreground"
              >
                {value}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      </PanelUIProvider>
    );
    const a = screen.getByRole("tab", { name: "a" });
    const b = screen.getByRole("tab", { name: "b" });
    expect(a.className).toContain("bg-primary");
    expect(a.className).not.toContain("bg-muted");
    expect(screen.getAllByText("a")[0]?.className).toContain(
      "text-primary-foreground"
    );
    expect(screen.getAllByText("a")[0]?.className).not.toContain(
      "text-muted-foreground"
    );
    expect(screen.getAllByText("b")[0]?.className).toContain(
      "text-muted-foreground"
    );
    fireEvent.click(b);
    expect(a.className).not.toContain("bg-primary");
    expect(b.className).toContain("bg-primary");
    expect(screen.getAllByText("a")[0]?.className).toContain(
      "text-muted-foreground"
    );
    expect(screen.getAllByText("b")[0]?.className).toContain(
      "text-primary-foreground"
    );
    const indicator = container.querySelector(
      '[role="tablist"] > [aria-hidden="true"]'
    );
    if (variant === "expanding") {
      expect(indicator).toBeNull();
    } else {
      expect(indicator?.className).toContain("bg-primary");
    }
    expect(b.hasAttribute("activeclassname")).toBe(false);
  }
);
