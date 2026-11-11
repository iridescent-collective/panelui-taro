import { tv } from "../../lib/variants";

export const alertVariants = tv({
  slots: {
    root: "flex w-full flex-row gap-[24px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid px-[28px] py-[24px]",
    indicator: "pt-[2px]",
    content: "flex-1 gap-[4px]",
    title: "text-[28px] leading-[1.428571] font-medium",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      default: {
        root: "border-[var(--panel-border)] bg-[var(--panel-surface)]",
        title: "text-[color:var(--panel-card-foreground)]",
      },
      info: {
        root: "border-[var(--panel-info-opacity-32)] bg-[var(--panel-info-soft)]",
        title: "text-[color:var(--panel-info-foreground)]",
      },
      success: {
        root: "border-[var(--panel-success-opacity-32)] bg-[var(--panel-success-soft)]",
        title: "text-[color:var(--panel-success-foreground)]",
      },
      warning: {
        root: "border-[var(--panel-warning-opacity-32)] bg-[var(--panel-warning-soft)]",
        title: "text-[color:var(--panel-warning-foreground)]",
      },
      destructive: {
        root: "border-[var(--panel-destructive-opacity-32)] bg-[var(--panel-destructive-soft)]",
        title: "text-[color:var(--panel-destructive-foreground)]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
