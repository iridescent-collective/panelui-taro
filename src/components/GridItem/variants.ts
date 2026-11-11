import { tv } from "../../lib/variants";

export const gridItemVariants = tv({
  slots: {
    root: "h-full w-full overflow-hidden rounded-[var(--panel-radius-2xl)]",
    title: "font-medium text-[color:var(--panel-foreground)]",
    value: "font-semibold text-[color:var(--panel-foreground)]",
    description: "text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      default: {
        root: "border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
      },
      outline: {
        root: "border-[2px] border-solid border-[var(--panel-border)]",
      },
      muted: { root: "bg-[var(--panel-muted)]" },
      plain: { root: "" },
    },
    size: {
      default: {
        root: "gap-[16px] p-[32px]",
        title: "text-[28px] leading-[1.428571]",
        value: "text-[48px] leading-[1.333333]",
        description: "text-[24px] leading-[1.333333]",
      },
      sm: {
        root: "gap-[12px] p-[24px]",
        title: "text-[24px] leading-[1.333333]",
        value: "text-[40px] leading-[1.4]",
        description: "text-[24px] leading-[1.333333]",
      },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
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
    },
  },
  compoundVariants: [
    { variant: "icon", size: "default", class: "h-[72px] w-[72px]" },
    { variant: "icon", size: "sm", class: "h-[56px] w-[56px]" },
    { variant: "image", size: "default", class: "h-[88px] w-[88px]" },
    { variant: "image", size: "sm", class: "h-[72px] w-[72px]" },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
