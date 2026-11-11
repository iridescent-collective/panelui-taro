import { tv } from "../../lib/variants";

export const tagInputVariants = tv({
  slots: {
    container: "w-full gap-[12px]",
    field:
      "flex w-full flex-row flex-wrap items-center rounded-[var(--panel-radius-lg)] border-[2px] border-solid",
    input:
      "min-w-[192px] flex-1 py-[0px] font-normal text-[color:var(--panel-foreground)]",
    clear: "items-center justify-center rounded-full",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    error:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
    count:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
  },
  variants: {
    variant: {
      outline: { field: "bg-[var(--panel-background)]" },
      filled: { field: "bg-[var(--panel-muted)]" },
    },
    size: {
      sm: {
        field: "gap-[8px] px-[20px] py-[12px]",
        input: "h-[56px] text-[28px]",
        clear: "h-[40px] w-[40px]",
      },
      md: {
        field: "gap-[12px] px-[24px] py-[16px]",
        input: "h-[64px] text-[32px]",
        clear: "h-[48px] w-[48px]",
      },
      lg: {
        field: "gap-[16px] px-[28px] py-[20px]",
        input: "h-[80px] text-[32px]",
        clear: "h-[56px] w-[56px]",
      },
    },
    disabled: {
      true: { field: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});
