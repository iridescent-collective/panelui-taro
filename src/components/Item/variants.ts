import { tv } from "../../lib/variants";

export const itemVariants = tv({
  slots: {
    root: "gap-[24px] rounded-[var(--panel-radius-xl)]",
    title: "font-medium text-[color:var(--panel-foreground)]",
    description: "text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      default: {},
      outline: {
        root: "border-[2px] border-solid border-[var(--panel-border)]",
      },
      muted: { root: "bg-[var(--panel-muted)]" },
    },
    size: {
      default: {
        root: "p-[32px]",
        title: "text-[32px] leading-[1.5]",
        description: "text-[28px] leading-[1.428571]",
      },
      sm: {
        root: "p-[24px]",
        title: "text-[28px] leading-[1.428571]",
        description: "text-[24px] leading-[1.333333]",
      },
      xs: {
        root: "gap-[16px] p-[16px]",
        title: "text-[28px] leading-[1.428571]",
        description: "text-[24px] leading-[1.333333]",
      },
    },
    orientation: {
      horizontal: { root: "flex w-full flex-row items-center" },
      vertical: { root: "flex flex-col items-start" },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    orientation: "horizontal",
  },
});

export const mediaVariants = tv({
  base: "shrink-0 items-center justify-center",
  variants: {
    variant: {
      default: "",
      icon: "rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted)]",
      image:
        "overflow-hidden rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)]",
    },
    size: {
      default: "",
      sm: "",
      xs: "",
    },
  },
  compoundVariants: [
    { variant: "icon", size: "default", class: "h-[80px] w-[80px]" },
    { variant: "icon", size: "sm", class: "h-[64px] w-[64px]" },
    { variant: "icon", size: "xs", class: "h-[48px] w-[48px]" },
    { variant: "image", size: "default", class: "h-[96px] w-[96px]" },
    { variant: "image", size: "sm", class: "h-[80px] w-[80px]" },
    { variant: "image", size: "xs", class: "h-[64px] w-[64px]" },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
