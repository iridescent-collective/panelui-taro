import { tv } from "../../lib/variants";

export const footerVariants = tv({
  base: "flex flex-row items-center gap-[16px]",
  variants: {
    variant: {
      plain: "p-[48px] pt-[0px]",
      panel:
        "rounded-b-[var(--panel-radius-2xl)] border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-inset)] p-[48px]",
    },
  },
  defaultVariants: {
    variant: "plain",
  },
});
