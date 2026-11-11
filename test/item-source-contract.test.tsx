// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Item } from "../src/components/Item";

it("all ten item parts inherit density while vertical content fills its card", () => {
  const { container } = render(
    <Item size="xs" orientation="vertical" variant="outline">
      <Item.Header>抬头</Item.Header>
      <Item.Media variant="icon">图</Item.Media>
      <Item.Content>
        <Item.Title>标题</Item.Title>
        <Item.Description>描述</Item.Description>
      </Item.Content>
      <Item.Actions>操作</Item.Actions>
      <Item.Footer>页脚</Item.Footer>
    </Item>
  );
  expect(screen.getByText("标题").className).toContain("text-[28px]");
  expect(screen.getByText("描述").className).toContain("text-[24px]");
  expect(screen.getByText("图").parentElement?.className).toContain("h-[48px]");
  expect(screen.getByText("标题").parentElement?.className).toContain("w-full");
  expect(container.firstElementChild?.className).toContain("flex-col");
});
it("static rows do not claim a button role and disabled pressable rows suppress activation", () => {
  const press = vi.fn();
  const { rerender } = render(<Item>静态</Item>);
  expect(screen.queryByRole("button")).toBeNull();
  rerender(
    <Item disabled onPress={press}>
      禁用
    </Item>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(press).not.toHaveBeenCalled();
  rerender(<Item onPress={press}>可点</Item>);
  fireEvent.click(screen.getByRole("button"));
  expect(press).toHaveBeenCalledOnce();
});
it("horizontal groups have vertical hairlines and a WeChat list role", () => {
  const { container } = render(
    <Item.Group orientation="horizontal">
      <Item.Separator orientation="horizontal" />
    </Item.Group>
  );
  expect(screen.getByRole("list").dataset.weappRole).toBe("list");
  expect(container.firstElementChild?.className).toContain("flex-row");
  expect(container.firstElementChild?.firstElementChild?.className).toContain(
    "w-[2px]"
  );
});
it("Taro onClick items enforce disabled state before invoking their handler", () => {
  const click = vi.fn();
  const { rerender } = render(
    <Item disabled onClick={click}>
      Native item
    </Item>
  );
  fireEvent.click(screen.getByText("Native item"));
  expect(click).not.toHaveBeenCalled();
  rerender(<Item onClick={click}>Native item</Item>);
  fireEvent.click(screen.getByRole("button", { name: "Native item" }));
  expect(click).toHaveBeenCalledOnce();
});
