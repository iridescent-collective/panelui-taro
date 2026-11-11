import { tv } from "../../lib/variants";

export const meterVariants = tv({
  slots: {
    root: "w-full gap-[16px]",
    header: "flex flex-row items-center justify-between gap-[16px]",
    track: "w-full overflow-hidden rounded-full",
    indicator: "h-full rounded-full",
    segments: "flex w-full flex-row overflow-hidden",
    segment: "flex-1 rounded-full",
  },
  variants: {
    color: {
      primary: {
        track: "bg-[var(--panel-primary-opacity-16)]",
        indicator: "bg-[var(--panel-primary)]",
        segment: "bg-[var(--panel-primary)]",
      },
      success: {
        track: "bg-[var(--panel-success-opacity-16)]",
        indicator: "bg-[var(--panel-success)]",
        segment: "bg-[var(--panel-success)]",
      },
      warning: {
        track: "bg-[var(--panel-warning-opacity-16)]",
        indicator: "bg-[var(--panel-warning)]",
        segment: "bg-[var(--panel-warning)]",
      },
      destructive: {
        track: "bg-[var(--panel-destructive-opacity-16)]",
        indicator: "bg-[var(--panel-destructive)]",
        segment: "bg-[var(--panel-destructive)]",
      },
      info: {
        track: "bg-[var(--panel-info-opacity-16)]",
        indicator: "bg-[var(--panel-info)]",
        segment: "bg-[var(--panel-info)]",
      },
      muted: {
        track: "bg-[var(--panel-muted)]",
        indicator: "bg-[var(--panel-muted-foreground)]",
        segment: "bg-[var(--panel-muted-foreground)]",
      },
    },
    size: {
      sm: {
        track: "h-[12px]",
        segments: "h-[12px] gap-[8px]",
        segment: "h-[12px]",
      },
      md: {
        track: "h-[16px]",
        segments: "h-[16px] gap-[12px]",
        segment: "h-[16px]",
      },
      lg: {
        track: "h-[24px]",
        segments: "h-[24px] gap-[12px]",
        segment: "h-[24px]",
      },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});
