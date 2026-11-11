import { tv } from "../../lib/variants";

export const selectionVariants = tv({
  slots: {
    circle:
      "h-[48px] w-[48px] items-center justify-center rounded-full border-[4px] border-solid border-[var(--panel-muted-foreground)]",
    fill: "absolute inset-[0px] items-center justify-center rounded-full bg-[var(--panel-primary)]",
    header:
      "flex h-[112px] flex-row items-center gap-[24px] border-b-[2px] border-solid border-[var(--panel-border)] px-[32px]",
    title:
      "flex-1 text-center text-[32px] leading-[1.5] font-semibold text-[color:var(--panel-foreground)]",
    close:
      "h-[80px] w-[80px] items-center justify-center rounded-full bg-[var(--panel-muted)]",
    group: "overflow-hidden rounded-[var(--panel-radius-2xl)]",
    ring: "rounded-full border-[4px] border-solid border-transparent p-[4px]",
    bar: "flex flex-row items-stretch",
    action: "flex-1 items-center justify-center gap-[12px] px-[16px] py-[24px]",
    actionLabel:
      "text-[24px] leading-[1.333333] font-medium text-[color:var(--panel-foreground)]",
    groupLabel: "ps-[8px] pb-[16px]",
  },
  variants: {
    selected: {
      true: {
        circle: "border-[var(--panel-primary)]",
        ring: "border-[var(--panel-foreground)]",
      },
    },
    compact: {
      true: {
        action: "flex flex-row gap-[16px] px-[32px] py-[20px]",
        actionLabel: "text-[28px] leading-[1.428571]",
      },
    },
    destructive: {
      true: { actionLabel: "text-[color:var(--panel-destructive)]" },
    },
    disabled: {
      true: { action: "opacity-[0.44]" },
    },
    surface: {
      screen: { group: "bg-[var(--panel-card)]" },
      sheet: { group: "bg-[var(--panel-muted)]" },
    },
    placement: {
      bar: {
        bar: "border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)]",
      },
      floating: {
        bar: "rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] shadow-lg",
      },
    },
  },
  defaultVariants: {
    placement: "bar",
    surface: "screen",
  },
});
