import { tv } from "../../lib/variants";

export const compareVariants = tv({
  slots: {
    root: "w-full overflow-hidden rounded-[var(--panel-radius-xl)] bg-[var(--panel-muted)]",
    seam: "absolute items-center justify-center",
    line: "absolute bg-[var(--panel-background)]",
    knob: "items-center justify-center rounded-full border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] shadow-md",
    grip: "rounded-full bg-[var(--panel-foreground-opacity-60)]",
  },
  variants: {
    orientation: {
      horizontal: {
        seam: "top-[0px] bottom-[0px]",
        line: "h-full w-[4px]",
        grip: "h-[28px] w-[8px]",
      },
      vertical: {
        seam: "right-[0px] left-[0px]",
        line: "h-[4px] w-full",
        grip: "h-[8px] w-[28px]",
      },
    },
  },
  defaultVariants: { orientation: "horizontal" },
});
