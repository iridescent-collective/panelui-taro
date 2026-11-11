import { tv } from "../../lib/variants";

export const surfaceVariants = tv({
  base: "overflow-hidden rounded-[var(--panel-radius-3xl)]",
  variants: {
    variant: {
      default: "bg-[var(--panel-surface)]",
      secondary: "bg-[var(--panel-surface-secondary)]",
      tertiary: "bg-[var(--panel-surface-tertiary)]",
      transparent: "bg-transparent",
    },
    padding: {
      none: "",
      sm: "p-[20px]",
      default: "p-[32px]",
      lg: "p-[48px]",
    },
    bordered: {
      true: "border-[2px] border-solid border-[var(--panel-border)]",
    },
    elevated: {
      true: "shadow-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
  },
});
