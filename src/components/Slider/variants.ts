import { tv } from "../../lib/variants";

export const sliderVariants = tv({
  slots: {
    root: "w-full gap-[16px]",
    header: "flex w-full flex-row items-center justify-between gap-[24px]",
    label:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
    value:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    track: "w-full justify-center rounded-full bg-[var(--panel-muted)]",
    fill: "absolute start-0 top-[0px] bottom-[0px] rounded-full",
    thumb: "absolute start-0 rounded-full p-[4px]",
    knob: "flex-1 rounded-full bg-[var(--panel-background)] shadow-sm",
  },
  variants: {
    color: {
      primary: {
        fill: "bg-[var(--panel-primary)]",
        thumb: "bg-[var(--panel-primary)]",
      },
      success: {
        fill: "bg-[var(--panel-success)]",
        thumb: "bg-[var(--panel-success)]",
      },
      warning: {
        fill: "bg-[var(--panel-warning)]",
        thumb: "bg-[var(--panel-warning)]",
      },
      destructive: {
        fill: "bg-[var(--panel-destructive)]",
        thumb: "bg-[var(--panel-destructive)]",
      },
      info: { fill: "bg-[var(--panel-info)]", thumb: "bg-[var(--panel-info)]" },
    },
    size: {
      sm: { track: "h-[32px]", thumb: "h-[32px]" },
      md: { track: "h-[40px]", thumb: "h-[40px]" },
      lg: { track: "h-[48px]", thumb: "h-[48px]" },
    },
    disabled: {
      true: { root: "opacity-50" },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});
