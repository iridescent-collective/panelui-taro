import { tv } from "../../lib/variants";

export const feedbackVariants = tv({
  slots: {
    shell:
      "flex w-full max-w-[768px] flex-col overflow-hidden bg-[var(--panel-popover)] shadow-xl",
    recess: "absolute inset-[0px] bg-[var(--panel-inset)]",
    panel: "overflow-hidden bg-[var(--panel-popover)]",
    title:
      "pe-[72px] text-[44px] leading-[56px] font-semibold text-[color:var(--panel-popover-foreground)]",
    close:
      "absolute flex items-center justify-center rounded-full bg-[var(--panel-foreground-opacity-10)]",
    field:
      "p-[0px] text-[34px] leading-[48px] text-[color:var(--panel-muted-foreground)]",
    footer: "flex flex-row items-center gap-[28px]",
    action: "flex h-[88px] flex-1 items-center justify-center rounded-full",
    actionLabel: "text-[32px]",
  },
  variants: {
    tone: {
      cancel: {
        action: "flex bg-[var(--panel-foreground-opacity-10)]",
        actionLabel: "font-medium text-[color:var(--panel-muted-foreground)]",
      },
      submit: {
        action: "flex bg-[var(--panel-primary)]",
        actionLabel:
          "font-semibold text-[color:var(--panel-primary-foreground)]",
      },
    },
    disabled: {
      true: {},
    },
  },
  compoundVariants: [
    {
      tone: "submit",
      disabled: true,
      class: {
        action: "flex bg-[var(--panel-foreground-opacity-4)]",
        actionLabel:
          "font-medium text-[color:var(--panel-muted-foreground-opacity-50)]",
      },
    },
    {
      tone: "cancel",
      disabled: true,
      class: { action: "flex opacity-[0.45]" },
    },
  ],
});
