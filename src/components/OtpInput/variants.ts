import { tv } from "../../lib/variants";

export const otpVariants = tv({
  slots: {
    container: "gap-[12px]",
    row: "flex flex-row items-center",
    cell: "items-center justify-center rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-background)]",
    char: "font-normal text-[color:var(--panel-foreground)]",
    caret: "w-[4px] rounded-full bg-[var(--panel-foreground)]",
    separator: "h-[4px] rounded-full bg-[var(--panel-border)]",
    error:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
  },
  variants: {
    size: {
      sm: {
        cell: "h-[80px] w-[72px]",
        char: "text-[32px] leading-[1.5]",
        caret: "h-[40px]",
        separator: "w-[16px]",
      },
      md: {
        cell: "h-[96px] w-[88px]",
        char: "text-[36px] leading-[1.555556]",
        caret: "h-[48px]",
        separator: "w-[20px]",
      },
      lg: {
        cell: "h-[112px] w-[96px]",
        char: "text-[40px] leading-[1.4]",
        caret: "h-[56px]",
        separator: "w-[24px]",
      },
    },
    disabled: {
      true: { row: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
