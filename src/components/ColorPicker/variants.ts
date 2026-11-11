import { tv } from "../../lib/variants";

export const colorPickerVariants = tv({
  slots: {
    root: "w-full gap-[24px]",
    area: "overflow-hidden rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)]",
    wheel:
      "overflow-hidden rounded-full border-[2px] border-solid border-[var(--panel-border)]",
    thumb:
      "absolute start-0 top-[0px] rounded-full border-[4px] border-solid border-white shadow-md",
    thumbFill: "flex-1 rounded-full",
    track:
      "w-full overflow-hidden rounded-full border-[2px] border-solid border-[var(--panel-border)]",
    swatches: "flex flex-row flex-wrap items-center gap-[16px]",
    swatch: "items-center justify-center rounded-full",
    swatchRing:
      "absolute rounded-full border-[4px] border-solid border-[var(--panel-foreground)]",
    preview: "flex flex-row items-center gap-[24px]",
    previewSwatch:
      "overflow-hidden rounded-full border-[2px] border-solid border-[var(--panel-border)]",
    previewValue:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
    field:
      "flex w-full flex-row items-center gap-[24px] rounded-[var(--panel-radius-2xl)] bg-[var(--panel-surface)] px-[32px] py-[24px]",
    fieldLabel:
      "flex-1 text-[32px] leading-[1.5] font-medium text-[color:var(--panel-foreground)]",
    fieldValue:
      "text-[32px] leading-[1.5] font-normal text-[color:var(--panel-muted-foreground)]",
    fieldSwatch:
      "overflow-hidden rounded-full border-[2px] border-solid border-[var(--panel-border)]",
    channel: "flex w-full flex-row items-center justify-between gap-[24px]",
    channelValue:
      "text-[32px] leading-[1.5] font-normal text-[color:var(--panel-muted-foreground)]",
    channelLabel:
      "text-[32px] leading-[1.5] font-medium text-[color:var(--panel-foreground)]",
  },
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    disabled: {
      true: { root: "opacity-50" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
