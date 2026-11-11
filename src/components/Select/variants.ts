import { tv } from "../../lib/variants";

export const selectVariants = tv({
  slots: {
    trigger:
      "flex w-full flex-row items-center justify-between gap-[24px] rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-input)] bg-[var(--panel-background)] px-[32px] py-[28px]",
    triggerLabel:
      "flex-1 text-[32px] leading-[1.5] font-medium text-[color:var(--panel-foreground)]",
    placeholder:
      "flex-1 text-[32px] leading-[1.5] text-[color:var(--panel-muted-foreground)]",
    list: "overflow-hidden rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] p-[16px] shadow-sm",
    options: "gap-[8px] pb-[16px]",
    search: "pb-[16px]",
    empty:
      "px-[24px] py-[48px] text-center text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    item: "flex flex-row items-center gap-[16px] rounded-[var(--panel-radius-lg)] px-[24px] py-[24px]",
    itemLabel:
      "flex-1 text-[32px] leading-[1.5] font-medium text-[color:var(--panel-foreground)]",
    itemIndicator: "h-[40px] w-[40px] items-center justify-center",
    group: "gap-[8px]",
    groupLabel: "px-[24px] pt-[16px] pb-[8px]",
  },
  variants: {
    size: {
      xs: {
        trigger: "gap-[16px] px-[20px] py-[12px]",
        triggerLabel: "text-[26px]",
        placeholder: "text-[26px]",
      },
      sm: {
        trigger: "gap-[16px] px-[24px] py-[20px]",
        triggerLabel: "text-[28px] leading-[1.428571]",
        placeholder: "text-[28px] leading-[1.428571]",
      },
      md: {},
      lg: {
        trigger: "py-[32px]",
        triggerLabel: "text-[36px] leading-[1.555556]",
        placeholder: "text-[36px] leading-[1.555556]",
      },
      xl: {
        trigger: "px-[40px] py-[40px]",
        triggerLabel: "text-[36px] leading-[1.555556]",
        placeholder: "text-[36px] leading-[1.555556]",
      },
    },
    selected: {
      true: { item: "bg-[var(--panel-accent)]" },
    },
    disabled: {
      true: { trigger: "opacity-[0.64]" },
    },
    itemDisabled: {
      true: { item: "opacity-[0.64]" },
    },
    presentation: {
      sheet: {},
      inline: { list: "mt-[16px]" },
      overlay: { list: "shadow-lg" },
    },
  },
  defaultVariants: {
    presentation: "sheet",
    size: "md",
  },
});
