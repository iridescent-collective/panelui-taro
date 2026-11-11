import { tv } from "../../lib/variants";

export const sourcesVariants = tv({
  slots: {
    root: "w-full gap-[16px]",
    trigger: "flex flex-row items-center gap-[16px] py-[4px]",
    triggerLabel:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-muted-foreground)]",
    content: "gap-[4px]",
    source:
      "flex flex-row items-center gap-[16px] rounded-[var(--panel-radius-xl)] px-[16px] py-[16px] active:bg-[var(--panel-accent)]",
    sourceTitle:
      "flex-1 text-[28px] leading-[1.428571] text-[color:var(--panel-foreground)]",
    sourceHost:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
  },
});
