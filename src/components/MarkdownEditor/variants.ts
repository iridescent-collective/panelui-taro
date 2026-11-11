import { tv } from "../../lib/variants";

export const markdownEditorVariants = tv({
  defaultVariants: { variant: "bar" },
  slots: {
    capsule:
      "flex min-w-[0px] shrink flex-row items-center overflow-hidden rounded-full border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-popover)] px-[12px] shadow-lg",
    divider: "mx-[8px] h-[40px] w-[2px] bg-[var(--panel-border)]",
    empty: "py-[48px] text-center",
    escape:
      "h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-popover)] shadow-lg",
    preview:
      "w-full rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-popover)] px-[24px] py-[20px]",
    root: "w-full gap-[16px]",
    toolbar: "flex flex-row items-center justify-between gap-[16px]",
  },
  variants: {
    variant: {
      bar: {},
      pill: { toolbar: "justify-center gap-[16px]" },
    },
  },
});
