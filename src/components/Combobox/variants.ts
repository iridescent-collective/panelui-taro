import { tv } from "../../lib/variants";

export const comboboxVariants = tv({
  slots: {
    root: "w-full",
    field:
      "flex w-full flex-row items-center gap-[16px] rounded-[var(--panel-radius-lg)] border-[2px] border-solid bg-[var(--panel-background)] px-[32px] py-[20px]",
    fieldContent:
      "flex flex-1 flex-row flex-wrap items-center gap-[12px] py-[8px]",
    input:
      "h-[56px] min-w-[192px] flex-1 py-[0px] text-[32px] font-normal text-[color:var(--panel-foreground)]",
    action: "h-[48px] w-[48px] items-center justify-center rounded-full",
    list: "overflow-hidden rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] p-[16px] shadow-sm",
    item: "flex flex-row items-center gap-[16px] rounded-[var(--panel-radius-lg)] px-[24px] py-[24px]",
    itemLabel:
      "flex-1 text-[32px] leading-[1.5] font-medium text-[color:var(--panel-foreground)]",
    itemIndicator: "h-[40px] w-[40px] items-center justify-center",
    group: "gap-[8px]",
    groupLabel: "px-[24px] pt-[16px] pb-[8px]",
    status:
      "flex flex-row items-center justify-center gap-[16px] px-[24px] py-[48px]",
  },
  variants: {
    selected: {
      true: { item: "bg-[var(--panel-accent)]" },
    },
    disabled: {
      true: { field: "opacity-[0.64]" },
    },
    itemDisabled: {
      true: { item: "opacity-[0.64]" },
    },
    presentation: {
      overlay: { list: "shadow-lg" },
      inline: { list: "mt-[16px]" },
    },
  },
  defaultVariants: {
    presentation: "overlay",
  },
});
