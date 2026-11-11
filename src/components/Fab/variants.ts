import { tv } from "../../lib/variants";

export const fabVariants = tv({
  slots: {
    root: "items-center justify-center rounded-full bg-[var(--panel-primary)] shadow-lg",
    content: "flex flex-row items-center justify-center gap-[16px]",
    label: "font-medium text-[color:var(--panel-primary-foreground)]",
  },
  variants: {
    size: {
      sm: {
        root: "h-[88px] min-w-[88px]",
        label: "text-[28px] leading-[1.428571]",
      },
      md: {
        root: "h-[112px] min-w-[112px]",
        label: "text-[32px] leading-[1.5]",
      },
      lg: {
        root: "h-[128px] min-w-[128px]",
        label: "text-[36px] leading-[1.555556]",
      },
    },
    extended: {
      true: {},
      false: {},
    },
    variant: {
      primary: {
        root: "bg-[var(--panel-primary)]",
        label: "text-[color:var(--panel-primary-foreground)]",
      },
      secondary: {
        root: "bg-[var(--panel-secondary)]",
        label: "text-[color:var(--panel-secondary-foreground)]",
      },
      surface: {
        root: "border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)]",
        label: "text-[color:var(--panel-foreground)]",
      },
      destructive: {
        root: "bg-[var(--panel-destructive)]",
        label: "text-[color:var(--panel-destructive-solid-foreground)]",
      },
    },
    disabled: {
      true: { root: "opacity-[0.64] shadow-none" },
    },
    glass: {
      true: { root: "border-[0px] border-solid bg-transparent shadow-none" },
    },
  },
  compoundVariants: [
    {
      glass: true,
      disabled: true,
      class: { root: "opacity-100", content: "opacity-[0.64]" },
    },
    { extended: true, size: "sm", class: { root: "px-[32px]" } },
    { extended: true, size: "md", class: { root: "px-[40px]" } },
    { extended: true, size: "lg", class: { root: "px-[48px]" } },
    { extended: false, size: "sm", class: { root: "w-[88px]" } },
    { extended: false, size: "md", class: { root: "w-[112px]" } },
    { extended: false, size: "lg", class: { root: "w-[128px]" } },
  ],
  defaultVariants: {
    size: "md",
    variant: "primary",
    extended: false,
    glass: false,
  },
});
