import { tv } from "../../lib/variants";

export const markerVariants = tv({
  slots: {
    root: "flex w-full flex-row items-center gap-[16px] py-[12px]",
    content:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      default: {},
      border: {
        root: "border-b-[2px] border-solid border-[var(--panel-border)] pb-[20px]",
      },
      separator: {
        root: "gap-[24px] py-[24px]",
        content: "text-[24px] leading-[1.333333] tracking-wider uppercase",
      },
    },
    disabled: {
      true: { root: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
