import { tv } from "../../lib/variants";

export const timelineVariants = tv({
  slots: {
    root: "flex w-full flex-col",
    item: "flex w-full flex-row gap-[24px]",
    aside: "flex w-[160px] flex-col items-end gap-[4px] pt-[4px]",
    rail: "flex flex-col items-center",
    indicator: "flex flex-col items-center justify-center rounded-full",
    indicatorLabel: "text-[24px] leading-[1.333333] font-medium",
    separator: "w-[4px] flex-1 rounded-full",
    body: "flex flex-1 flex-col pb-[48px]",
    panel: "flex flex-col",
    header: "flex flex-row items-center gap-[16px]",
    heading: "flex flex-1 flex-col gap-[4px]",
    date: "text-[24px] leading-[1.333333] font-medium text-[color:var(--panel-muted-foreground)]",
    label: "text-[24px] leading-[1.333333] font-medium",
    meta: "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    title:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
    trailing:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    content:
      "pt-[8px] text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    stats:
      "mt-[16px] flex flex-row gap-[48px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] px-[28px] py-[20px]",
    statLabel:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    statValue:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
    masthead: "flex flex-col gap-[16px]",
    mastheadMedia: "flex flex-row items-center",
    mastheadLabel:
      "text-[36px] leading-tight font-medium text-[color:var(--panel-muted-foreground)]",
    mastheadTitle:
      "text-[48px] leading-tight font-semibold text-[color:var(--panel-foreground)]",
  },
  variants: {
    variant: {
      dot: { indicator: "h-[32px] w-[32px]" },
      icon: { indicator: "h-[64px] w-[64px]" },
      numbered: { indicator: "h-[56px] w-[56px]" },
      card: {
        indicator: "h-[32px] w-[32px]",
        panel:
          "rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[28px]",
      },
      compact: {
        indicator: "h-[48px] w-[48px]",
        body: "flex-1 pb-[24px]",
        title: "text-[32px] leading-[1.5]",
      },
    },
    tone: {
      default: {},
      info: { label: "text-[color:var(--panel-info-foreground)]" },
      success: { label: "text-[color:var(--panel-success-foreground)]" },
      warning: { label: "text-[color:var(--panel-warning-foreground)]" },
      danger: { label: "text-[color:var(--panel-destructive-foreground)]" },
    },
    completed: {
      true: { separator: "bg-[var(--panel-primary)]" },
      false: { separator: "bg-[var(--panel-muted)]" },
    },
    orientation: {
      vertical: {},
      horizontal: {
        item: "flex w-auto shrink-0 flex-col gap-[0px] pr-[48px]",
        aside: "w-auto items-start justify-end gap-[0px] pt-[0px] pb-[16px]",
        rail: "w-full items-start",
        body: "w-auto flex-none pt-[40px] pb-[0px]",
        title: "text-[28px] leading-[1.428571]",
        date: "text-[28px] leading-tight font-semibold",
        meta: "text-[22px] leading-tight font-medium",
      },
    },
  },
  defaultVariants: {
    variant: "dot",
    tone: "default",
    completed: false,
    orientation: "vertical",
  },
});
