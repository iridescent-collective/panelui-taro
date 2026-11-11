import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

it("source dimensions, fonts and border widths scale while variant order is preserved", () => {
  const folder = mkdtempSync(path.join(tmpdir(), "panel-variants-"));
  const input = path.join(folder, "source.ts");
  const output = path.join(folder, "variants.ts");
  writeFileSync(
    input,
    'const fixture = tv({ base: "border-2 border-dashed max-w-sm text-2xl -translate-x-2 gap-1.5 size-2", variants: { size: { sm: "h-8" }, variant: { default: "bg-primary/80" } } });'
  );
  try {
    execFileSync(process.execPath, [
      fileURLToPath(new URL("../scripts/port-variants.mjs", import.meta.url)),
      input,
      output,
      "fixture",
      path.join(folder, "opacity.scss"),
    ]);
    const code = readFileSync(output, "utf-8");
    expect(code).toContain("border-[4px]");
    expect(code).toContain("border-dashed");
    expect(code).not.toContain("border-solid");
    expect(code).toContain("max-w-[768px]");
    expect(code).toContain("text-[48px] leading-[1.333333]");
    expect(code).toContain("-translate-x-[16px]");
    expect(code).toContain("gap-[12px]");
    expect(code).toContain("size-[16px]");
    expect(code.indexOf("size:")).toBeLessThan(code.indexOf("variant:"));
    expect(code).toContain("--panel-primary-opacity-80");
  } finally {
    rmSync(folder, { force: true, recursive: true });
  }
});
it("explicit source line heights override font defaults and modifiers retain themed colors", () => {
  const folder = mkdtempSync(path.join(tmpdir(), "panel-line-height-"));
  const input = path.join(folder, "source.ts");
  const output = path.join(folder, "variants.ts");
  writeFileSync(
    input,
    'const fixture = tv({ base: "text-xs leading-5 active:bg-accent bg-foreground/[0.04]" });'
  );
  try {
    execFileSync(process.execPath, [
      fileURLToPath(new URL("../scripts/port-variants.mjs", import.meta.url)),
      input,
      output,
      "fixture",
      path.join(folder, "opacity.scss"),
    ]);
    const code = readFileSync(output, "utf-8");
    expect(code).toContain("leading-[40px]");
    expect(code).not.toContain("leading-[1.333333]");
    expect(code).toContain("active:bg-[var(--panel-accent)]");
    expect(code).toContain("bg-[var(--panel-foreground-opacity-4)]");
  } finally {
    rmSync(folder, { force: true, recursive: true });
  }
});
