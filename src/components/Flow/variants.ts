import { tv } from "../../lib/variants";

export const flowVariants = tv({
  slots: {
    root: "flex-1 overflow-hidden bg-[var(--panel-background)]",
    controls:
      "absolute right-[32px] bottom-[32px] flex flex-col overflow-hidden rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
    control:
      "flex h-[80px] w-[80px] flex-col items-center justify-center active:bg-[var(--panel-muted)]",
    minimap:
      "absolute overflow-hidden rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card-opacity-90)]",
    handle:
      "absolute h-[28px] w-[28px] rounded-full border-[4px] border-solid border-[var(--panel-background)] bg-[var(--panel-muted-foreground)]",
  },
});
