import { tv } from "../../lib/variants";

export const progressButtonVariants = tv({
  slots: {
    root: "relative overflow-hidden border-[2px] border-solid border-transparent bg-[var(--panel-secondary)]",
    content: "flex flex-row items-center justify-center gap-[16px]",
    label: "min-w-[0px] shrink text-center font-medium",
    fill: "",
    fillLabel: "min-w-[0px] shrink text-center font-medium",
  },
  variants: {
    variant: {
      primary: {
        label: "text-[color:var(--panel-primary)]",
        fill: "bg-[var(--panel-primary)]",
        fillLabel: "text-[color:var(--panel-primary-foreground)]",
      },
      secondary: {
        label: "text-[color:var(--panel-secondary-foreground)]",
        fill: "bg-[var(--panel-foreground)]",
        fillLabel: "text-[color:var(--panel-background)]",
      },
      destructive: {
        label: "text-[color:var(--panel-destructive)]",
        fill: "bg-[var(--panel-destructive)]",
        fillLabel: "text-[color:var(--panel-destructive-solid-foreground)]",
      },
      success: {
        label: "text-[color:var(--panel-success)]",
        fill: "bg-[var(--panel-success)]",
        fillLabel: "text-[color:var(--panel-success-solid-foreground)]",
      },
    },
    size: {
      sm: {
        root: "min-h-[72px]",
        content: "min-h-[72px] gap-[12px] py-[16px]",
        label: "text-[28px]",
        fillLabel: "text-[28px]",
      },
      md: {
        root: "min-h-[88px]",
        content: "min-h-[88px] py-[20px]",
        label: "text-[32px]",
        fillLabel: "text-[32px]",
      },
      lg: {
        root: "min-h-[96px]",
        content: "min-h-[96px] py-[20px]",
        label: "text-[36px]",
        fillLabel: "text-[36px]",
      },
    },
    shape: {
      pill: { root: "rounded-full" },
      rounded: { root: "rounded-[var(--panel-radius-lg)]" },
    },
    fullWidth: {
      true: { root: "w-full" },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  compoundVariants: [
    { shape: "pill", size: "sm", class: { content: "px-[28px]" } },
    { shape: "pill", size: "md", class: { content: "px-[40px]" } },
    { shape: "pill", size: "lg", class: { content: "px-[56px]" } },
    {
      shape: "rounded",
      size: "sm",
      class: { root: "min-w-[72px]", content: "px-[20px]" },
    },
    {
      shape: "rounded",
      size: "md",
      class: { root: "min-w-[88px]", content: "px-[32px]" },
    },
    { shape: "rounded", size: "lg", class: { content: "px-[48px]" } },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
    shape: "pill",
  },
});
