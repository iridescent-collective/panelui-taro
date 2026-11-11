import { tv } from "../../lib/variants";

export const progressVariants = tv({
  slots: {
    root: "w-full gap-[16px]",
    header: "flex flex-row items-center justify-between",
    track: "w-full overflow-hidden rounded-full",
    indicator: "h-full rounded-full",
  },
  variants: {
    color: {
      primary: {
        track: "bg-[var(--panel-primary-opacity-16)]",
        indicator: "bg-[var(--panel-primary)]",
      },
      success: {
        track: "bg-[var(--panel-success-opacity-16)]",
        indicator: "bg-[var(--panel-success)]",
      },
      warning: {
        track: "bg-[var(--panel-warning-opacity-16)]",
        indicator: "bg-[var(--panel-warning)]",
      },
      destructive: {
        track: "bg-[var(--panel-destructive-opacity-16)]",
        indicator: "bg-[var(--panel-destructive)]",
      },
      info: {
        track: "bg-[var(--panel-info-opacity-16)]",
        indicator: "bg-[var(--panel-info)]",
      },
    },
    size: {
      sm: { track: "h-[12px]" },
      md: { track: "h-[16px]" },
      lg: { track: "h-[24px]" },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});
