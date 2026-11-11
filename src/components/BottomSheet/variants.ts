import { tv } from "../../lib/variants";

export const sheetVariants = tv({
  base: "border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[40px] pt-[16px] shadow-lg",
  variants: {
    detached: {
      false: "rounded-t-[var(--panel-radius-3xl)] border-b-[0px] border-solid",
      true: "mx-[32px] rounded-[var(--panel-radius-3xl)]",
    },
  },
  defaultVariants: {
    detached: false,
  },
});
