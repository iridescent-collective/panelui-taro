import { tv } from "../../lib/variants";

export const tooltipVariants = tv({
  slots: {
    content: "rounded-[var(--panel-radius-lg)] px-[20px] py-[12px] shadow-md",
    text: "text-[28px] leading-[1.428571] font-medium",
    title: "text-[28px] leading-[1.428571] font-semibold",
    description: "text-[28px] leading-[1.428571]",
    arrow: "rounded-[2px]",
  },
  variants: {
    variant: {
      inverted: {
        content: "bg-[var(--panel-foreground)]",
        text: "text-[color:var(--panel-background)]",
        title: "text-[color:var(--panel-background)]",
        description: "text-[color:var(--panel-background-opacity-70)]",
        arrow: "bg-[var(--panel-foreground)]",
      },
      surface: {
        content:
          "border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)]",
        text: "text-[color:var(--panel-popover-foreground)]",
        title: "text-[color:var(--panel-popover-foreground)]",
        description: "text-[color:var(--panel-muted-foreground)]",
        arrow: "border-[var(--panel-border)] bg-[var(--panel-popover)]",
      },
    },
  },
  defaultVariants: {
    variant: "inverted",
  },
});
