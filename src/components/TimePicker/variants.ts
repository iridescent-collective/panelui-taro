import { tv } from "../../lib/variants";

export const timePickerVariants = tv({
  slots: {
    panel: "gap-[24px]",
    wheel: "relative flex flex-row items-stretch justify-center",
    highlight:
      "absolute inset-x-[0px] rounded-[var(--panel-radius-xl)] bg-[var(--panel-muted)]",
    column: "flex-1",
    row: "items-center justify-center",
    rowLabel:
      "text-[36px] leading-[1.555556] text-[color:var(--panel-foreground)] tabular-nums",
    rowLabelSelected: "font-semibold text-[color:var(--panel-primary)]",
    readout:
      "text-center font-semibold text-[color:var(--panel-foreground)] tabular-nums",
    clock: "flex flex-row items-center gap-[32px]",
    footer: "flex flex-row justify-end gap-[16px]",
  },
  variants: {
    readout: {
      default: { readout: "text-[72px] leading-[1.111111]" },
      compact: { readout: "text-[40px] leading-[1.4]" },
      none: {},
    },
  },
  defaultVariants: {
    readout: "default",
  },
});
