import { tv } from "../../lib/variants";

export const buttonVariants = tv({
  slots: {
    root: "flex flex-row items-center justify-center gap-[16px] rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-transparent",
    label: "min-w-[0px] shrink text-center font-medium",
    spinner: "",
  },
  variants: {
    variant: {
      primary: {
        root: "border-[var(--panel-primary)] bg-[var(--panel-primary)] shadow-sm",
        label: "text-[color:var(--panel-primary-foreground)]",
        spinner:
          "border-[var(--panel-primary-foreground-opacity-32)] border-t-[var(--panel-primary-foreground)]",
      },
      secondary: {
        root: "bg-[var(--panel-secondary)]",
        label: "text-[color:var(--panel-secondary-foreground)]",
        spinner:
          "border-[var(--panel-secondary-foreground-opacity-24)] border-t-[var(--panel-secondary-foreground)]",
      },
      outline: {
        root: "border-[var(--panel-input)] bg-[var(--panel-popover)] shadow-sm",
        label: "text-[color:var(--panel-foreground)]",
        spinner:
          "border-[var(--panel-muted)] border-t-[var(--panel-foreground)]",
      },
      ghost: {
        root: "bg-transparent",
        label: "text-[color:var(--panel-foreground)]",
        spinner:
          "border-[var(--panel-muted)] border-t-[var(--panel-foreground)]",
      },
      destructive: {
        root: "border-[var(--panel-destructive)] bg-[var(--panel-destructive)] shadow-sm",
        label: "text-[color:var(--panel-destructive-solid-foreground)]",
        spinner:
          "border-[var(--panel-destructive-solid-foreground-opacity-32)] border-t-[var(--panel-destructive-solid-foreground)]",
      },
      social: {
        root: "border-[var(--panel-input)] bg-[var(--panel-card)] shadow-sm",
        label: "text-[color:var(--panel-foreground)]",
        spinner:
          "border-[var(--panel-muted)] border-t-[var(--panel-foreground)]",
      },
    },
    size: {
      xs: {
        root: "min-h-[56px] min-w-[56px] gap-[8px] rounded-[var(--panel-radius-md)] px-[16px] py-[8px]",
        label: "text-[24px]",
      },
      sm: {
        root: "min-h-[72px] min-w-[72px] gap-[12px] px-[20px] py-[16px]",
        label: "text-[28px]",
      },
      md: {
        root: "min-h-[88px] min-w-[88px] px-[32px] py-[20px]",
        label: "text-[32px]",
      },
      lg: { root: "min-h-[96px] px-[48px] py-[20px]", label: "text-[36px]" },
      xl: { root: "min-h-[112px] px-[64px] py-[24px]", label: "text-[36px]" },
      icon: { root: "h-[88px] w-[88px] px-[0px]" },
    },
    fullWidth: {
      true: { root: "w-full" },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
