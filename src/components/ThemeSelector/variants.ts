import { tv } from "../../lib/variants";

export const themeSelectorVariants = tv({
  slots: {
    root: "gap-[24px]",
    legend: "font-medium",
    options: "flex flex-row flex-wrap items-start gap-[32px]",
    option: "items-center gap-[16px]",
    frame:
      "overflow-hidden rounded-[var(--panel-radius-xl)] border-[4px] border-solid p-[8px]",
    preview: "overflow-hidden rounded-[var(--panel-radius-lg)]",
    label: "text-center",
  },
  variants: {
    selected: {
      true: {
        frame: "border-[var(--panel-primary)]",
        label: "text-[color:var(--panel-foreground)]",
      },
      false: {
        frame: "border-transparent",
        label: "text-[color:var(--panel-muted-foreground)]",
      },
    },
    disabled: {
      true: { root: "opacity-40" },
    },
  },
  defaultVariants: { selected: false },
});
