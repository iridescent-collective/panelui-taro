import { tv } from "../../lib/variants";

export const textareaVariants = tv({
  slots: {
    container: "w-full gap-[12px]",
    field:
      "w-full rounded-[var(--panel-radius-lg)] border-[2px] border-solid font-normal text-[color:var(--panel-foreground)]",
    footer: "flex w-full flex-row items-start justify-between gap-[24px]",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    error:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
    count:
      "shrink-0 text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)] tabular-nums",
  },
  variants: {
    variant: {
      outline: { field: "bg-[var(--panel-background)]" },
      filled: { field: "bg-[var(--panel-muted)]" },
    },
    size: {
      xs: { field: "px-[20px] text-[26px]" },
      sm: { field: "px-[24px] text-[28px]" },
      md: { field: "px-[28px] text-[32px]" },
      lg: { field: "px-[32px] text-[32px]" },
      xl: { field: "px-[40px] text-[36px]" },
    },
    disabled: {
      true: { field: "opacity-[0.64]" },
    },
    over: {
      true: { count: "text-[color:var(--panel-destructive)]" },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});
