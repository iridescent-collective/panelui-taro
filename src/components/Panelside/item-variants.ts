import { tv } from "../../lib/variants";

export const itemVariants = tv({
  base: "flex shrink flex-row items-center rounded-[var(--panel-radius-xl)]",
  variants: {
    size: {
      default: "gap-[24px] px-[24px] py-[20px]",
      sm: "gap-[20px] px-[20px] py-[16px]",
    },
    active: { true: "bg-[var(--panel-secondary)]" },
    disabled: { true: "opacity-40" },
  },
  defaultVariants: {
    size: "default",
  },
});
