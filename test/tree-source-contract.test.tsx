// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { Tree } from "../src/components/Tree";
import { readTaroStyle } from "./taro-style";

const Branch = () => (
  <Tree.Item value="parent">
    <Tree.Trigger aria-label="Parent">
      <Tree.Indicator />
      <Tree.Label>Parent</Tree.Label>
    </Tree.Trigger>
    <Tree.Group>
      <Tree.Item value="leaf">
        <Tree.Trigger aria-label="Leaf">
          <Tree.Indicator />
          <Tree.Label>Leaf</Tree.Label>
        </Tree.Trigger>
      </Tree.Item>
    </Tree.Group>
  </Tree.Item>
);
it("discovers groups, expands and selects independently, and announces actual depth", async () => {
  const change = vi.fn();
  const expansion = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tree
        selectionMode="single"
        onValueChange={change}
        onExpandedChange={expansion}
      >
        <Branch />
      </Tree>
    </PanelUIProvider>
  );
  expect(screen.queryByLabelText("Leaf")).toBeNull();
  fireEvent.click(screen.getByLabelText("Expand"));
  expect(expansion).toHaveBeenCalledWith(["parent"]);
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Leaf").getAttribute("aria-level")).toBe("2");
  fireEvent.click(screen.getByLabelText("Leaf"));
  expect(change).toHaveBeenCalledWith("leaf");
  fireEvent.click(screen.getByLabelText("Collapse"));
  await waitFor(() => expect(screen.queryByLabelText("Leaf")).toBeNull());
});
it("multiple selection toggles while controlled expansion and selection can refuse", () => {
  const change = vi.fn();
  const expansion = vi.fn();
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <Tree
        value={["leaf"]}
        selectionMode="multiple"
        expanded={[]}
        onValueChange={change}
        onExpandedChange={expansion}
      >
        <Branch />
      </Tree>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Parent"));
  expect(expansion).toHaveBeenCalledWith(["parent"]);
  expect(change).toHaveBeenCalledWith(["leaf", "parent"]);
  expect(screen.queryByLabelText("Leaf")).toBeNull();
  expect(screen.getByLabelText("Parent").getAttribute("aria-selected")).toBe(
    "false"
  );
  rerender(
    <PanelUIProvider reducedMotion>
      <Tree
        key="uncontrolled"
        selectionMode="multiple"
        defaultExpanded={["parent"]}
        defaultValue={["leaf"]}
        onValueChange={change}
      >
        <Branch />
      </Tree>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Leaf"));
  expect(change).toHaveBeenLastCalledWith([]);
});
it("disabled items dominate triggers and lazy branches open without a group", () => {
  const expansion = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tree onExpandedChange={expansion}>
        <Tree.Item value="disabled" hasChildren isDisabled>
          <Tree.Trigger accessibilityLabel="Disabled" disabled={false}>
            <Tree.Indicator />
            <Tree.Label>Disabled</Tree.Label>
          </Tree.Trigger>
        </Tree.Item>
        <Tree.Item value="lazy" hasChildren>
          <Tree.Trigger accessibilityLabel="Lazy">
            <Tree.Label>Lazy</Tree.Label>
          </Tree.Trigger>
        </Tree.Item>
      </Tree>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Disabled"));
  expect(expansion).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText("Lazy"));
  expect(expansion).toHaveBeenCalledWith(["lazy"]);
});
it("native trigger callbacks run after state requests and expandOnPress false preserves arrow opening", () => {
  const change = vi.fn();
  const press = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tree expandOnPress={false} selectionMode="single" onValueChange={change}>
        <Tree.Item value="a" hasChildren>
          <Tree.Trigger onClick={press} accessibilityLabel="Row">
            <Tree.Indicator />
            <Tree.Label>Row</Tree.Label>
          </Tree.Trigger>
        </Tree.Item>
      </Tree>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Row"));
  expect(change).toHaveBeenCalledWith("a");
  expect(press).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("Row").getAttribute("aria-expanded")).toBe(
    "false"
  );
  fireEvent.click(screen.getByLabelText("Expand"));
  expect(screen.getByLabelText("Row").getAttribute("aria-expanded")).toBe(
    "true"
  );
  expect(press).toHaveBeenCalledTimes(1);
});
it("RTL uses the start-side guide and rotates disclosure downwards", () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <Tree showLines indent={20} defaultExpanded={["parent"]}>
          <Branch />
        </Tree>
      </Direction>
    </PanelUIProvider>
  );
  const group = [...container.querySelectorAll("div")].find((element) =>
    readTaroStyle(element)?.includes('"borderRightWidth":"2rpx"')
  );
  expect(readTaroStyle(group)).toContain('"paddingRight":"20rpx"');
  expect(readTaroStyle(group)).toContain('"marginRight":"20rpx"');
  expect(container.querySelector('div[style*="rotate(-90deg)"]')).toBeTruthy();
});
const MountProbe = ({
  onMount,
  onUnmount,
}: {
  onMount: () => void;
  onUnmount: () => void;
}) => {
  useEffect(() => {
    onMount();
    return onUnmount;
  }, [onMount, onUnmount]);
  return <span>Expensive child</span>;
};
it("never renders closed descendants and releases them after the closing transition", async () => {
  const mount = vi.fn();
  const unmount = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tree>
        <Tree.Item value="a">
          <Tree.Trigger accessibilityLabel="Branch">
            <Tree.Indicator />
          </Tree.Trigger>
          <Tree.Group>
            <MountProbe onMount={mount} onUnmount={unmount} />
          </Tree.Group>
        </Tree.Item>
      </Tree>
    </PanelUIProvider>
  );
  expect(mount).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText("Expand"));
  expect(mount).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByLabelText("Collapse"));
  await waitFor(() => expect(unmount).toHaveBeenCalledTimes(1));
});
it("trailing actions consume their press without selecting or expanding the row", () => {
  const selection = vi.fn();
  const action = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tree selectionMode="single" onValueChange={selection}>
        <Tree.Item value="a" hasChildren>
          <Tree.Trigger accessibilityLabel="Row action">
            <Tree.Label>Row action</Tree.Label>
            <Tree.Actions>
              <button onClick={action}>Trailing action</button>
            </Tree.Actions>
          </Tree.Trigger>
        </Tree.Item>
      </Tree>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("Trailing action"));
  expect(action).toHaveBeenCalledTimes(1);
  expect(selection).not.toHaveBeenCalled();
  expect(
    screen.getByLabelText("Row action").getAttribute("aria-expanded")
  ).toBe("false");
});
