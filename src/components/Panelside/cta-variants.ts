import { tv } from "../../lib/variants";

export const ctaVariants = tv({
  base: "flex shrink flex-row items-center justify-center rounded-full",
  variants: {
    variant: {
      primary: "bg-[var(--panel-primary)]",
      secondary: "bg-[var(--panel-secondary)]",
    },
    size: {
      default: "h-[88px] gap-[16px] px-[48px]",
      lg: "h-[104px] gap-[20px] px-[56px]",
      xl: "h-[112px] gap-[24px] px-[64px]",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});
