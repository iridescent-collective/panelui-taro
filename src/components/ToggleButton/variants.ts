import { tv } from "../../lib/variants";

export const toggleVariants = tv({
  slots: {
    root: "flex flex-row items-center justify-center gap-[16px] rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-transparent",
    label: "font-medium",
  },
  variants: {
    variant: {
      default: { root: "bg-[var(--panel-secondary)]" },
      ghost: { root: "bg-transparent" },
    },
    size: {
      xs: {
        root: "h-[56px] gap-[8px] rounded-[var(--panel-radius-md)] px-[16px]",
        label: "text-[24px] leading-[1.333333]",
      },
      sm: {
        root: "h-[72px] gap-[12px] px-[20px]",
        label: "text-[28px] leading-[1.428571]",
      },
      md: { root: "h-[88px] px-[32px]", label: "text-[32px] leading-[1.5]" },
      lg: {
        root: "h-[96px] px-[48px]",
        label: "text-[36px] leading-[1.555556]",
      },
      xl: {
        root: "h-[112px] px-[64px]",
        label: "text-[36px] leading-[1.555556]",
      },
    },
    selected: {
      true: {
        root: "border-[var(--panel-primary-opacity-24)] bg-[var(--panel-accent)]",
        label: "text-[color:var(--panel-accent-foreground)]",
      },
      false: { label: "text-[color:var(--panel-muted-foreground)]" },
    },
    iconOnly: {
      true: { root: "px-[0px]" },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  compoundVariants: [
    { iconOnly: true, size: "xs", class: { root: "w-[56px]" } },
    { iconOnly: true, size: "sm", class: { root: "w-[72px]" } },
    { iconOnly: true, size: "md", class: { root: "w-[88px]" } },
    { iconOnly: true, size: "lg", class: { root: "w-[96px]" } },
    { iconOnly: true, size: "xl", class: { root: "w-[112px]" } },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
