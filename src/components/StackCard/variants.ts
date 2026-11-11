import { tv } from "../../lib/variants";

export const stampVariants = tv({
  slots: {
    root: "absolute inset-x-[48px] z-10",
    pill: "rounded-[var(--panel-radius-xl)] px-[32px] py-[16px]",
    label: "text-[36px] leading-[1.555556] font-bold tracking-widest uppercase",
  },
  variants: {
    color: {
      default: {
        pill: "bg-[var(--panel-muted-foreground)]",
        label: "text-[color:var(--panel-background)]",
      },
      primary: {
        pill: "bg-[var(--panel-primary)]",
        label: "text-[color:var(--panel-primary-foreground)]",
      },
      success: {
        pill: "bg-[var(--panel-success)]",
        label: "text-[color:var(--panel-success-solid-foreground)]",
      },
      warning: {
        pill: "bg-[var(--panel-warning)]",
        label: "text-[color:var(--panel-warning-solid-foreground)]",
      },
      info: {
        pill: "bg-[var(--panel-info)]",
        label: "text-[color:var(--panel-info-solid-foreground)]",
      },
      destructive: {
        pill: "bg-[var(--panel-destructive)]",
        label: "text-[color:var(--panel-destructive-solid-foreground)]",
      },
    },
    direction: {
      left: { root: "top-[48px] items-end", pill: "rotate-12" },
      right: { root: "top-[48px] items-start", pill: "-rotate-12" },
      up: { root: "bottom-[48px] items-center" },
      down: { root: "top-[48px] items-center" },
    },
  },
  defaultVariants: {
    color: "default",
    direction: "right",
  },
});
