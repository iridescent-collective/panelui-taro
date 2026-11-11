import { tv } from "../../lib/variants";

export const avatarVariants = tv({
  slots: {
    root: "items-center justify-center overflow-hidden rounded-full border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-surface-secondary)]",
    image: "absolute inset-[0px] h-full w-full rounded-full",
    fallback: "font-medium text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    size: {
      sm: {
        root: "h-[64px] w-[64px]",
        fallback: "text-[24px] leading-[1.333333]",
      },
      md: {
        root: "h-[80px] w-[80px]",
        fallback: "text-[28px] leading-[1.428571]",
      },
      lg: {
        root: "h-[112px] w-[112px]",
        fallback: "text-[36px] leading-[1.555556]",
      },
      xl: {
        root: "h-[160px] w-[160px]",
        fallback: "text-[48px] leading-[1.333333]",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
