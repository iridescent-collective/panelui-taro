import { tv } from "../../lib/variants";

export const checkboxVariants = tv({
  slots: {
    row: "flex min-h-[96px] min-w-[96px] flex-row items-center gap-[20px]",
    box: "h-[40px] w-[40px] items-center justify-center rounded-[var(--panel-radius-md)] border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-background)]",
    fill: "absolute inset-[0px] items-center justify-center rounded-[var(--panel-radius-md)] bg-[var(--panel-primary)]",
    content: "flex-1 gap-[4px]",
    label:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-foreground)]",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    size: {
      xs: {
        row: "gap-[16px]",
        box: "h-[28px] w-[28px] rounded-[var(--panel-radius-sm)]",
        fill: "rounded-[var(--panel-radius-sm)]",
        label: "text-[24px] leading-[1.333333]",
        description: "text-[24px] leading-[1.333333]",
      },
      sm: {
        row: "gap-[16px]",
        box: "h-[32px] w-[32px] rounded-[var(--panel-radius-sm)]",
        fill: "rounded-[var(--panel-radius-sm)]",
        label: "text-[26px]",
        description: "text-[24px] leading-[1.333333]",
      },
      md: {},
      lg: {
        row: "gap-[24px]",
        box: "h-[48px] w-[48px]",
        label: "text-[32px] leading-[1.5]",
      },
      xl: {
        row: "gap-[24px]",
        box: "h-[56px] w-[56px] rounded-[var(--panel-radius-lg)]",
        fill: "rounded-[var(--panel-radius-lg)]",
        label: "text-[36px] leading-[1.555556]",
        description: "text-[32px] leading-[1.5]",
      },
    },
    variant: {
      default: {},
      card: {
        row: "w-full items-start gap-[24px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[32px]",
        label: "text-[32px] leading-[1.5] font-medium",
      },
    },
    checked: {
      true: {},
    },
    disabled: {
      true: { row: "opacity-50" },
    },
  },
  compoundVariants: [
    {
      variant: "card",
      checked: true,
      class: { row: "border-[var(--panel-primary)] bg-[var(--panel-accent)]" },
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
