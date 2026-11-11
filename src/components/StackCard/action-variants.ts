import { tv } from "../../lib/variants";

export const actionVariants = tv({
  slots: {
    root: "items-center justify-center rounded-full border-[2px] border-solid",
  },
  variants: {
    color: {
      default: { root: "border-[var(--panel-border)] bg-[var(--panel-card)]" },
      primary: {
        root: "border-[var(--panel-primary)] bg-[var(--panel-primary)]",
      },
      success: {
        root: "border-[var(--panel-success)] bg-[var(--panel-success)]",
      },
      warning: {
        root: "border-[var(--panel-warning)] bg-[var(--panel-warning)]",
      },
      info: { root: "border-[var(--panel-info)] bg-[var(--panel-info)]" },
      destructive: {
        root: "border-[var(--panel-destructive)] bg-[var(--panel-destructive)]",
      },
    },
    size: {
      sm: { root: "h-[80px] w-[80px]" },
      md: { root: "h-[112px] w-[112px]" },
      lg: { root: "h-[128px] w-[128px]" },
    },
  },
  defaultVariants: {
    color: "default",
    size: "md",
  },
});
