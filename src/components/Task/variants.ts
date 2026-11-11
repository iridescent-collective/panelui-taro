import { tv } from "../../lib/variants";

export const taskVariants = tv({
  slots: {
    root: "w-full gap-[16px]",
    trigger: "flex flex-row items-center gap-[16px] py-[4px]",
    title:
      "flex-1 text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    content:
      "ms-[16px] gap-[12px] border-s-[2px] border-solid border-[var(--panel-border)] ps-[32px]",
    item: "text-[28px] leading-relaxed text-[color:var(--panel-muted-foreground)]",
    file: "flex flex-row items-center gap-[8px] self-start rounded-[var(--panel-radius-md)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted)] px-[12px] py-[4px]",
    fileLabel:
      "font-mono text-[24px] leading-[1.333333] text-[color:var(--panel-foreground)]",
  },
  variants: {
    status: {
      pending: {
        title: "text-[color:var(--panel-muted-foreground-opacity-60)]",
      },
      running: {},
      complete: {},
      error: { title: "text-[color:var(--panel-destructive)]" },
    },
  },
  defaultVariants: {
    status: "complete",
  },
});
