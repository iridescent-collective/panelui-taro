import { tv } from "../../lib/variants";

export const buttonGroupVariants = tv({
  slots: {
    root: "items-stretch",
    divider: "bg-[var(--panel-border)]",
  },
  variants: {
    orientation: {
      horizontal: { root: "flex flex-row", divider: "w-[2px]" },
      vertical: { root: "flex flex-col", divider: "h-[2px]" },
    },
    attached: {
      true: {
        root: "overflow-hidden border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-popover)] shadow-sm",
      },
      false: { root: "gap-[16px]" },
    },
    size: {
      xs: { root: "rounded-[var(--panel-radius-md)]" },
      sm: { root: "rounded-[var(--panel-radius-lg)]" },
      md: { root: "rounded-[var(--panel-radius-xl)]" },
      lg: { root: "rounded-[var(--panel-radius-xl)]" },
      xl: { root: "rounded-[var(--panel-radius-2xl)]" },
      icon: { root: "rounded-[var(--panel-radius-xl)]" },
    },
    fullWidth: {
      true: { root: "w-full" },
    },
  },
  compoundVariants: [{ attached: false, class: { root: "rounded-none" } }],
  defaultVariants: {
    orientation: "horizontal",
    attached: true,
    size: "md",
  },
});
