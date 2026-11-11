import { tv } from "../../lib/variants";

export const mapVariants = tv({
  defaultVariants: { position: "bottom-right" },
  slots: {
    control:
      "flex h-[72px] w-[72px] items-center justify-center active:bg-[var(--panel-muted)]",
    controls: "absolute flex flex-col gap-[16px]",
    group:
      "flex flex-col overflow-hidden rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] shadow-sm",
    label:
      "rounded-[var(--panel-radius-md)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background-opacity-95)] shadow-sm",
    labelText: "text-[color:var(--panel-foreground)]",
    overlay: "absolute flex flex-col",
    pin: "h-[28px] w-[28px] rounded-full border-[4px] border-solid border-[var(--panel-background)] bg-[var(--panel-primary)] shadow-md",
    popup:
      "rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[24px] py-[16px] shadow-lg",
    root: "flex h-full flex-1 flex-col overflow-hidden",
  },
  variants: {
    position: {
      "bottom-left": { controls: "bottom-[24px] left-[24px]" },
      "bottom-right": { controls: "right-[24px] bottom-[24px]" },
      "top-left": { controls: "top-[24px] left-[24px]" },
      "top-right": { controls: "top-[24px] right-[24px]" },
    },
  },
});
