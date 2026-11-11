import { tv } from "../../lib/variants";

export const tableVariants = tv({
  slots: {
    root: "w-full",
    row: "flex w-full flex-row items-center",
    head: "flex flex-row items-center gap-[12px]",
    headLabel: "font-medium text-[color:var(--panel-muted-foreground)]",
    cell: "flex flex-row items-center",
    cellLabel: "text-[color:var(--panel-foreground)]",
    caption: "text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      default: {},
      outline: {
        root: "overflow-hidden rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)]",
      },
    },
    size: {
      default: {
        row: "min-h-[96px] gap-[24px] px-[32px]",
        headLabel: "text-[24px] leading-[1.333333]",
        cellLabel: "text-[28px] leading-[1.428571]",
        caption: "text-[28px] leading-[1.428571]",
      },
      sm: {
        row: "min-h-[80px] gap-[16px] px-[24px]",
        headLabel: "text-[22px]",
        cellLabel: "text-[24px] leading-[1.333333]",
        caption: "text-[24px] leading-[1.333333]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
