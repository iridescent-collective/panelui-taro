import { describe, expect, it } from "vitest";

import { cn } from "../src/lib/utils";

describe("WXSS 转义后的 Tailwind 合并", () => {
  it("颜色和字号不能被误认为同一个样式组", () => {
    const color = "text-_bcolor_cvar_p--panel-primary-foreground_P_B";
    const size = "text-_b32px_B";
    expect(cn(color, size)).toBe(`${color} ${size}`);
  });

  it("继承字号和继承颜色同时保留且覆盖默认文本样式", () => {
    const size = "text-_blength_cinherit_B";
    const color = "text-_bcolor_cinherit_B";
    expect(
      cn(
        "text-_b32px_B",
        "text-_bcolor_cvar_p--panel-foreground_P_B",
        size,
        color
      )
    ).toBe(`${size} ${color}`);
  });

  it("同组尺寸继续由最后一次设置覆盖，不改变转义后的输出", () => {
    expect(cn("rounded-_bvar_p--panel-radius-lg_P_B", "rounded-none")).toBe(
      "rounded-none"
    );
    expect(cn("text-_b32px_B", "text-_b48px_B")).toBe("text-_b48px_B");
  });
});

it("lets existing business shadow tokens replace PanelUI default shadows", () => {
  const shadow = "shadow-_bvar_p--shadow-default_P_B";
  expect(cn("shadow-sm", shadow)).toBe(shadow);
  expect(cn(shadow, "shadow-none")).toBe("shadow-none");
  expect(cn("shadow-sm", "shadow-_bvar_p--shadow-primary_P_B")).toBe(
    "shadow-_bvar_p--shadow-primary_P_B"
  );
});
