import { tv } from "../../lib/variants";

export const reasoningVariants = tv({
  slots: {
    root: "w-full gap-[16px]",
    trigger: "flex flex-row items-center gap-[16px] py-[4px]",
    label:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    content: "gap-[16px] ps-[48px]",
    contentText:
      "text-[28px] leading-relaxed text-[color:var(--panel-muted-foreground)]",
  },
});
