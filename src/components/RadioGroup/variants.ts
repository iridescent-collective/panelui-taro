import { tv } from "../../lib/variants";

export const itemVariants = tv({
  slots: {
    row: "flex min-h-[96px] min-w-[96px] flex-row items-center gap-[20px] self-start",
    indicator:
      "h-[40px] w-[40px] items-center justify-center rounded-full border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-background)]",
    dot: "h-[20px] w-[20px] rounded-full bg-[var(--panel-primary)]",
    label:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-foreground)]",
    description:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    size: {
      xs: {
        row: "gap-[16px]",
        indicator: "h-[28px] w-[28px]",
        dot: "h-[12px] w-[12px]",
        label: "text-[24px] leading-[1.333333]",
        description: "text-[22px]",
      },
      sm: {
        row: "gap-[16px]",
        indicator: "h-[32px] w-[32px]",
        dot: "h-[16px] w-[16px]",
        label: "text-[26px]",
      },
      md: {},
      lg: {
        row: "gap-[24px]",
        indicator: "h-[48px] w-[48px]",
        dot: "h-[24px] w-[24px]",
        label: "text-[32px] leading-[1.5]",
        description: "text-[28px] leading-[1.428571]",
      },
      xl: {
        row: "gap-[24px]",
        indicator: "h-[56px] w-[56px]",
        dot: "h-[28px] w-[28px]",
        label: "text-[36px] leading-[1.555556]",
        description: "text-[28px] leading-[1.428571]",
      },
    },
    variant: {
      dot: {},
      card: {
        row: "w-full items-start justify-between gap-[24px] self-stretch rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[32px]",
        label: "text-[32px] leading-[1.5] font-medium",
      },
    },
    selected: {
      true: {},
    },
    disabled: {
      true: { row: "opacity-50" },
    },
    horizontal: {
      true: {},
    },
  },
  compoundVariants: [
    {
      variant: "card",
      selected: true,
      class: { row: "border-[var(--panel-primary)] bg-[var(--panel-accent)]" },
    },
    { variant: "card", horizontal: true, class: { row: "w-auto flex-1" } },
  ],
  defaultVariants: {
    variant: "dot",
    size: "md",
  },
});
