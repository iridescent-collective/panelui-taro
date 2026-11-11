import { tv } from "../../lib/variants";

export const choiceVariants = tv({
  slots: {
    row: "flex w-full flex-row items-start gap-[24px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] px-[28px] py-[24px]",
    indicator:
      "mt-[2px] h-[40px] w-[40px] shrink-0 items-center justify-center border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-background)]",
    label:
      "text-[32px] leading-snug font-medium text-[color:var(--panel-foreground)]",
    description:
      "text-[28px] leading-snug text-[color:var(--panel-muted-foreground)]",
    shortcut:
      "mt-[2px] h-[40px] min-w-[44px] shrink-0 items-center justify-center rounded-[var(--panel-radius-md)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted)] px-[8px]",
    shortcutLabel:
      "text-[22px] font-medium text-[color:var(--panel-muted-foreground)] tabular-nums",
  },
  variants: {
    multiple: {
      true: { indicator: "rounded-[var(--panel-radius-md)]" },
      false: { indicator: "rounded-full" },
    },
    selected: {
      true: {
        row: "border-[var(--panel-primary)] bg-[var(--panel-accent)]",
        shortcut:
          "border-[var(--panel-primary-opacity-40)] bg-[var(--panel-primary-opacity-10)]",
        shortcutLabel: "text-[color:var(--panel-primary)]",
      },
    },
    disabled: {
      true: { row: "opacity-50" },
    },
    invalid: {
      true: { row: "border-[var(--panel-destructive)]" },
    },
  },
  defaultVariants: {
    multiple: false,
  },
});
