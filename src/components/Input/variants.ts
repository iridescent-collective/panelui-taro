import { tv } from "../../lib/variants";

export const inputVariants = tv({
  slots: {
    container: "w-full gap-[12px]",
    field:
      "w-full rounded-[var(--panel-radius-lg)] border-[2px] border-solid font-normal text-[color:var(--panel-foreground)]",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    error:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
    fieldBox: "relative w-full",
    startContent:
      "absolute start-0 top-[0px] bottom-[0px] z-10 flex flex-row items-center justify-center gap-[16px]",
    endContent:
      "absolute end-0 top-[0px] bottom-[0px] z-10 flex flex-row items-center justify-center gap-[16px]",
  },
  variants: {
    variant: {
      outline: { field: "bg-[var(--panel-background)]" },
      filled: { field: "bg-[var(--panel-muted)]" },
    },
    size: {
      xs: {
        field: "h-[64px] px-[20px] text-[26px]",
        startContent: "px-[20px]",
        endContent: "px-[20px]",
      },
      sm: {
        field: "h-[80px] px-[24px] text-[28px]",
        startContent: "px-[24px]",
        endContent: "px-[24px]",
      },
      md: {
        field: "h-[96px] px-[28px] text-[32px]",
        startContent: "px-[28px]",
        endContent: "px-[28px]",
      },
      lg: {
        field: "h-[112px] px-[32px] text-[32px]",
        startContent: "px-[32px]",
        endContent: "px-[32px]",
      },
      xl: {
        field: "h-[128px] px-[40px] text-[36px]",
        startContent: "px-[40px]",
        endContent: "px-[40px]",
      },
    },
    multiline: {
      true: {
        field: "h-auto min-h-[192px] py-[24px] leading-normal",
        startContent: "bottom-auto py-[24px]",
        endContent: "bottom-auto py-[24px]",
      },
    },
    disabled: {
      true: {
        field: "opacity-[0.64]",
        startContent: "opacity-[0.64]",
        endContent: "opacity-[0.64]",
      },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});
