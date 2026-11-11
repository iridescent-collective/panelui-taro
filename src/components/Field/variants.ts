import { tv } from "../../lib/variants";

export const fieldVariants = tv({
  slots: {
    root: "gap-[16px]",
    content: "flex flex-1 flex-col gap-[4px]",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    error: "gap-[8px]",
    errorText:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
    bullet: "flex flex-row gap-[12px]",
    bulletDot:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
    set: "gap-[32px]",
    legend: "text-[color:var(--panel-foreground)]",
    group: "gap-[48px]",
    separator: "flex flex-row items-center gap-[24px]",
    separatorLabel:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    title:
      "text-[32px] leading-[1.5] font-medium text-[color:var(--panel-foreground)]",
  },
  variants: {
    orientation: {
      vertical: { root: "flex flex-col" },
      horizontal: {
        root: "flex flex-row items-center justify-between gap-[32px]",
      },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
    legendVariant: {
      legend: { legend: "text-[32px] leading-[1.5] font-semibold" },
      label: { legend: "text-[28px] leading-[1.428571] font-medium" },
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});
