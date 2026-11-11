import { tv } from "../../lib/variants";

export const tabsVariants = tv({
  slots: {
    list: "flex flex-row",
    indicator: "absolute left-[0px]",
    trigger: "items-center justify-center",
    label: "",
  },
  variants: {
    variant: {
      segmented: {
        list: "rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)] p-[8px]",
        indicator:
          "top-[8px] bottom-[8px] rounded-[var(--panel-radius-md)] bg-[var(--panel-popover)] shadow-sm",
        trigger: "rounded-[var(--panel-radius-md)] py-[12px]",
      },
      underline: {
        list: "gap-[8px] border-b-[2px] border-solid border-[var(--panel-border)]",
        indicator:
          "-bottom-px h-[4px] rounded-full bg-[var(--panel-foreground)]",
        trigger: "py-[20px]",
      },
      pill: {
        list: "gap-[8px]",
        indicator:
          "top-[0px] bottom-[0px] rounded-full bg-[var(--panel-primary)]",
        trigger: "rounded-full py-[16px]",
      },
      expanding: {
        list: "gap-[12px]",
        trigger: "rounded-full bg-[var(--panel-muted)] px-[28px] py-[20px]",
      },
    },
    size: {
      xs: { label: "text-[24px] leading-[1.333333]" },
      sm: { label: "text-[26px]" },
      md: {},
      lg: { label: "text-[32px] leading-[1.5]" },
      xl: { label: "text-[36px] leading-[1.555556]" },
    },
    active: {
      true: { label: "text-[color:var(--panel-foreground)]" },
      false: { label: "text-[color:var(--panel-muted-foreground)]" },
    },
    disabled: {
      true: { trigger: "opacity-[0.44]" },
    },
    scrollable: {
      true: { trigger: "px-[32px]" },
      false: { trigger: "flex-1" },
    },
  },
  compoundVariants: [
    {
      variant: "pill",
      active: true,
      class: { label: "text-[color:var(--panel-primary-foreground)]" },
    },
    { variant: "expanding", class: { trigger: "flex-none" } },
    {
      variant: "expanding",
      active: true,
      class: { trigger: "bg-[var(--panel-surface-tertiary)]" },
    },
    { variant: "segmented", size: "xs", class: { trigger: "py-[4px]" } },
    { variant: "segmented", size: "sm", class: { trigger: "py-[8px]" } },
    { variant: "segmented", size: "lg", class: { trigger: "py-[16px]" } },
    { variant: "segmented", size: "xl", class: { trigger: "py-[20px]" } },
    { variant: "underline", size: "xs", class: { trigger: "py-[12px]" } },
    { variant: "underline", size: "sm", class: { trigger: "py-[16px]" } },
    { variant: "underline", size: "lg", class: { trigger: "py-[24px]" } },
    { variant: "underline", size: "xl", class: { trigger: "py-[28px]" } },
    { variant: "pill", size: "xs", class: { trigger: "py-[8px]" } },
    { variant: "pill", size: "sm", class: { trigger: "py-[12px]" } },
    { variant: "pill", size: "lg", class: { trigger: "py-[20px]" } },
    { variant: "pill", size: "xl", class: { trigger: "py-[24px]" } },
    {
      variant: "expanding",
      size: "xs",
      class: { trigger: "px-[20px] py-[12px]" },
    },
    {
      variant: "expanding",
      size: "sm",
      class: { trigger: "px-[24px] py-[16px]" },
    },
    {
      variant: "expanding",
      size: "lg",
      class: { trigger: "px-[32px] py-[24px]" },
    },
    {
      variant: "expanding",
      size: "xl",
      class: { trigger: "px-[40px] py-[28px]" },
    },
  ],
  defaultVariants: {
    variant: "segmented",
    size: "md",
    scrollable: false,
  },
});
