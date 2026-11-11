// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { Collapsible } from "../src/components/Collapsible";
import { PanelUIProvider } from "../src/components/Provider";
import { setTestMeasurement } from "./taro-api";

const Stateful = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((value) => value + 1)}>次数 {count}</button>
  );
};
it("body remains mounted while closed and preserves its state across toggles", async () => {
  setTestMeasurement(40, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Collapsible>
        <Collapsible.Trigger>展开</Collapsible.Trigger>
        <Collapsible.Content>
          <Stateful />
        </Collapsible.Content>
      </Collapsible>
    </PanelUIProvider>
  );
  expect(screen.getByText("次数 0")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "展开" }));
  fireEvent.click(screen.getByRole("button", { name: "次数 0" }));
  fireEvent.click(screen.getByRole("button", { name: "展开" }));
  expect(screen.getByText("次数 1")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "展开" }).getAttribute("aria-expanded")
  ).toBe("false");
  await act(async () => {
    await Promise.resolve();
  });
});
it("controlled requests do not take ownership and disabled suppresses requests", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Collapsible open={false} onOpenChange={change}>
      <Collapsible.Trigger>展开</Collapsible.Trigger>
      <Collapsible.Content>内容</Collapsible.Content>
    </Collapsible>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
    "false"
  );
  change.mockClear();
  rerender(
    <Collapsible isDisabled onOpenChange={change}>
      <Collapsible.Trigger>展开</Collapsible.Trigger>
      <Collapsible.Content>内容</Collapsible.Content>
    </Collapsible>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(change).not.toHaveBeenCalled();
});
it("closing uses measured height, hides accessibility, and reopening releases numeric clipping", async () => {
  setTestMeasurement(40, 375);
  const { rerender } = render(
    <Collapsible defaultOpen>
      <Collapsible.Trigger>展开</Collapsible.Trigger>
      <Collapsible.Indicator />
      <Collapsible.Content>内容</Collapsible.Content>
    </Collapsible>
  );
  const body = screen.getByText("内容").parentElement;
  expect(body?.getAttribute("aria-hidden")).toBe("false");
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(body?.getAttribute("aria-hidden")).toBe("true"));
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() =>
    expect(
      body?.parentElement?.parentElement?.getAttribute("style")
    ).not.toContain("height:")
  );
  rerender(
    <Collapsible open>
      <Collapsible.Trigger>展开</Collapsible.Trigger>
    </Collapsible>
  );
});
