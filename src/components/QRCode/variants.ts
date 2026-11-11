import { tv } from "../../lib/variants";

export const qrCodeVariants = tv({
  slots: {
    root: "items-center gap-[24px]",
    frame:
      "w-full overflow-hidden rounded-[var(--panel-radius-3xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-surface)]",
    header:
      "flex w-full flex-row items-center justify-between gap-[24px] px-[32px] pt-[20px] pb-[24px]",
    panel:
      "relative items-center justify-center overflow-hidden rounded-t-[var(--panel-radius-2xl)] border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[32px]",
    caption:
      "text-center text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    value:
      "text-center text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
  defaultVariants: {
    size: "md",
  },
});
