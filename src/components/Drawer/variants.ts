import { tv } from "../../lib/variants";

export const panelVariants = tv({
  base: "absolute border-[var(--panel-border)] bg-[var(--panel-popover)] shadow-lg",
  variants: {
    side: {
      start:
        "start-0 top-[0px] bottom-[0px] rounded-e-[var(--panel-radius-3xl)] border-e-[2px] border-solid",
      end: "end-0 top-[0px] bottom-[0px] rounded-s-[var(--panel-radius-3xl)] border-s-[2px] border-solid",
      top: "start-0 end-0 top-[0px] rounded-b-[var(--panel-radius-3xl)] border-b-[2px] border-solid",
      bottom:
        "start-0 end-0 bottom-[0px] rounded-t-[var(--panel-radius-3xl)] border-t-[2px] border-solid",
    },
  },
  defaultVariants: {
    side: "start",
  },
});
