import { tv } from "../../lib/variants";

export const chipVariants = tv({
  slots: {
    root: "flex flex-row items-center self-start rounded-full border-[2px] border-solid border-transparent",
    label: "font-medium",
    close:
      "-me-[8px] aspect-square items-center justify-center rounded-full opacity-70",
  },
  variants: {
    variant: {
      default: {
        root: "bg-[var(--panel-secondary)]",
        label: "text-[color:var(--panel-secondary-foreground)]",
      },
      primary: {
        root: "bg-[var(--panel-primary)]",
        label: "text-[color:var(--panel-primary-foreground)]",
      },
      outline: {
        root: "border-[var(--panel-border)] bg-transparent",
        label: "text-[color:var(--panel-foreground)]",
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
      destructive: {
        root: "bg-[var(--panel-destructive-subtle)]",
        label: "text-[color:var(--panel-destructive-foreground)]",
      },
    },
    size: {
      xs: { root: "h-[40px] gap-[4px] px-[12px]", label: "text-[22px]" },
      sm: {
        root: "h-[48px] gap-[8px] px-[16px]",
        label: "text-[24px] leading-[1.333333]",
      },
      md: {
        root: "h-[56px] gap-[12px] px-[20px]",
        label: "text-[28px] leading-[1.428571]",
      },
      lg: {
        root: "h-[72px] gap-[16px] px-[28px]",
        label: "text-[32px] leading-[1.5]",
      },
      xl: {
        root: "h-[88px] gap-[16px] px-[32px]",
        label: "text-[32px] leading-[1.5]",
      },
    },
    selected: {
      true: {
        root: "border-[var(--panel-primary-opacity-24)] bg-[var(--panel-accent)]",
        label: "text-[color:var(--panel-accent-foreground)]",
      },
    },
    closable: {
      true: { root: "pe-[8px]" },
    },
    disabled: {
      true: { root: "opacity-[0.56]" },
    },
  },
  compoundVariants: [
    { size: "xs", closable: true, class: { close: "h-[28px]" } },
    { size: "sm", closable: true, class: { close: "h-[32px]" } },
    { size: "md", closable: true, class: { close: "h-[40px]" } },
    { size: "lg", closable: true, class: { close: "h-[48px]" } },
    { size: "xl", closable: true, class: { close: "h-[56px]" } },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
