// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Table } from "../src/components/Table";
import { readTaroStyle } from "./taro-style";

const WrappedRow = ({ name }: { name: string }) => (
  <Table.Row>
    <Table.Cell>{name}</Table.Cell>
    <Table.Cell>42</Table.Cell>
  </Table.Row>
);
it("column models apply through wrapper rows and cell overrides win", () => {
  render(
    <Table columns={[{ flex: 2 }, { align: "end", width: 80 }]}>
      <Table.Header>
        <Table.Row>
          <Table.Head>名字</Table.Head>
          <Table.Head>数量</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <WrappedRow name="第一行" />
        <Table.Row>
          <Table.Cell>第二行</Table.Cell>
          <Table.Cell width={100} align="center">
            自定义
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
  const heads = screen.getAllByRole("columnheader");
  expect(readTaroStyle(heads[1])).toContain('"width":"160rpx"');
  expect(readTaroStyle(screen.getByText("42").parentElement)).toContain(
    '"width":"160rpx"'
  );
  expect(readTaroStyle(screen.getByText("自定义").parentElement)).toContain(
    '"width":"200rpx"'
  );
  expect(screen.getByText("自定义").parentElement?.className).toContain(
    "justify-center"
  );
});
it("body striping and last hairline follow section order through caller components", () => {
  render(
    <Table striped>
      <Table.Body>
        <WrappedRow name="第一行" />
        <WrappedRow name="第二行" />
      </Table.Body>
    </Table>
  );
  const rows = screen.getAllByRole("row");
  expect(rows[0].className).toContain("border-b-[2px]");
  expect(rows[1].className).not.toContain("border-b-[2px]");
  expect(rows[1].className).toContain("bg-[var(--panel-muted-opacity-40)]");
});
it("sort headers report presses and rotate the same glyph while ordinary heads stay column headers", () => {
  const press = vi.fn();
  const { rerender } = render(
    <Table>
      <Table.Row>
        <Table.Head sortable onPress={press} sortDirection="asc">
          数量
        </Table.Head>
      </Table.Row>
    </Table>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(press).toHaveBeenCalledTimes(1);
  rerender(
    <Table>
      <Table.Row>
        <Table.Head sortable onPress={press} sortDirection="desc">
          数量
        </Table.Head>
      </Table.Row>
    </Table>
  );
  expect(
    screen.getByRole("button").lastElementChild?.getAttribute("style")
  ).toContain("rotate(180deg)");
  expect(screen.getByRole("button").getAttribute("aria-description")).toContain(
    "ascending"
  );
});
it("frame lifts the original header outside its panel without losing the column model", () => {
  render(
    <Table.Frame title="测量" columns={[{ width: 80 }]}>
      <Table.Header>
        <Table.Row>
          <Table.Head>项目</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>电量</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Frame>
  );
  expect(screen.getByRole("table")).toBeTruthy();
  const heading = screen.getByRole("columnheader");
  expect(readTaroStyle(heading)).toContain('"width":"160rpx"');
  expect(readTaroStyle(screen.getByText("电量").parentElement)).toContain(
    '"width":"160rpx"'
  );
  expect(heading.closest('[role="rowgroup"]')?.className).toContain(
    "border-b-[0px]"
  );
  expect(screen.getByText("测量")).toBeTruthy();
});
