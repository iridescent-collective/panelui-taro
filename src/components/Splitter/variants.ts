import { tv } from "../../lib/variants";

export const splitterVariants = tv({
  slots: {
    root: "relative overflow-hidden",
    panel: "overflow-hidden",
    handle: "absolute items-center justify-center",
    line: "bg-[var(--panel-border)]",
    grip: "absolute rounded-full bg-[var(--panel-muted-foreground-opacity-30)]",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex w-full flex-row",
        handle: "start-0 top-[0px] bottom-[0px] z-10 w-[48px]",
        line: "h-full w-[2px]",
        grip: "h-[64px] w-[8px]",
      },
      vertical: {
        root: "flex flex-col",
        handle: "start-0 end-0 top-[0px] z-10 h-[48px]",
        line: "h-[2px] w-full",
        grip: "h-[8px] w-[64px]",
      },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});
