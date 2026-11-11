// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Breadcrumb } from "../src/components/Breadcrumb";
import { EmptyState } from "../src/components/EmptyState";

it("breadcrumb owns separators and folds only the middle into a functional ellipsis", () => {
  const more = vi.fn();
  const go = vi.fn();
  render(
    <Breadcrumb size="sm" separator="/">
      <Breadcrumb.List maxItems={3} onEllipsisPress={more}>
        <Breadcrumb.Item key="a">
          <Breadcrumb.Link onPress={go}>首页</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item key="b">
          <Breadcrumb.Link>家庭</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item key="c">
          <Breadcrumb.Link>孩子</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item key="d">
          <Breadcrumb.Page>设置</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
  expect(screen.queryByText("家庭")).toBeNull();
  expect(screen.getAllByText("/")).toHaveLength(2);
  expect(screen.getByText("设置").getAttribute("aria-current")).toBe("page");
  fireEvent.click(screen.getByRole("button", { name: "Show more" }));
  expect(more).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("link", { name: "首页" }));
  expect(go).toHaveBeenCalledOnce();
  expect(screen.getByText("首页").className).toContain("text-[24px]");
});
it("short breadcrumbs have no ellipsis or trailing separator", () => {
  render(
    <Breadcrumb>
      <Breadcrumb.List maxItems={3}>
        <Breadcrumb.Item>
          <Breadcrumb.Page>首页</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
  expect(screen.queryByLabelText("More")).toBeNull();
  expect(
    screen.getByRole("list").querySelectorAll('[aria-hidden="true"]')
  ).toHaveLength(0);
});
it("empty state scales all six parts and its original icon ghost cards", () => {
  const { container } = render(
    <EmptyState variant="card" size="lg">
      <EmptyState.Header>
        <EmptyState.Media variant="icon">图</EmptyState.Media>
        <EmptyState.Title>没有内容</EmptyState.Title>
        <EmptyState.Description>描述</EmptyState.Description>
      </EmptyState.Header>
      <EmptyState.Content>操作</EmptyState.Content>
    </EmptyState>
  );
  expect(container.firstElementChild?.className).toContain("py-[128px]");
  expect(container.firstElementChild?.className).toContain("--panel-card");
  expect(screen.getByText("没有内容").className).toContain("text-[48px]");
  expect(screen.getByText("描述").className).toContain("text-[32px]");
  const ghosts = container.querySelectorAll('[aria-hidden="true"]');
  expect(ghosts).toHaveLength(2);
  expect(ghosts[0].className).toContain("-translate-x-[16px]");
  expect(ghosts[1].className).toContain("h-[88px]");
});
