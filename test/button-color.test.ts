import { describe, expect, it } from "vitest";

import { resolveButtonPresentation } from "../src/components/Button/utils";

describe("按钮颜色与字号同时保留", () => {
  it("主按钮不会因字号覆盖而丢掉前景色", () => {
    const { slots } = resolveButtonPresentation(
      { size: "md", variant: "primary" },
      null,
      false
    );
    const className = slots.label();
    expect(className).toContain("text-[color:var(--panel-primary-foreground)]");
    expect(className).toContain("text-[32px]");
  });
});
