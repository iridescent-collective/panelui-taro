import { tv } from "../../lib/variants";

export const badgeVariants = tv({
  slots: {
    root: "flex flex-row items-center justify-center gap-[8px] self-start rounded-[var(--panel-radius-sm)] border-[2px] border-solid border-transparent",
    label: "font-medium",
  },
  variants: {
    size: {
      xs: { root: "px-[8px] py-[2px]", label: "text-[20px]" },
      sm: { root: "px-[12px] py-[2px]", label: "text-[22px]" },
      md: {
        root: "px-[16px] py-[4px]",
        label: "text-[24px] leading-[1.333333]",
      },
      lg: {
        root: "px-[20px] py-[8px]",
        label: "text-[28px] leading-[1.428571]",
      },
      xl: { root: "px-[24px] py-[12px]", label: "text-[32px] leading-[1.5]" },
    },
    shape: {
      default: {},
      dot: { root: "h-[16px] w-[16px] rounded-full px-[0px] py-[0px]" },
      count: { root: "h-[40px] min-w-[40px] rounded-full px-[12px] py-[0px]" },
    },
    variant: {
      default: {
        root: "bg-[var(--panel-primary)]",
        label: "text-[color:var(--panel-primary-foreground)]",
      },
      secondary: {
        root: "bg-[var(--panel-secondary)]",
        label: "text-[color:var(--panel-secondary-foreground)]",
      },
      outline: {
        root: "border-[var(--panel-border)] bg-transparent",
        label: "text-[color:var(--panel-foreground)]",
      },
      destructive: {
        root: "bg-[var(--panel-destructive)]",
        label: "text-[color:var(--panel-destructive-solid-foreground)]",
      },
      success: {
        root: "bg-[var(--panel-success-subtle)]",
        label: "text-[color:var(--panel-success-foreground)]",
      },
      warning: {
        root: "bg-[var(--panel-warning-subtle)]",
        label: "text-[color:var(--panel-warning-foreground)]",
      },
      info: {
        root: "bg-[var(--panel-info-subtle)]",
        label: "text-[color:var(--panel-info-foreground)]",
      },
    },
  },
  compoundVariants: [
    { shape: "dot", size: "xs", class: { root: "h-[8px] w-[8px]" } },
    { shape: "dot", size: "sm", class: { root: "h-[12px] w-[12px]" } },
    { shape: "dot", size: "lg", class: { root: "h-[20px] w-[20px]" } },
    { shape: "dot", size: "xl", class: { root: "h-[24px] w-[24px]" } },
    {
      shape: "count",
      size: "xs",
      class: { root: "h-[28px] min-w-[28px] px-[8px]" },
    },
    {
      shape: "count",
      size: "sm",
      class: { root: "h-[32px] min-w-[32px] px-[8px]" },
    },
    {
      shape: "count",
      size: "lg",
      class: { root: "h-[48px] min-w-[48px] px-[16px]" },
    },
    {
      shape: "count",
      size: "xl",
      class: { root: "h-[56px] min-w-[56px] px-[16px]" },
    },
  ],
  defaultVariants: {
    variant: "default",
    shape: "default",
    size: "md",
  },
});
