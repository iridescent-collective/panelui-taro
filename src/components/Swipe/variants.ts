import { tv } from "../../lib/variants";

export const actionVariants = tv({
  slots: {
    root: "h-full min-w-[160px] items-center justify-center gap-[12px] px-[32px]",
    label: "text-center text-[24px] leading-[1.333333] font-semibold",
  },
  variants: {
    color: {
      default: {
        root: "bg-[var(--panel-muted-foreground)]",
        label: "text-[color:var(--panel-background)]",
      },
      primary: {
        root: "bg-[var(--panel-primary)]",
        label: "text-[color:var(--panel-primary-foreground)]",
      },
      success: {
        root: "bg-[var(--panel-success)]",
        label: "text-[color:var(--panel-success-solid-foreground)]",
      },
      warning: {
        root: "bg-[var(--panel-warning)]",
        label: "text-[color:var(--panel-warning-solid-foreground)]",
      },
      info: {
        root: "bg-[var(--panel-info)]",
        label: "text-[color:var(--panel-info-solid-foreground)]",
      },
      destructive: {
        root: "bg-[var(--panel-destructive)]",
        label: "text-[color:var(--panel-destructive-solid-foreground)]",
      },
    },
  },
  defaultVariants: {
    color: "default",
  },
});
