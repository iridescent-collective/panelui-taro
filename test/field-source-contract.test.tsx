// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Field, useFieldLabelledBy } from "../src/components/Field";

const Relationship = () => (
  <span data-testid="ids">{useFieldLabelledBy()?.join(" ")}</span>
);
it("inherits required/invalid state and exposes stable field relationships", () => {
  render(
    <Field required invalid>
      <Field.Label>姓名</Field.Label>
      <Field.Description>填写姓名</Field.Description>
      <Field.Title>资料</Field.Title>
      <Relationship />
    </Field>
  );
  expect(screen.getByText("*")).toBeTruthy();
  expect(screen.getByText("姓名").className).toContain("--panel-destructive");
  const ids = screen.getByTestId("ids").textContent?.split(" ");
  expect(ids).toHaveLength(4);
  expect(screen.getByText("填写姓名").id).toBe(ids?.[2]);
});
it("deduplicates errors, omits absent content, preserves explicit empty errors", () => {
  const { rerender } = render(
    <Field.Error
      errors={[
        "缺少姓名",
        { message: "缺少姓名" },
        null,
        { message: "缺少教材" },
      ]}
    />
  );
  expect(screen.getAllByText("缺少姓名")).toHaveLength(1);
  expect(screen.getAllByText("•")).toHaveLength(2);
  rerender(<Field.Error errors={[]}>覆盖内容</Field.Error>);
  expect(screen.queryByRole("alert")).toBeNull();
  rerender(<Field.Error>保存失败</Field.Error>);
  expect(screen.getByRole("alert").textContent).toBe("保存失败");
});
it("supports all nine compound parts and horizontal orientation", () => {
  const parts = [
    Field.Content,
    Field.Label,
    Field.Description,
    Field.Error,
    Field.Set,
    Field.Legend,
    Field.Group,
    Field.Separator,
    Field.Title,
  ];
  expect(parts).toHaveLength(9);
  const { container } = render(
    <Field orientation="horizontal">
      <Field.Content>
        <Field.Legend variant="label">设置</Field.Legend>
        <Field.Separator>或</Field.Separator>
      </Field.Content>
    </Field>
  );
  expect(container.firstElementChild?.className).toContain("flex-row");
  expect(screen.getByRole("heading").className).toContain("text-[28px]");
});

it("field roles reach the WeChat aria-role attribute", () => {
  render(
    <Field>
      <Field.Set>
        <Field.Legend>资料</Field.Legend>
        <Field.Error>失败</Field.Error>
      </Field.Set>
    </Field>
  );
  expect(screen.getByRole("alert").dataset.weappRole).toBe("alert");
  expect(screen.getByRole("heading").dataset.weappRole).toBe("heading");
  for (const group of screen.getAllByRole("group")) {
    expect(group.dataset.weappRole).toBe("group");
  }
});
