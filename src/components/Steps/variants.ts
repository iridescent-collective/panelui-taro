import { tv } from "../../lib/variants";

export const stepsVariants = tv({
  slots: {
    root: "",
    item: "items-center",
    trigger: "flex flex-row items-center gap-[24px]",
    indicator:
      "h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full",
    indicatorLabel: "text-[24px] leading-[1.333333] font-medium",
    title:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    separator: "bg-[var(--panel-muted)]",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex w-full flex-row items-center",
        item: "flex flex-row",
        separator: "h-[4px] flex-1",
      },
      vertical: {
        root: "flex flex-col",
        item: "flex flex-col items-start",
        separator: "ms-[28px] h-[64px] w-[4px]",
      },
    },
    state: {
      inactive: {
        indicator: "bg-[var(--panel-muted)]",
        indicatorLabel: "text-[color:var(--panel-muted-foreground)]",
      },
      active: {
        indicator: "bg-[var(--panel-primary)]",
        indicatorLabel: "text-[color:var(--panel-primary-foreground)]",
      },
      completed: {
        indicator: "bg-[var(--panel-primary)]",
        indicatorLabel: "text-[color:var(--panel-primary-foreground)]",
        separator: "bg-[var(--panel-primary)]",
      },
      loading: {
        indicator: "bg-[var(--panel-muted)]",
        indicatorLabel: "text-[color:var(--panel-muted-foreground)]",
      },
    },
    isDisabled: {
      true: { trigger: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    state: "inactive",
  },
});
