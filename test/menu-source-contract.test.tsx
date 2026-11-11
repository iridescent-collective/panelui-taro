// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import { Direction } from "../src/components/Direction";
import { Menu } from "../src/components/Menu";
import { PanelUIProvider } from "../src/components/Provider";
import { deferred } from "./helpers/deferred";
import { setElementMeasurement, vibrateShort } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const wrapper = (child: React.ReactNode, reduced = true) => (
  <PanelUIProvider reducedMotion={reduced}>{child}</PanelUIProvider>
);
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const node = (id: string) => {
  const element = document.querySelector<HTMLElement>(`#${id}`);
  if (!element) {
    throw new Error(`Missing ${id}`);
  }
  return element;
};
it("an action forwards press and selection in order, then requests menu close", () => {
  const events: string[] = [];
  render(
    wrapper(
      <Menu open onOpenChange={(open) => events.push(`open:${open}`)}>
        <Menu.Item
          id="menu-action"
          onPress={() => events.push("press")}
          onSelect={() => events.push("select")}
        >
          Rename
        </Menu.Item>
      </Menu>
    )
  );
  fireEvent.click(node("menu-action"));
  expect(events).toEqual(["press", "select", "open:false"]);
  expect(node("menu-action").getAttribute("role")).toBe("menuitem");
});
it("native onClick cannot bypass semantic selection and close", () => {
  const clicked = vi.fn();
  const selected = vi.fn();
  const opening = vi.fn();
  render(
    wrapper(
      <Menu onOpenChange={opening}>
        <Menu.Item id="native-action" onClick={clicked} onSelect={selected}>
          Duplicate
        </Menu.Item>
      </Menu>
    )
  );
  fireEvent.click(node("native-action"));
  expect(clicked).toHaveBeenCalledTimes(1);
  expect(selected).toHaveBeenCalledTimes(1);
  expect(opening).toHaveBeenCalledWith(false);
});
it("a disabled row cannot choose, close or vibrate, while closeOnSelect false retains the panel", () => {
  const selected = vi.fn();
  const opening = vi.fn();
  render(
    wrapper(
      <Menu haptics onOpenChange={opening}>
        <Menu.Item id="disabled-action" disabled onSelect={selected}>
          Disabled
        </Menu.Item>
        <Menu.Item id="keep-action" closeOnSelect={false} onSelect={selected}>
          Keep open
        </Menu.Item>
      </Menu>
    )
  );
  fireEvent.click(node("disabled-action"));
  expect(selected).not.toHaveBeenCalled();
  expect(opening).not.toHaveBeenCalled();
  expect(vibrateShort).not.toHaveBeenCalled();
  fireEvent.click(node("keep-action"));
  expect(selected).toHaveBeenCalledTimes(1);
  expect(opening).not.toHaveBeenCalled();
});
it("checkbox retains its indicator column, accepted check state and default nonclosing behavior", () => {
  const opening = vi.fn();
  const Harness = () => {
    const [checked, setChecked] = useState(false);
    return (
      <Menu onOpenChange={opening}>
        <Menu.CheckboxItem
          id="menu-check"
          checked={checked}
          onCheckedChange={setChecked}
        >
          Show details
        </Menu.CheckboxItem>
      </Menu>
    );
  };
  render(wrapper(<Harness />));
  const [, original] = node("menu-check").children;
  expect(readTaroStyle(original)).toContain("36rpx");
  expect(node("menu-check").getAttribute("aria-checked")).toBe("false");
  fireEvent.click(node("menu-check"));
  expect(node("menu-check").getAttribute("aria-checked")).toBe("true");
  expect(opening).not.toHaveBeenCalled();
  expect(node("menu-check").querySelector("img")).not.toBeNull();
});
it("a rejected controlled checkbox requests the opposite without showing unaccepted state", () => {
  const changed = vi.fn();
  render(
    wrapper(
      <Menu>
        <Menu.CheckboxItem
          id="controlled-check"
          checked={false}
          onCheckedChange={changed}
        >
          Fixed
        </Menu.CheckboxItem>
      </Menu>
    )
  );
  fireEvent.click(node("controlled-check"));
  expect(changed).toHaveBeenCalledWith(true);
  expect(node("controlled-check").getAttribute("aria-checked")).toBe("false");
});
it("radio check/dot follow group value, notify group before row callback and close by default", () => {
  const events: string[] = [];
  render(
    wrapper(
      <Menu onOpenChange={(open) => events.push(`open:${open}`)}>
        <Menu.RadioGroup
          value="a"
          onValueChange={(value) => events.push(`value:${value}`)}
        >
          <Menu.RadioItem id="radio-a" value="a" indicator="dot">
            A
          </Menu.RadioItem>
          <Menu.RadioItem
            id="radio-b"
            value="b"
            onSelect={() => events.push("select")}
          >
            B
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu>
    )
  );
  expect(node("radio-a").getAttribute("aria-selected")).toBe("true");
  expect(node("radio-b").getAttribute("aria-selected")).toBe("false");
  expect(readTaroStyle(node("radio-a").querySelector("img"))).toContain(
    "16rpx"
  );
  fireEvent.click(node("radio-b"));
  expect(events).toEqual(["value:b", "select", "open:false"]);
  expect(node("radio-b").getAttribute("aria-selected")).toBe("false");
});
it("source destructive/inset styles, leading descriptions, trailing and shortcuts are retained", () => {
  render(
    wrapper(
      <Menu>
        <Menu.Label inset>Actions</Menu.Label>
        <Menu.Item
          id="destructive-action"
          variant="destructive"
          inset
          description="Remove item"
          shortcut="⌘⌫"
          trailing={<span>Hint</span>}
        >
          Delete
        </Menu.Item>
        <Menu.Separator />
      </Menu>
    )
  );
  expect(node("destructive-action").className).toContain("ps-[76px]");
  expect(screen.getByText("Delete").className).toContain("--panel-destructive");
  expect(screen.getByText("Remove item")).not.toBeNull();
  expect(screen.getByText("⌘⌫")).not.toBeNull();
  expect(screen.getByText("Hint")).not.toBeNull();
});
it("haptic response does not delay an action or closing", async () => {
  const pending = deferred<{ errMsg: string }>();
  vibrateShort.mockReturnValueOnce(pending.promise);
  const selected = vi.fn();
  const opening = vi.fn();
  render(
    wrapper(
      <Menu haptics onOpenChange={opening}>
        <Menu.Item id="haptic-action" onSelect={selected}>
          Share
        </Menu.Item>
      </Menu>
    )
  );
  fireEvent.click(node("haptic-action"));
  expect(selected).toHaveBeenCalledTimes(1);
  expect(opening).toHaveBeenCalledWith(false);
  await act(async () => {
    pending.resolve({ errMsg: "vibrateShort:ok" });
    await pending.promise;
  });
});
it("press fill and scale match 90ms/160ms timing and clear on cancellation", () => {
  vi.useFakeTimers();
  render(
    wrapper(
      <Menu>
        <Menu.Item id="animated-menu">Animated</Menu.Item>
      </Menu>,
      false
    )
  );
  fireEvent.touchStart(node("animated-menu"));
  act(() => vi.advanceTimersByTime(90));
  expect(readTaroStyle(node("animated-menu"))).toContain("scale(0.98)");
  expect(readTaroStyle(node("animated-menu").firstElementChild)).toContain(
    '"opacity":1'
  );
  fireEvent.touchCancel(node("animated-menu"));
  act(() => vi.advanceTimersByTime(160));
  expect(readTaroStyle(node("animated-menu"))).toContain("scale(1)");
  vi.useRealTimers();
});
it("submenu measures natural content, keeps descendants mounted, hides closed interaction and expands without closing", async () => {
  setElementMeasurement("submenu-inner", {
    height: 88,
    left: 0,
    top: 0,
    width: 200,
  });
  const opening = vi.fn();
  render(
    wrapper(
      <Menu onOpenChange={opening}>
        <Menu.Sub>
          <Menu.SubTrigger id="submenu-trigger">More</Menu.SubTrigger>
          <Menu.SubContent id="submenu-inner">
            <Menu.Item id="submenu-child">Child</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu>
    )
  );
  await settle();
  expect(node("submenu-child")).not.toBeNull();
  expect(node("submenu-inner").parentElement?.getAttribute("aria-hidden")).toBe(
    "true"
  );
  fireEvent.click(node("submenu-trigger"));
  expect(opening).not.toHaveBeenCalled();
  expect(node("submenu-trigger").getAttribute("aria-expanded")).toBe("true");
  expect(readTaroStyle(node("submenu-inner").parentElement)).toContain(
    "176rpx"
  );
});
it("controlled submenu refuses expansion and RTL rotates the chevron through the negative quarter turn", () => {
  const opening = vi.fn();
  const tree = render(
    wrapper(
      <Direction dir="rtl">
        <Menu>
          <Menu.Sub open={false} onOpenChange={opening}>
            <Menu.SubTrigger id="rtl-sub">More</Menu.SubTrigger>
          </Menu.Sub>
        </Menu>
      </Direction>
    )
  );
  fireEvent.click(node("rtl-sub"));
  expect(opening).toHaveBeenCalledWith(true);
  expect(node("rtl-sub").getAttribute("aria-expanded")).toBe("false");
  tree.rerender(
    wrapper(
      <Direction dir="rtl">
        <Menu>
          <Menu.Sub open>
            <Menu.SubTrigger id="rtl-sub">More</Menu.SubTrigger>
          </Menu.Sub>
        </Menu>
      </Direction>
    )
  );
  expect(readTaroStyle(node("rtl-sub").lastElementChild)).toContain(
    "rotate(-90deg)"
  );
});
it("custom background is lifted outside the scrollable rows and menu context reaches portal actions", async () => {
  const opening = vi.fn();
  render(
    wrapper(
      <Menu open onOpenChange={opening}>
        <Menu.Trigger>
          <Button>Actions</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Background id="custom-menu-bg">
            <span>Background</span>
          </Menu.Background>
          <Menu.Item id="portalled-action">Portal action</Menu.Item>
        </Menu.Content>
      </Menu>
    )
  );
  await settle();
  expect(document.querySelectorAll("#custom-menu-bg")).toHaveLength(1);
  expect(node("custom-menu-bg").contains(node("portalled-action"))).toBe(false);
  fireEvent.click(node("portalled-action"));
  expect(opening).toHaveBeenCalledWith(false);
});
it("parts outside their contexts fail clearly instead of silently rendering broken actions", () => {
  expect(() => render(wrapper(<Menu.Item>Outside</Menu.Item>))).toThrow(
    "Menu.Item must be used within a <Menu>"
  );
  expect(() =>
    render(
      wrapper(
        <Menu>
          <Menu.RadioItem value="outside">Outside</Menu.RadioItem>
        </Menu>
      )
    )
  ).toThrow("Menu.RadioItem must be used within a <Menu.RadioGroup>");
});
it("the actual portalled container retains menu semantics instead of dialog", async () => {
  render(
    wrapper(
      <Menu open>
        <Menu.Trigger>
          <Button>Menu trigger</Button>
        </Menu.Trigger>
        <Menu.Content id="semantic-menu">
          <Menu.Item>Action</Menu.Item>
        </Menu.Content>
      </Menu>
    )
  );
  await settle();
  expect(node("semantic-menu").getAttribute("role")).toBe("menu");
  expect(node("semantic-menu").dataset.weappRole).toBe("menu");
});
it("submenu remeasures style-only layout changes with stable children", async () => {
  const children = <Menu.Item>Child</Menu.Item>;
  setElementMeasurement("styled-submenu", {
    height: 44,
    left: 0,
    top: 0,
    width: 200,
  });
  const tree = render(
    wrapper(
      <Menu>
        <Menu.Sub open>
          <Menu.SubContent id="styled-submenu" style={{ paddingBottom: 0 }}>
            {children}
          </Menu.SubContent>
        </Menu.Sub>
      </Menu>
    )
  );
  await settle();
  expect(readTaroStyle(node("styled-submenu").parentElement)).toContain(
    "88rpx"
  );
  setElementMeasurement("styled-submenu", {
    height: 84,
    left: 0,
    top: 0,
    width: 200,
  });
  tree.rerender(
    wrapper(
      <Menu>
        <Menu.Sub open>
          <Menu.SubContent
            id="styled-submenu"
            style={{ paddingBottom: "80rpx" }}
          >
            {children}
          </Menu.SubContent>
        </Menu.Sub>
      </Menu>
    )
  );
  await settle();
  expect(readTaroStyle(node("styled-submenu").parentElement)).toContain(
    "168rpx"
  );
});
it("a background retains a caller's string style while remaining decorative", () => {
  render(
    wrapper(
      <Menu.Background
        id="string-background"
        style="background-color:#123456"
      />
    )
  );
  expect(readTaroStyle(node("string-background"))).toContain(
    "background-color:#123456"
  );
  expect(readTaroStyle(node("string-background"))).toContain(
    "pointer-events:none"
  );
});
it("the native menu scroller receives an explicit height so long row lists can scroll", async () => {
  render(
    wrapper(
      <Menu open>
        <Menu.Trigger>
          <Button>Scrollable menu</Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Action</Menu.Item>
        </Menu.Content>
      </Menu>
    )
  );
  await settle();
  const scroller = document.querySelector(".min-h-0.shrink");
  expect(scroller).not.toBeNull();
  expect(readTaroStyle(scroller)).toMatch(/"height":/u);
});
it("menu headings and separators paint above the absolute background layer", () => {
  render(wrapper(<Menu.Label id="layer-label">Workspace</Menu.Label>));
  expect(node("layer-label").classList.contains("relative")).toBe(true);
});
it("the pressed fill stays below caller-provided trailing content", () => {
  render(
    wrapper(
      <Menu>
        <Menu.Item id="layer-row" trailing={<span>Trailing</span>}>
          Action
        </Menu.Item>
      </Menu>
    )
  );
  expect(readTaroStyle(node("layer-row").firstElementChild)).toContain(
    '"zIndex":-1'
  );
});
