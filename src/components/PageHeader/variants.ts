import { tv } from "../../lib/variants";

export const pageHeaderVariants = tv({
  slots: {
    root: "w-full",
    cover: "overflow-hidden bg-[var(--panel-muted)]",
    avatar: "self-start",
    ring: "overflow-hidden rounded-full",
    row: "flex flex-row items-center gap-[40px]",
    content: "gap-[8px]",
    meta: "flex flex-row items-center gap-[12px]",
    stats: "flex flex-row items-center",
    actions: "flex flex-row items-center gap-[16px]",
  },
  variants: {
    variant: {
      card: {
        root: "overflow-hidden rounded-[var(--panel-radius-3xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[16px]",
        cover: "rounded-t-[var(--panel-radius-2xl)]",
        ring: "border-[var(--panel-card)]",
        avatar: "px-[24px]",
        row: "px-[24px]",
        content: "px-[24px] pt-[24px]",
        actions: "px-[24px] pt-[32px] pb-[16px]",
      },
      page: {
        root: "bg-[var(--panel-background)]",
        ring: "border-[var(--panel-background)]",
        avatar: "px-[32px]",
        row: "px-[32px]",
        content: "px-[32px] pt-[24px]",
        actions: "px-[32px] pt-[32px] pb-[32px]",
      },
    },
    align: {
      start: {},
      center: {
        avatar: "self-center",
        row: "justify-center",
        content: "items-center",
        meta: "justify-center",
        stats: "justify-center",
        actions: "justify-center",
      },
    },
  },
  defaultVariants: {
    variant: "card",
    align: "center",
  },
});
