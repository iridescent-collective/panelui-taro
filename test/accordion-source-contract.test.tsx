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

import { Accordion } from "../src/components/Accordion";

const BodyState = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((value) => value + 1)}>状态 {count}</button>
  );
};
const Section = ({ value }: { value: string }) => (
  <Accordion.Item value={value}>
    <Accordion.Trigger>{value}</Accordion.Trigger>
    <Accordion.Content>{`${value}正文`}</Accordion.Content>
  </Accordion.Item>
);
it("single selection reports strings, closes siblings, and clears an open item", async () => {
  const change = vi.fn();
  render(
    <Accordion defaultValue="甲" onValueChange={change}>
      <Section value="甲" />
      <Section value="乙" />
    </Accordion>
  );
  fireEvent.click(screen.getByRole("button", { name: "乙" }));
  expect(change).toHaveBeenLastCalledWith("乙");
  await waitFor(() => expect(screen.queryByText("甲正文")).toBeNull());
  expect(screen.getByText("乙正文")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "乙" }));
  expect(change).toHaveBeenLastCalledWith("");
});
it("multiple selection reports arrays and controlled ownership remains with the parent", () => {
  const change = vi.fn();
  render(
    <Accordion selectionMode="multiple" value={["甲"]} onValueChange={change}>
      <Section value="甲" />
      <Section value="乙" />
    </Accordion>
  );
  fireEvent.click(screen.getByRole("button", { name: "乙" }));
  expect(change).toHaveBeenCalledWith(["甲", "乙"]);
  expect(screen.queryByText("乙正文")).toBeNull();
});
it("default unmount resets body state; keepMounted overrides preserve it", async () => {
  const { rerender } = render(
    <Accordion defaultValue="a">
      <Accordion.Item value="a">
        <Accordion.Trigger>展开</Accordion.Trigger>
        <Accordion.Content>
          <BodyState />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
  fireEvent.click(screen.getByRole("button", { name: "状态 0" }));
  fireEvent.click(screen.getByRole("button", { name: "展开" }));
  expect(screen.getByText("状态 1")).toBeTruthy();
  await waitFor(() => expect(screen.queryByText("状态 1")).toBeNull());
  fireEvent.click(screen.getByRole("button", { name: "展开" }));
  expect(screen.getByText("状态 0")).toBeTruthy();
  rerender(
    <Accordion keepMounted defaultValue="a">
      <Accordion.Item value="a">
        <Accordion.Trigger>展开</Accordion.Trigger>
        <Accordion.Content>
          <BodyState />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
  fireEvent.click(screen.getByRole("button", { name: "状态 0" }));
  fireEvent.click(screen.getByRole("button", { name: "展开" }));
  expect(screen.getByText("状态 1")).toBeTruthy();
});
it("disabled sections never call selection changes", () => {
  const change = vi.fn();
  render(
    <Accordion onValueChange={change}>
      <Accordion.Item value="a" isDisabled>
        <Accordion.Trigger>不可展开</Accordion.Trigger>
        <Accordion.Content>内容</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(change).not.toHaveBeenCalled();
});

it("closing retains the same body until exit and rapid reopening cancels unmount", async () => {
  render(
    <Accordion defaultValue="a">
      <Section value="a" />
    </Accordion>
  );
  const body = screen.getByText("a正文");
  fireEvent.click(screen.getByRole("button", { name: "a" }));
  expect(screen.getByText("a正文")).toBe(body);
  fireEvent.click(screen.getByRole("button", { name: "a" }));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
  expect(screen.getByText("a正文")).toBe(body);
  fireEvent.click(screen.getByRole("button", { name: "a" }));
  await waitFor(() => expect(screen.queryByText("a正文")).toBeNull());
});
