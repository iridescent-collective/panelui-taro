import { tv } from "../../lib/variants";

export const animatedBadgeVariants = tv({
  slots: {
    root: "flex flex-row items-center self-start overflow-hidden rounded-full",
    label: "font-medium",
    pulse: "absolute inset-[0px]",
    slot: "items-center justify-center overflow-hidden",
  },
  variants: {
    status: {
      neutral: {
        root: "bg-[var(--panel-muted)]",
        label: "text-[color:var(--panel-muted-foreground)]",
        pulse: "bg-[var(--panel-muted-foreground)]",
      },
      info: {
        root: "bg-[var(--panel-info-subtle)]",
        label: "text-[color:var(--panel-info-foreground)]",
        pulse: "bg-[var(--panel-info)]",
      },
      success: {
        root: "bg-[var(--panel-success-subtle)]",
        label: "text-[color:var(--panel-success-foreground)]",
        pulse: "bg-[var(--panel-success)]",
      },
      warning: {
        root: "bg-[var(--panel-warning-subtle)]",
        label: "text-[color:var(--panel-warning-foreground)]",
        pulse: "bg-[var(--panel-warning)]",
      },
      danger: {
        root: "bg-[var(--panel-destructive-subtle)]",
        label: "text-[color:var(--panel-destructive-foreground)]",
        pulse: "bg-[var(--panel-destructive)]",
      },
      loading: {
        root: "bg-[var(--panel-info-subtle)]",
        label: "text-[color:var(--panel-info-foreground)]",
        pulse: "bg-[var(--panel-info)]",
      },
    },
    size: {
      sm: { root: "h-[48px] gap-[12px] px-[16px]", label: "text-[22px]" },
      md: {
        root: "h-[64px] gap-[16px] px-[24px]",
        label: "text-[24px] leading-[1.333333]",
      },
    },
  },
  defaultVariants: {
    status: "neutral",
    size: "md",
  },
});
