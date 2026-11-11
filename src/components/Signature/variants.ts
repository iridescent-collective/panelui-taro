import { tv } from "../../lib/variants";

export const signatureVariants = tv({
  slots: {
    root: "overflow-hidden rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
    pad: "flex-1",
    placeholder: "absolute inset-[0px] items-center justify-center gap-[16px]",
    guide: "absolute inset-x-[48px] flex flex-row items-center gap-[24px]",
    toolbar:
      "flex flex-row items-center justify-between gap-[16px] px-[24px] py-[16px]",
  },
  variants: {
    size: {
      sm: { root: "h-[256px]" },
      md: { root: "h-[384px]" },
      lg: { root: "h-[512px]" },
      full: { root: "h-auto flex-1 rounded-none border-[0px] border-solid" },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
