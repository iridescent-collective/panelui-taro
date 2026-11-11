// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import { Frame } from "../src/components/Frame";
import { readTaroStyle } from "./taro-style";

it("panels divide only source rows and sections and retain explicit overrides", () => {
  const { container } = render(
    <Frame>
      <Frame.Panel>
        <Frame.Row id="first">第一行</Frame.Row>
        <span>装饰</span>
        <Frame.Section id="section" title="第二组">
          <Frame.Row id="nested-first">组首</Frame.Row>
          <Frame.Row id="nested-last">组末</Frame.Row>
        </Frame.Section>
        <Frame.Row id="override" divided={false}>
          取消
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
  expect(container.querySelector("#first")?.className).not.toContain(
    "border-t-[2px]"
  );
  expect(container.querySelector("#section")?.className).toContain(
    "border-t-[2px]"
  );
  expect(container.querySelector("#nested-first")?.className).not.toContain(
    "border-t-[2px]"
  );
  expect(container.querySelector("#nested-last")?.className).toContain(
    "border-t-[2px]"
  );
  expect(container.querySelector("#override")?.className).not.toContain(
    "border-t-[2px]"
  );
});
it("inset variant keeps concentric source geometry and equal footer decisions with caller overrides", () => {
  const { container } = render(
    <Frame variant="inset" id="shell">
      <Frame.Panel id="panel" />
      <Frame.Footer id="footer">
        <Button>A</Button>
        <Button className="rounded-[8px]">B</Button>
      </Frame.Footer>
    </Frame>
  );
  expect(
    readTaroStyle(container.querySelector<HTMLElement>("#shell"))
  ).toContain('"borderRadius":"76rpx"');
  expect(
    readTaroStyle(container.querySelector<HTMLElement>("#panel"))
  ).toContain('"borderRadius":"60rpx"');
  expect(
    readTaroStyle(container.querySelector<HTMLElement>("#footer"))
  ).toContain('"marginLeft":"36rpx"');
  expect(screen.getByRole("button", { name: "A" }).className).toContain(
    "rounded-full"
  );
  expect(screen.getByRole("button", { name: "B" }).className).toContain(
    "rounded-[8px]"
  );
});
it("row content changes title weight, line limits and description size without changing header captions", () => {
  render(
    <Frame>
      <Frame.Header>
        <Frame.Title>托盘标题</Frame.Title>
      </Frame.Header>
      <Frame.Panel>
        <Frame.Row>
          <Frame.Content>
            <Frame.Title>行标题</Frame.Title>
            <Frame.Description>行说明</Frame.Description>
          </Frame.Content>
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
  expect(screen.getByText("托盘标题").className).toContain(
    "text-[color:var(--panel-muted-foreground)]"
  );
  expect(screen.getByText("行标题").className).toContain("font-medium");
  expect(readTaroStyle(screen.getByText("行标题"))).toContain(
    '"whiteSpace":"nowrap"'
  );
  expect(readTaroStyle(screen.getByText("行说明"))).toContain(
    '"WebkitLineClamp":2'
  );
  expect(screen.getByText("行说明").className).toContain("text-[24px]");
});
it("row callbacks create a pressable role while disabled rows refuse interaction", () => {
  const press = vi.fn();
  const { rerender } = render(
    <Frame.Row onPress={press} chevron>
      打开
    </Frame.Row>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(press).toHaveBeenCalledTimes(1);
  rerender(
    <Frame.Row onPress={press} disabled>
      打开
    </Frame.Row>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(press).toHaveBeenCalledTimes(1);
});
