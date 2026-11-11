import { tv } from "../../lib/variants";

export const splitViewVariants = tv({
  slots: {
    root: "flex w-full flex-col overflow-hidden",
    top: "w-full overflow-hidden",
    bottom: "w-full flex-1 overflow-hidden",
    dragArea: "w-full items-center justify-center",
    handle: "rounded-full",
  },
  variants: {
    variant: {
      panes: {
        root: "bg-[var(--panel-inset)]",
        top: "rounded-[var(--panel-radius-2xl)] bg-[var(--panel-surface)]",
        bottom: "rounded-[var(--panel-radius-2xl)] bg-[var(--panel-surface)]",
        dragArea: "py-[24px]",
        handle:
          "h-[12px] w-[96px] bg-[var(--panel-muted-foreground-opacity-50)]",
      },
      seam: {
        dragArea: "py-[16px]",
        handle:
          "h-[8px] w-[80px] bg-[var(--panel-muted-foreground-opacity-30)]",
      },
    },
  },
  defaultVariants: {
    variant: "panes",
  },
});
