import { tv } from "../../lib/variants";

export const messageVariants = tv({
  slots: {
    root: "flex w-full flex-row items-end gap-[16px]",
    avatar: "shrink-0",
    content: "max-w-[85%] gap-[8px]",
    header:
      "text-[24px] leading-[1.333333] font-medium text-[color:var(--panel-muted-foreground)]",
    bubble: "rounded-[var(--panel-radius-2xl)] px-[28px] py-[20px]",
    bubbleContent: "text-[32px] leading-[1.5]",
    footer:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    group: "w-full gap-[8px]",
  },
  variants: {
    align: {
      start: {
        root: "flex flex-row justify-start",
        content: "items-start",
        bubble: "rounded-es-[var(--panel-radius-md)] bg-[var(--panel-muted)]",
        bubbleContent: "text-[color:var(--panel-foreground)]",
        header: "text-start",
        footer: "text-start",
      },
      end: {
        root: "flex-row-reverse justify-start",
        content: "items-end",
        bubble: "rounded-ee-[var(--panel-radius-md)] bg-[var(--panel-primary)]",
        bubbleContent: "text-[color:var(--panel-primary-foreground)]",
        header: "text-end",
        footer: "text-end",
      },
    },
  },
  defaultVariants: {
    align: "start",
  },
});
