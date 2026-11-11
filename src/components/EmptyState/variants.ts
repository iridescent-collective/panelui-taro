import { tv } from "../../lib/variants";

export const emptyStateVariants = tv({
  slots: {
    root: "w-full items-center justify-center",
    header: "w-full max-w-[768px] items-center gap-[8px]",
    title: "text-center font-semibold text-[color:var(--panel-foreground)]",
    description: "text-center text-[color:var(--panel-muted-foreground)]",
    content: "w-full max-w-[768px] items-center gap-[24px]",
  },
  variants: {
    variant: {
      default: { root: "flex-1" },
      card: {
        root: "rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
      },
    },
    size: {
      sm: {
        root: "gap-[32px] px-[32px] py-[64px]",
        title: "text-[32px] leading-[1.5]",
        description: "text-[28px] leading-[1.428571]",
      },
      default: {
        root: "gap-[48px] px-[48px] py-[96px]",
        title: "text-[40px] leading-[1.4]",
        description: "text-[28px] leading-[1.428571]",
      },
      lg: {
        root: "gap-[48px] px-[48px] py-[128px]",
        title: "text-[48px] leading-[1.333333]",
        description: "text-[32px] leading-[1.5]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export const mediaVariants = tv({
  slots: {
    wrapper: "items-center justify-center",
    card: "shrink-0 items-center justify-center",
    ghost:
      "absolute rounded-[var(--panel-radius-md)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
  },
  variants: {
    variant: {
      default: {
        card: "bg-transparent",
        ghost: "hidden",
      },
      icon: {
        card: "rounded-[var(--panel-radius-md)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
      },
    },
    size: {
      sm: { card: "h-[64px] w-[64px]", ghost: "h-[64px] w-[64px]" },
      default: { card: "h-[72px] w-[72px]", ghost: "h-[72px] w-[72px]" },
      lg: { card: "h-[88px] w-[88px]", ghost: "h-[88px] w-[88px]" },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
