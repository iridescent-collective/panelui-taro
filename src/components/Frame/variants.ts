import { tv } from "../../lib/variants";

export const frameVariants = tv({
  slots: {
    root: "",
    recess: "absolute inset-[0px] bg-[var(--panel-inset)]",
    panel: "overflow-hidden bg-[var(--panel-card)]",
    header:
      "flex flex-row items-center justify-between gap-[24px] px-[32px] pt-[20px] pb-[24px]",
    footer:
      "flex flex-row items-center gap-[16px] px-[32px] pt-[24px] pb-[28px]",
  },
  variants: {
    variant: {
      default: {
        root: "overflow-hidden rounded-[var(--panel-radius-3xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-surface)]",
        panel:
          "rounded-t-[var(--panel-radius-2xl)] border-t-[2px] border-solid border-[var(--panel-border)]",
      },
      plain: {
        root: "",
        panel:
          "rounded-[var(--panel-radius-3xl)] border-[2px] border-solid border-[var(--panel-border)]",
        footer: "px-[0px]",
      },
      inset: {
        root: "overflow-hidden bg-[var(--panel-popover)]",
        panel: "bg-[var(--panel-popover)]",
        header: "px-[24px] pt-[8px] pb-[20px]",
        footer: "gap-[28px] p-[0px]",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
