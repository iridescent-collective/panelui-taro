import { tv } from "../../lib/variants";

export const menuVariants = tv({
  slots: {
    content: "gap-[4px] rounded-[var(--panel-radius-3xl)] p-[12px]",
    background:
      "absolute inset-[0px] rounded-[var(--panel-radius-3xl)] bg-[var(--panel-overlay)]",
    label: "px-[24px] pt-[16px] pb-[8px]",
    item: "flex w-full flex-row items-center gap-[20px] rounded-[var(--panel-radius-2xl)] px-[20px] py-[20px]",
    itemLabel:
      "text-[32px] leading-[1.5] font-medium text-[color:var(--panel-overlay-foreground)]",
    itemDescription: "text-[28px] leading-[1.428571]",
    shortcut: "text-[24px] leading-[1.333333] tracking-widest",
    separator: "my-[8px] h-[2px] bg-[var(--panel-border)]",
    indicator: "items-center justify-center",
  },
  variants: {
    variant: {
      default: {},
      destructive: {
        itemLabel: "text-[color:var(--panel-destructive)]",
      },
    },
    disabled: {
      true: { item: "opacity-[0.45]" },
    },
    inset: {
      true: { item: "ps-[76px]", label: "ps-[76px]" },
    },
  },
  defaultVariants: {
    variant: "default",
    disabled: false,
    inset: false,
  },
});
