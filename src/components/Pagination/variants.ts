import { tv } from "../../lib/variants";

export const paginationVariants = tv({
  slots: {
    root: "flex flex-row items-center",
    list: "flex flex-row items-center",
    item: "shrink-0 items-center justify-center rounded-[var(--panel-radius-lg)]",
    itemLabel: "font-medium tabular-nums",
    ellipsis: "shrink-0 items-center justify-center",
    status: "text-[color:var(--panel-muted-foreground)] tabular-nums",
    summary: "text-[color:var(--panel-muted-foreground)] tabular-nums",
  },
  variants: {
    size: {
      default: {
        list: "gap-[8px]",
        item: "h-[88px] min-w-[88px] px-[8px]",
        itemLabel: "text-[28px] leading-[1.428571]",
        ellipsis: "h-[88px] w-[88px]",
        status: "text-[28px] leading-[1.428571]",
        summary: "text-[28px] leading-[1.428571]",
      },
      sm: {
        list: "gap-[4px]",
        item: "h-[64px] min-w-[64px] px-[8px]",
        itemLabel: "text-[24px] leading-[1.333333]",
        ellipsis: "h-[64px] w-[64px]",
        status: "text-[24px] leading-[1.333333]",
        summary: "text-[24px] leading-[1.333333]",
      },
    },
    current: {
      true: {
        item: "bg-[var(--panel-primary)]",
        itemLabel: "text-[color:var(--panel-primary-foreground)]",
      },
      false: { itemLabel: "text-[color:var(--panel-foreground)]" },
    },
    disabled: {
      true: { item: "opacity-[0.4]" },
    },
  },
  defaultVariants: {
    size: "default",
    current: false,
  },
});
