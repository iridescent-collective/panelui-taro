import { tv } from "../../lib/variants";

export const calendarVariants = tv({
  defaultVariants: {
    bordered: true,
  },
  slots: {
    caption: "flex flex-1 flex-row items-center justify-center gap-[8px]",
    header: "flex h-[80px] flex-row items-center justify-between gap-[16px]",
    nav: "h-[64px] w-[64px] items-center justify-center rounded-full",
    root: "gap-[24px]",
  },
  variants: {
    bordered: {
      true: {
        root: "rounded-[var(--panel-radius-3xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[24px]",
      },
    },
  },
});
