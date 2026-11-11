import { tv } from "../../lib/variants";

export const codeBlockVariants = tv({
  slots: {
    root: "w-full overflow-hidden rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted-opacity-40)]",
    header:
      "flex flex-row items-center justify-between gap-[16px] border-b-[2px] border-solid border-[var(--panel-border)] px-[24px] py-[16px]",
    filename:
      "font-mono text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    language:
      "text-[24px] leading-[1.333333] tracking-wide text-[color:var(--panel-muted-foreground)] uppercase",
    actions: "flex flex-row items-center gap-[8px]",
    action:
      "h-[56px] w-[56px] items-center justify-center rounded-[var(--panel-radius-lg)] active:bg-[var(--panel-accent)]",
    body: "p-[24px]",
    line: "flex flex-row",
    gutter:
      "w-[64px] pe-[24px] text-end font-mono text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground-opacity-50)]",
    code: "font-mono text-[24px] leading-[40px]",
  },
});
