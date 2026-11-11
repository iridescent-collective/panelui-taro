import { tv } from "../../lib/variants";

export const countdownVariants = tv({
  slots: {
    root: "flex flex-row items-start",
    segment: "items-center",
    digits: "flex flex-row",
    digit: "font-semibold text-[color:var(--panel-foreground)] tabular-nums",
    label:
      "font-medium tracking-wider text-[color:var(--panel-muted-foreground)] uppercase",
    separator:
      "font-semibold text-[color:var(--panel-muted-foreground)] tabular-nums",
    suffix: "font-semibold text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      segmented: {
        root: "gap-[16px]",
        segment:
          "gap-[12px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] shadow-sm",
      },
      inline: {
        root: "items-baseline",
        segment: "flex flex-row items-baseline",
      },
    },
    size: {
      sm: {
        digit: "text-[36px] leading-[1.555556]",
        label: "text-[20px]",
        separator: "text-[36px] leading-[1.555556]",
        suffix: "text-[28px] leading-[1.428571]",
      },
      md: {
        digit: "text-[60px] leading-[1.2]",
        label: "text-[20px]",
        separator: "text-[60px] leading-[1.2]",
        suffix: "text-[40px] leading-[1.4]",
      },
      lg: {
        digit: "text-[72px] leading-[1.111111]",
        label: "text-[22px]",
        separator: "text-[72px] leading-[1.111111]",
        suffix: "text-[48px] leading-[1.333333]",
      },
    },
  },
  compoundVariants: [
    {
      variant: "segmented",
      size: "sm",
      class: { segment: "min-w-[96px] px-[16px] py-[12px]" },
    },
    {
      variant: "segmented",
      size: "md",
      class: { segment: "min-w-[128px] px-[24px] py-[20px]" },
    },
    {
      variant: "segmented",
      size: "lg",
      class: { segment: "min-w-[128px] px-[24px] py-[24px]" },
    },
  ],
  defaultVariants: { variant: "segmented", size: "md" },
});
