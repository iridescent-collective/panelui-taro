import { tv } from "../../lib/variants";

export const searchBarVariants = tv({
  slots: {
    row: "flex w-full flex-row items-center",
    anchor: "relative",
    field: "",
    panel:
      "overflow-hidden rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] shadow-lg",
    panelList: "p-[12px]",
    panelDivider: "w-full bg-[var(--panel-border)]",
    section: "gap-[4px]",
    sectionLabel:
      "px-[24px] pt-[16px] pb-[8px] text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    item: "flex flex-row items-center gap-[24px] rounded-[var(--panel-radius-lg)] px-[24px] py-[20px]",
    itemLabel:
      "flex-1 text-[32px] leading-[1.5] text-[color:var(--panel-foreground)]",
    status:
      "flex flex-row items-center justify-center gap-[16px] px-[24px] py-[64px]",
    cancelClip: "self-stretch overflow-hidden",
    cancelButton:
      "absolute end-0 top-[0px] bottom-[0px] items-center justify-center ps-[16px]",
    cancelLabel: "font-medium text-[color:var(--panel-primary)]",
    clear: "items-center justify-center rounded-full",
    tokenRow: "flex flex-row items-center gap-[12px]",
    token:
      "flex flex-row items-center gap-[8px] rounded-full bg-[var(--panel-accent)] ps-[16px] pe-[8px]",
    tokenLabel: "text-[color:var(--panel-accent-foreground)]",
    tokenRemove: "items-center justify-center rounded-full",
  },
  variants: {
    size: {
      sm: {
        cancelLabel: "text-[28px]",
        clear: "h-[48px] w-[48px]",
        token: "h-[48px]",
        tokenLabel: "text-[26px]",
        tokenRemove: "h-[32px] w-[32px]",
      },
      md: {
        cancelLabel: "text-[32px]",
        clear: "h-[48px] w-[48px]",
        token: "h-[56px]",
        tokenLabel: "text-[28px]",
        tokenRemove: "h-[40px] w-[40px]",
      },
      lg: {
        cancelLabel: "text-[32px]",
        clear: "h-[56px] w-[56px]",
        token: "h-[64px]",
        tokenLabel: "text-[30px]",
        tokenRemove: "h-[40px] w-[40px]",
      },
    },
    shape: {
      rounded: { field: "" },
      pill: { field: "rounded-full" },
    },
    attached: {
      none: {},
      top: {
        field:
          "rounded-t-none rounded-b-[var(--panel-radius-2xl)] border-[0px] border-solid",
      },
      bottom: {
        field:
          "rounded-t-[var(--panel-radius-2xl)] rounded-b-none border-[0px] border-solid",
      },
    },
    selected: {
      true: { item: "bg-[var(--panel-accent)]" },
    },
  },
  defaultVariants: {
    size: "md",
    shape: "rounded",
    attached: "none",
  },
});
