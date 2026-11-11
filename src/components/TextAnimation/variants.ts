import { tv } from "../../lib/variants";

export const textAnimationVariants = tv({
  slots: {
    digits: "flex flex-row items-center tabular-nums",
    column: "items-center",
    caret: "text-[color:var(--panel-foreground)]",
    highlight: "rounded-[var(--panel-radius-lg)] bg-[var(--panel-secondary)]",
  },
});
