import { tv } from "../../lib/variants";

export const numberInputVariants = tv({
  slots: {
    container: "w-full gap-[12px]",
    control:
      "flex w-full flex-row items-center overflow-hidden rounded-[var(--panel-radius-lg)] border-[2px] border-solid",
    button: "h-full items-center justify-center",
    field:
      "h-full flex-1 text-center font-medium text-[color:var(--panel-foreground)]",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    error:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
  },
  variants: {
    variant: {
      outline: {
        control: "border-[var(--panel-input)] bg-[var(--panel-background)]",
      },
      filled: { control: "border-transparent bg-[var(--panel-muted)]" },
    },
    size: {
      sm: { control: "h-[80px]", button: "w-[80px]" },
      md: { control: "h-[96px]", button: "w-[96px]" },
      lg: { control: "h-[112px]", button: "w-[112px]" },
    },
    invalid: {
      true: { control: "border-[var(--panel-destructive)]" },
    },
    disabled: {
      true: { container: "opacity-[0.64]" },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});
