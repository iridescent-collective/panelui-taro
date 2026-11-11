import { tv } from "../../lib/variants";

export const dialogFooterVariants = tv({
  base: "flex flex-row items-center justify-end gap-[16px]",
  variants: {
    variant: {
      plain: "mt-[32px]",
      panel:
        "mt-[40px] rounded-b-[var(--panel-radius-2xl)] border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-inset)]",
    },
  },
  defaultVariants: {
    variant: "plain",
  },
});
