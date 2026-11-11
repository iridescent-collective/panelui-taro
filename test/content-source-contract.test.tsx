// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { describe, expect, it } from "vitest";

import { Badge } from "../src/components/Badge";
import { Button } from "../src/components/Button";
import { ButtonGroup } from "../src/components/ButtonGroup";
import { Card } from "../src/components/Card";
import { Direction } from "../src/components/Direction";
import { Progress } from "../src/components/Progress";
import { Surface } from "../src/components/Surface";
import { Typography } from "../src/components/Typography";
import { readTaroStyle } from "./taro-style";

describe("内容组件源码契约", () => {
  it("Typography h2 使用上游 30/36 的字号行高比例", () => {
    render(<Typography.Heading>标题</Typography.Heading>);
    expect(screen.getByText("标题").className).toContain("leading-[1.2]");
  });
  it("RTL 文字方向从 Direction 继承且可恢复 LTR", () => {
    const { rerender } = render(
      <Direction dir="rtl">
        <Typography>正文</Typography>
      </Direction>
    );
    expect(screen.getByText("正文").getAttribute("style")).toContain(
      "direction: rtl"
    );
    rerender(
      <Direction dir="ltr">
        <Typography>正文</Typography>
      </Direction>
    );
    expect(screen.getByText("正文").getAttribute("style")).toContain(
      "direction: ltr"
    );
  });
  it("Progress 的 ref 与 className 定位轨道而不是标题外壳", () => {
    const ref = createRef<ComponentRef<typeof Progress>>();
    render(
      <Progress ref={ref} label="上传" value={40} className="custom-track" />
    );
    const track = screen.getByRole("progressbar");
    expect(ref.current).toBe(track);
    expect(track.className).toContain("h-[16px]");
    expect(track.className).toContain("custom-track");
    expect(track.textContent).not.toContain("上传");
  });
  it("未定进度没有标签时不绘制空标题行", () => {
    const { container } = render(<Progress indeterminate showValueLabel />);
    expect(container.firstElementChild).toBe(screen.getByRole("progressbar"));
    expect(screen.getByRole("progressbar").className).not.toContain(
      "gap-[16px]"
    );
  });
});
it("RTL progress fills from the right and reverses the indeterminate sweep", () => {
  const { container, rerender } = render(
    <Direction dir="rtl">
      <Progress value={40} />
    </Direction>
  );
  expect(
    readTaroStyle(container.querySelector<HTMLElement>('[aria-hidden="true"]'))
  ).toContain('"float":"right"');
  rerender(
    <Direction dir="rtl">
      <Progress indeterminate />
    </Direction>
  );
  expect(
    container.querySelector(".panelui-progress-sweep--rtl")
  ).toBeTruthy();
});
it("heading ref, id and role share the source text node without a wrapper", () => {
  const ref = createRef<ComponentRef<typeof Typography.Heading>>();
  render(
    <Typography.Heading ref={ref} id="source-heading">
      标题原点
    </Typography.Heading>
  );
  expect(screen.getByRole("heading")).toBe(ref.current);
  expect(screen.getByRole("heading").id).toBe("source-heading");
});
it("Badge label uses source font size and line height rather than inherited root size", () => {
  render(<Badge size="md">标签</Badge>);
  expect(screen.getByText("标签").className).toContain("text-[24px]");
  expect(screen.getByText("标签").className).toContain("leading-[1.333333]");
});
it("joined buttons expose a toolbar and a source-sized border", () => {
  render(
    <ButtonGroup>
      <Button>A</Button>
      <Button>B</Button>
    </ButtonGroup>
  );
  expect(screen.getByRole("toolbar").className).toContain("border-[2px]");
});
it("card and surface borders retain one source point at the 750 design scale", () => {
  const { container } = render(
    <>
      <Card id="source-card">
        <Card.Footer variant="panel" id="source-footer" />
      </Card>
      <Surface bordered id="source-surface" />
    </>
  );
  expect(container.querySelector("#source-card")?.className).toContain(
    "border-[2px]"
  );
  expect(container.querySelector("#source-footer")?.className).toContain(
    "border-t-[2px]"
  );
  expect(container.querySelector("#source-surface")?.className).toContain(
    "border-[2px]"
  );
});
