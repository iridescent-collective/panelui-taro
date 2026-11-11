// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import {
  SelectionMode,
  useSelectionMode,
} from "../src/components/SelectionMode";
import {
  canEnterSelection,
  handleSelectionItemPress,
  selectAllValues,
  selectionOwnsPress,
  selectionTarget,
  selectValue,
  toggleValue,
} from "../src/components/SelectionMode/contracts";
import type { SelectionModeContextValue } from "../src/components/SelectionMode/types";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};
const read = (id: string) => {
  const node = document.querySelector(`#${id}`);
  if (!node) {
    throw new Error(`Missing ${id}`);
  }
  return node;
};
const Probe = ({
  onChange,
}: {
  onChange: (context: SelectionModeContextValue) => void;
}) => {
  const context = useSelectionMode();
  useEffect(() => {
    onChange(context);
  }, [context, onChange]);
  return (
    <output id="selection-result">
      {JSON.stringify({
        active: context.active,
        all: context.allSelected,
        count: context.count,
        selected: context.selected,
        sheet: context.sheet,
        total: context.total,
      })}
    </output>
  );
};
it("preserves the source set/cap contracts including invalid caps, duplicate entry and identity on rejection", () => {
  const selected = ["a"];
  expect(selectValue(selected, "a", 2)).toBe(selected);
  expect(selectValue(selected, "b", 1)).toBe(selected);
  expect(selectValue(selected, "b", 2)).toEqual(["a", "b"]);
  expect(toggleValue(selected, "a", 0)).toEqual([]);
  for (const cap of [-1, Number.NaN, -Infinity, 0]) {
    expect(selectValue([], "a", cap)).toEqual([]);
  }
  expect(selectAllValues(["a", "b", "c"], 2.9)).toEqual(["a", "b"]);
  expect(selectionTarget(3, 2)).toBe(2);
  expect(selectionTarget(0)).toBe(0);
  expect(selectValue([], "a", Infinity)).toEqual(["a"]);
});
it("only active eligible rows own presses and only inactive eligible screen rows enter by long press", () => {
  const toggle = vi.fn();
  const action = vi.fn();
  expect(selectionOwnsPress(true, true)).toBe(false);
  handleSelectionItemPress(true, true, toggle, action);
  handleSelectionItemPress(true, false, toggle, action);
  expect(toggle).toHaveBeenCalledOnce();
  expect(action).toHaveBeenCalledOnce();
  expect(canEnterSelection(false, false, false)).toBe(true);
  expect(canEnterSelection(false, true, false)).toBe(false);
  expect(canEnterSelection(true, false, false)).toBe(false);
  expect(canEnterSelection(false, false, true)).toBe(false);
});
it("long press picks the entering row, taps toggle, excluded rows keep their own action and cancel clears", async () => {
  const ordinary = vi.fn();
  const excluded = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode values={["a", "b"]}>
        <SelectionMode.Header />
        <SelectionMode.Item id="selection-a" value="a" onPress={ordinary}>
          Alpha
        </SelectionMode.Item>
        <SelectionMode.Item id="selection-b" value="b">
          Beta
        </SelectionMode.Item>
        <SelectionMode.Item
          id="selection-disabled"
          value="header"
          disabled
          onPress={excluded}
        >
          More
        </SelectionMode.Item>
      </SelectionMode>
    </PanelUIProvider>
  );
  fireEvent.click(read("selection-a"));
  expect(ordinary).toHaveBeenCalledOnce();
  act(() => dispatchTaroEvent(read("selection-a"), TARO_TEST_EVENTS.longPress));
  await settle();
  expect(read("selection-a").getAttribute("role")).toBe("checkbox");
  expect(read("selection-a").getAttribute("aria-checked")).toBe("true");
  fireEvent.click(read("selection-b"));
  await settle();
  expect(read("selection-b").getAttribute("aria-checked")).toBe("true");
  fireEvent.click(read("selection-disabled"));
  expect(excluded).toHaveBeenCalledOnce();
  expect(read("selection-disabled").getAttribute("role")).toBe("button");
  fireEvent.click(screen.getByRole("button", { name: "Cancel selection" }));
  await settle();
  expect(read("selection-a").getAttribute("role")).toBe("button");
  expect(read("selection-a").getAttribute("aria-checked")).toBeNull();
});
it("select-all respects the cap, switches to clear and does not invent a selectable total", async () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode
        defaultActive
        values={["a", "b", "c"]}
        max={2}
        onSelectedChange={changed}
      >
        <SelectionMode.Header />
      </SelectionMode>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Select all" }));
  await settle();
  expect(changed).toHaveBeenLastCalledWith(["a", "b"]);
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  await settle();
  expect(changed).toHaveBeenLastCalledWith([]);
});
it("controlled parents can reject both entry and selected requests", async () => {
  const active = vi.fn();
  const selected = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode
        active={false}
        selected={[]}
        onActiveChange={active}
        onSelectedChange={selected}
      >
        <SelectionMode.Item id="refused-row" value="a">
          Alpha
        </SelectionMode.Item>
      </SelectionMode>
    </PanelUIProvider>
  );
  act(() => dispatchTaroEvent(read("refused-row"), TARO_TEST_EVENTS.longPress));
  await settle();
  expect(active).toHaveBeenCalledWith(true);
  expect(selected).toHaveBeenCalledWith(["a"]);
  expect(read("refused-row").getAttribute("role")).toBe("button");
});
it("actions receive accepted ids, stay disabled when empty, and optionally exit after acting", async () => {
  const action = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode defaultActive defaultSelected={["a"]}>
        <SelectionMode.Bar>
          <SelectionMode.Action
            id="selection-action"
            onPress={action}
            exitOnPress
          >
            Send
          </SelectionMode.Action>
        </SelectionMode.Bar>
        <SelectionMode.Item id="action-row" value="a">
          Alpha
        </SelectionMode.Item>
      </SelectionMode>
    </PanelUIProvider>
  );
  fireEvent.click(read("selection-action"));
  await settle();
  expect(action).toHaveBeenCalledExactlyOnceWith(["a"]);
  expect(read("action-row").getAttribute("role")).toBe("button");
});
it("ring and none avoid a leading indicator and selection is independent from row layout", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode defaultActive defaultSelected={["a"]}>
        <SelectionMode.Group columns={2} gap={12} label="Colours">
          <SelectionMode.Item id="ring-row" value="a" indicator="ring">
            Red
          </SelectionMode.Item>
          <SelectionMode.Item id="none-row" value="b" indicator="none">
            Blue
          </SelectionMode.Item>
        </SelectionMode.Group>
      </SelectionMode>
    </PanelUIProvider>
  );
  expect(read("ring-row").firstElementChild?.className).toContain(
    "border-[var(--panel-foreground)]"
  );
  expect(read("none-row").querySelector("svg")).toBeNull();
  expect(screen.getByText("Colours")).toBeTruthy();
  fireEvent.click(read("none-row"));
  await settle();
  expect(read("none-row").getAttribute("aria-checked")).toBe("true");
});
it("horizontal strips take precedence over columns with fixed item widths and gaps", () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SelectionMode>
        <SelectionMode.Group
          id="selection-strip"
          horizontal
          columns={3}
          itemWidth={44}
          gap={12}
        >
          <SelectionMode.Item value="a" indicator="none">
            A
          </SelectionMode.Item>
          <SelectionMode.Item value="b" indicator="none">
            B
          </SelectionMode.Item>
        </SelectionMode.Group>
      </SelectionMode>
    </PanelUIProvider>
  );
  const strip = tree.container.querySelector<HTMLElement>("#selection-strip");
  expect(strip?.dataset.taroScrollX).toBe("true");
  expect(readTaroStyle(strip?.firstElementChild)).toContain('"gap":"24rpx"');
  expect(readTaroStyle(strip?.firstElementChild?.firstElementChild)).toContain(
    '"width":"88rpx"'
  );
});
it("a picker sheet selects immediately and lifts only the direct Bar into the footer", async () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode values={["a", "b"]} onSelectedChange={changed}>
        <SelectionMode.Sheet defaultOpen title="Share" size="auto">
          <SelectionMode.Item id="sheet-choice" value="a">
            Alpha
          </SelectionMode.Item>
          <SelectionMode.Bar>
            <SelectionMode.Action id="sheet-send">Send</SelectionMode.Action>
          </SelectionMode.Bar>
        </SelectionMode.Sheet>
      </SelectionMode>
    </PanelUIProvider>
  );
  await settle();
  expect(read("sheet-choice").getAttribute("role")).toBe("checkbox");
  expect(screen.queryByRole("button", { name: "Cancel selection" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  fireEvent.click(read("sheet-choice"));
  await settle();
  expect(changed).toHaveBeenLastCalledWith(["a"]);
  expect(read("sheet-send").getAttribute("aria-disabled")).toBe("false");
});
it("batched uncontrolled additions read each preceding selection rather than losing ids", async () => {
  let context: SelectionModeContextValue | undefined;
  const ready = (value: SelectionModeContextValue) => {
    context = value;
  };
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode defaultActive>
        <Probe onChange={ready} />
      </SelectionMode>
    </PanelUIProvider>
  );
  if (!context) {
    throw new Error("No selection context");
  }
  const selection = context;
  await act(async () => {
    await selection.toggle("a");
    await selection.toggle("b");
  });
  expect(read("selection-result").textContent).toContain(
    '"selected":["a","b"]'
  );
});
it("an inactive action bar does not allocate an exit clock before ever being visible", () => {
  vi.useFakeTimers();
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SelectionMode>
        <SelectionMode.Bar>
          <SelectionMode.Action>Send</SelectionMode.Action>
        </SelectionMode.Bar>
      </SelectionMode>
    </PanelUIProvider>
  );
  expect(vi.getTimerCount()).toBe(0);
  tree.unmount();
  vi.useRealTimers();
});
it("a capped row can be removed but a new row cannot cross the selection limit", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode defaultActive defaultSelected={["a"]} max={1}>
        <SelectionMode.Item id="cap-a" value="a">
          A
        </SelectionMode.Item>
        <SelectionMode.Item id="cap-b" value="b">
          B
        </SelectionMode.Item>
      </SelectionMode>
    </PanelUIProvider>
  );
  fireEvent.click(read("cap-b"));
  await settle();
  expect(read("cap-b").getAttribute("aria-checked")).toBe("false");
  fireEvent.click(read("cap-a"));
  await settle();
  expect(read("cap-a").getAttribute("aria-checked")).toBe("false");
  fireEvent.click(read("cap-b"));
  await settle();
  expect(read("cap-b").getAttribute("aria-checked")).toBe("true");
});
it("controlled rejection continues to draw accepted ticks and actions receive the accepted selection", async () => {
  const request = vi.fn();
  const action = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SelectionMode active selected={["a"]} onSelectedChange={request}>
        <SelectionMode.Item id="controlled-b" value="b">
          B
        </SelectionMode.Item>
        <SelectionMode.Action id="controlled-action" onPress={action}>
          Send
        </SelectionMode.Action>
      </SelectionMode>
    </PanelUIProvider>
  );
  fireEvent.click(read("controlled-b"));
  await settle();
  expect(request).toHaveBeenLastCalledWith(["a", "b"]);
  expect(read("controlled-b").getAttribute("aria-checked")).toBe("false");
  fireEvent.click(read("controlled-action"));
  expect(action).toHaveBeenCalledWith(["a"]);
});
it("latest callbacks receive changes after a root rerender without remounting row content", async () => {
  const previous = vi.fn();
  const latest = vi.fn();
  const child = (
    <SelectionMode.Item id="latest-row" value="a">
      <input defaultValue="Retained" />
    </SelectionMode.Item>
  );
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SelectionMode defaultActive onSelectedChange={previous}>
        {child}
      </SelectionMode>
    </PanelUIProvider>
  );
  const input = screen.getByDisplayValue("Retained");
  tree.rerender(
    <PanelUIProvider reducedMotion>
      <SelectionMode defaultActive onSelectedChange={latest}>
        {child}
      </SelectionMode>
    </PanelUIProvider>
  );
  fireEvent.click(read("latest-row"));
  await settle();
  expect(previous).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledWith(["a"]);
  expect(screen.getByDisplayValue("Retained")).toBe(input);
});
it("explicitly keyed group items retain local content when the list reorders", () => {
  const first = (
    <SelectionMode.Item key="a" value="a" indicator="none">
      <input defaultValue="First" />
    </SelectionMode.Item>
  );
  const second = (
    <SelectionMode.Item key="b" value="b" indicator="none">
      <input defaultValue="Second" />
    </SelectionMode.Item>
  );
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SelectionMode>
        <SelectionMode.Group>
          {first}
          {second}
        </SelectionMode.Group>
      </SelectionMode>
    </PanelUIProvider>
  );
  const input = screen.getByDisplayValue("First");
  fireEvent.change(input, { target: { value: "Edited" } });
  tree.rerender(
    <PanelUIProvider reducedMotion>
      <SelectionMode>
        <SelectionMode.Group>
          {second}
          {first}
        </SelectionMode.Group>
      </SelectionMode>
    </PanelUIProvider>
  );
  expect(screen.getByDisplayValue("Edited")).toBe(input);
});
it("native click actions retain exitOnPress and inactive actions refuse clicks", async () => {
  const click = vi.fn();
  const active = vi.fn();
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SelectionMode
        defaultActive
        defaultSelected={["a"]}
        onActiveChange={active}
      >
        <SelectionMode.Action id="native-action" onClick={click} exitOnPress>
          Send
        </SelectionMode.Action>
      </SelectionMode>
    </PanelUIProvider>
  );
  fireEvent.click(read("native-action"));
  await settle();
  expect(click).toHaveBeenCalledOnce();
  expect(active).toHaveBeenLastCalledWith(false);
  fireEvent.click(read("native-action"));
  expect(click).toHaveBeenCalledOnce();
  tree.unmount();
});
it("native back exits selection and clears owned ids before returning to page navigation", async () => {
  const active = vi.fn();
  const selected = vi.fn();
  const tree = render(
    <PanelUIProvider reducedMotion>
      <SelectionMode
        defaultActive
        defaultSelected={["a"]}
        onActiveChange={active}
        onSelectedChange={selected}
      >
        <SelectionMode.Item id="back-row" value="a">
          A
        </SelectionMode.Item>
      </SelectionMode>
    </PanelUIProvider>
  );
  const guard = tree.container.querySelector("section");
  if (!guard) {
    throw new Error("Missing native back owner");
  }
  act(() => dispatchTaroEvent(guard, TARO_TEST_EVENTS.beforeLeave, {}));
  await settle();
  expect(active).toHaveBeenCalledWith(false);
  expect(selected).toHaveBeenCalledWith([]);
  expect(read("back-row").getAttribute("role")).toBe("button");
});
it("floating bars preserve exit geometry for 180ms but stop taking presses immediately", async () => {
  vi.useFakeTimers();
  let context: SelectionModeContextValue | undefined;
  const ready = (value: SelectionModeContextValue) => {
    context = value;
  };
  const tree = render(
    <PanelUIProvider>
      <SelectionMode defaultActive defaultSelected={["a"]}>
        <Probe onChange={ready} />
        <SelectionMode.Bar id="animated-bar" placement="floating" inset={20}>
          <SelectionMode.Action>Send</SelectionMode.Action>
        </SelectionMode.Bar>
      </SelectionMode>
    </PanelUIProvider>
  );
  await settle();
  act(() => vi.advanceTimersByTime(220));
  const bar = read("animated-bar");
  expect(readTaroStyle(bar)).toContain('"bottom":"40rpx"');
  if (!context) {
    throw new Error("No selection context");
  }
  const selection = context;
  act(() => selection.exit());
  expect(readTaroStyle(bar)).toContain('"pointerEvents":"none"');
  act(() => vi.advanceTimersByTime(179));
  expect(tree.container.querySelector("#animated-bar")).toBe(bar);
  act(() => vi.advanceTimersByTime(1));
  expect(tree.container.querySelector("#animated-bar")).toBeNull();
  tree.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("header end slots retain Yoga column direction so All aligns to the trailing edge", () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    render(
      <PanelUIProvider reducedMotion>
        <SelectionMode active values={["a"]}>
          <SelectionMode.Header />
        </SelectionMode>
      </PanelUIProvider>
    );
    for (const name of ["Cancel selection", "Select all"]) {
      const slot = screen.getByRole("button", { name }).parentElement;
      expect(getComputedStyle(slot as Element).flexDirection).toBe("column");
    }
  } finally {
    style.remove();
  }
});
