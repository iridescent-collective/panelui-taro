import { tv } from "../../lib/variants";

export const slideButtonVariants = tv({
  slots: {
    root: "relative flex flex-row items-center overflow-hidden rounded-full border-[2px] border-solid border-transparent bg-[var(--panel-secondary)]",
    fill: "absolute rounded-full",
    label: "text-center font-medium",
    thumb:
      "absolute items-center justify-center rounded-full bg-[var(--panel-card)] shadow-sm",
    thumbContent: "items-center justify-center",
  },
  variants: {
    variant: {
      secondary: {
        label: "text-[color:var(--panel-secondary-foreground)]",
        fill: "bg-[var(--panel-foreground-opacity-10)]",
      },
      destructive: {
        label: "text-[color:var(--panel-destructive)]",
        fill: "bg-[var(--panel-destructive-opacity-20)]",
      },
      success: {
        label: "text-[color:var(--panel-success)]",
        fill: "bg-[var(--panel-success-opacity-20)]",
      },
    },
    size: {
      sm: { root: "min-h-[88px] p-[8px]", label: "text-[28px]" },
      md: { root: "min-h-[104px] p-[8px]", label: "text-[32px]" },
      lg: { root: "min-h-[112px] p-[8px]", label: "text-[36px]" },
    },
    fullWidth: {
      true: { root: "w-full" },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "md",
  },
});
