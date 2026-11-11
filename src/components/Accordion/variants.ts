import { tv } from "../../lib/variants";

export const accordionVariants = tv({
  slots: {
    root: "flex w-full flex-col overflow-hidden",
    separator: "h-[2px] bg-[var(--panel-border)]",
    item: "flex flex-col overflow-hidden",
    trigger: "flex flex-row items-center justify-between gap-[32px] py-[32px]",
    title:
      "flex-1 text-[32px] leading-[1.5] font-medium text-[color:var(--panel-foreground)]",
    indicator: "items-center justify-center",
    content: "pb-[32px]",
    contentText:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      default: { trigger: "px-[8px]", content: "px-[8px]" },
      surface: {
        root: "rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-surface)]",
        separator: "mx-[32px]",
        trigger: "px-[32px]",
        content: "px-[32px]",
      },
      separated: {
        root: "gap-[20px] overflow-visible",
        separator: "hidden",
        item: "rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
        trigger: "px-[32px]",
        content: "px-[32px]",
      },
      bordered: {
        separator: "hidden",
        item: "mb-[16px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)]",
        trigger: "px-[32px]",
        content: "px-[32px]",
      },
      ghost: {
        separator: "hidden",
        trigger: "px-[0px]",
        content: "px-[0px]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
