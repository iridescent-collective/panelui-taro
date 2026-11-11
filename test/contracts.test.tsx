// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Badge } from "../src/components/Badge";
import { Button } from "../src/components/Button";
import { ButtonGroup } from "../src/components/ButtonGroup";
import { Card } from "../src/components/Card";
import { Label } from "../src/components/Label";
import { Progress } from "../src/components/Progress";
import { PanelUIProvider } from "../src/components/Provider";
import { Separator } from "../src/components/Separator";
import { Skeleton } from "../src/components/Skeleton";
import { Spinner } from "../src/components/Spinner";
import { Surface } from "../src/components/Surface";
import { Typography } from "../src/components/Typography";

describe("PanelUI Taro 基础契约", () => {
  it("全宽按钮组将包装触发器和直接按钮作为等宽 segment", () => {
    const { container } = render(
      <ButtonGroup fullWidth>
        <span>
          <Button>包装触发器</Button>
        </span>
        <Button>直接按钮</Button>
      </ButtonGroup>
    );
    const segments = container.querySelectorAll('[data-panel-segment="true"]');
    expect(segments).toHaveLength(2);
    for (const segment of segments) {
      expect(segment.className).toContain("flex-1");
    }
  });
  it("基础组件在 React 18 中向底层节点传递 ref", () => {
    const buttonRef = createRef<ComponentRef<typeof Button>>();
    const cardRef = createRef<ComponentRef<typeof Card>>();
    const titleRef = createRef<ComponentRef<typeof Card.Title>>();
    render(
      <Card ref={cardRef}>
        <Card.Title ref={titleRef}>标题</Card.Title>
        <Button ref={buttonRef}>保存</Button>
      </Card>
    );
    expect(buttonRef.current).toBe(screen.getByRole("button"));
    expect(titleRef.current).toBe(screen.getByText("标题"));
    expect(cardRef.current).toBe(screen.getByText("标题").parentElement);
  });
  it("分组默认传递给按钮，按钮自身设置优先且空子项不产生多余分隔线", () => {
    const { container } = render(
      <ButtonGroup variant="secondary" size="sm" fullWidth>
        <Button>日</Button>
        {false}
        <Button variant="primary">周</Button>
      </ButtonGroup>
    );
    expect(screen.getByRole("button", { name: "日" }).className).toContain(
      "bg-[var(--panel-secondary)]"
    );
    expect(screen.getByRole("button", { name: "周" }).className).toContain(
      "bg-[var(--panel-primary)]"
    );
    expect(screen.getByRole("button", { name: "日" }).className).toContain(
      "flex-1"
    );
    expect(
      container.querySelectorAll('[data-panel-divider="true"]')
    ).toHaveLength(1);
  });

  it("标签的错误、必填和禁用状态传播到显式文本子组件", () => {
    render(
      <Label isRequired isInvalid isDisabled>
        <Label.Text>姓名</Label.Text>
      </Label>
    );
    expect(screen.getByText("姓名").className).toContain(
      "text-[color:var(--panel-destructive)]"
    );
    expect(screen.getByText("*").getAttribute("aria-hidden")).toBe("true");
    expect(
      screen.getByText("姓名").parentElement?.getAttribute("aria-disabled")
    ).toBe("true");
  });

  it("标题级别和有序列表表达原有语义", () => {
    render(
      <>
        <Typography.Heading type="h3">设备</Typography.Heading>
        <Typography.List ordered>
          <Typography.ListItem>绑定</Typography.ListItem>
          <Typography.ListItem>联网</Typography.ListItem>
        </Typography.List>
      </>
    );
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("设备");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("2.")).toBeTruthy();
  });

  it("嵌套表面遵循深度标记，不使用无条件投影", () => {
    render(
      <Surface variant="secondary" padding="none" bordered>
        内容
      </Surface>
    );
    const root = screen.getByText("内容").parentElement;
    expect(root?.className).toContain("bg-[var(--panel-surface-secondary)]");
    expect(root?.className).not.toContain("shadow-sm");
  });

  it("减少动态模式下骨架保持静态且调用者不能覆盖占位透明度", () => {
    render(
      <PanelUIProvider reducedMotion>
        <Skeleton label="加载" style={{ opacity: 0, width: 30 }} />
      </PanelUIProvider>
    );
    const skeleton = screen.getByRole("progressbar");
    expect(skeleton.className).not.toContain("panelui-skeleton-pulse");
    expect(skeleton.getAttribute("style")).toContain("opacity: 0.7");
  });
  it("按钮加载时替换前置图标、保留标签和后置内容并阻止操作", () => {
    const onPress = vi.fn();
    const { rerender } = render(
      <Button startContent="前置" endContent="后置" onPress={onPress}>
        保存
      </Button>
    );
    fireEvent.click(screen.getByText("保存"));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(
      <Button loading startContent="前置" endContent="后置" onPress={onPress}>
        保存
      </Button>
    );
    expect(screen.queryByText("前置")).toBeNull();
    expect(screen.getByText("后置")).toBeTruthy();
    fireEvent.click(screen.getByText("保存"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
  });

  it("禁用按钮阻止点击和微信授权入口", () => {
    const onClick = vi.fn();
    render(
      <Button disabled openType="getPhoneNumber" onClick={onClick}>
        授权
      </Button>
    );
    fireEvent.click(screen.getByText("授权"));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button").getAttribute("openType")).toBeNull();
  });

  it("卡片包含全部结构插槽并保留混合文本和元素", () => {
    render(
      <Card>
        <Card.Header>
          <Card.Title>标题</Card.Title>
          <Card.Description>描述</Card.Description>
        </Card.Header>
        <Card.Content>
          正文<strong>重点</strong>
        </Card.Content>
        <Card.Footer variant="panel">操作</Card.Footer>
      </Card>
    );
    for (const text of ["标题", "描述", "正文", "重点", "操作"]) {
      expect(screen.getByText(text)).toBeTruthy();
    }
    expect(screen.getByText("操作").parentElement?.className).toContain(
      "bg-[var(--panel-inset)]"
    );
  });

  it("计数徽标截断显示但保留完整无障碍数量", () => {
    const { rerender } = render(<Badge count={142} />);
    expect(screen.getByText("99+")).toBeTruthy();
    expect(screen.getByLabelText("142 unread")).toBeTruthy();
    rerender(<Badge count={0} />);
    expect(screen.getByText("0")).toBeTruthy();
    rerender(<Badge shape="dot">不应显示</Badge>);
    expect(screen.queryByText("不应显示")).toBeNull();
  });

  it("进度按自定义范围归一化且不会溢出", () => {
    const { rerender } = render(
      <Progress value={150} minValue={100} maxValue={200} showValueLabel />
    );
    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "150"
    );
    rerender(
      <Progress value={999} minValue={100} maxValue={200} showValueLabel />
    );
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "200"
    );
    rerender(
      <Progress value={50} minValue={100} maxValue={100} showValueLabel />
    );
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("未知进度不提供虚假的百分比或 aria-valuenow", () => {
    render(<Progress indeterminate value={70} label="上传" showValueLabel />);
    expect(screen.getByText("上传")).toBeTruthy();
    expect(screen.queryByText("70%")).toBeNull();
    expect(screen.getByRole("progressbar").hasAttribute("aria-valuenow")).toBe(
      false
    );
  });

  it("纵向分隔线不绘制文字，横向标签分隔线可被读取", () => {
    const { rerender } = render(
      <Separator orientation="vertical">忽略</Separator>
    );
    expect(screen.queryByText("忽略")).toBeNull();
    rerender(<Separator>或者</Separator>);
    expect(screen.getByRole("separator")).toBeTruthy();
    expect(screen.getByText("或者")).toBeTruthy();
  });

  it("仅有标签的加载器进入无障碍树", () => {
    const { rerender } = render(<Spinner />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    rerender(<Spinner label="加载教材" color="#262626" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-label")).toBe(
      "加载教材"
    );
  });
});
