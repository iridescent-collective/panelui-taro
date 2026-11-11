import { tv } from "../../lib/variants";

export const ratingVariants = tv({
  slots: {
    root: "gap-[16px]",
    header: "flex flex-row items-center justify-between gap-[24px]",
    label:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
    value:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    row: "flex flex-row items-center self-start",
  },
  variants: {
    size: {
      sm: { row: "gap-[4px]" },
      md: { row: "gap-[8px]" },
      lg: { row: "gap-[12px]" },
    },
    disabled: {
      true: { root: "opacity-50" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
