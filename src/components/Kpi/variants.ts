import { tv } from "../../lib/variants";

export const kpiVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-[16px]",
    header: "flex flex-row items-center gap-[16px]",
    icon: "flex h-[64px] w-[64px] items-center justify-center rounded-[var(--panel-radius-xl)]",
    title:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-muted-foreground)]",
    content: "flex flex-row items-end justify-between gap-[24px]",
    value:
      "text-[48px] leading-[1.333333] font-bold text-[color:var(--panel-foreground)]",
    stat: "flex flex-1 flex-col gap-[8px]",
    trend: "flex flex-row items-center gap-[8px]",
    trendLabel: "font-medium",
    footer: "flex flex-row items-center gap-[16px]",
    separator: "h-[2px] w-full bg-[var(--panel-border)]",
    group: "w-full",
    groupSeparator: "bg-[var(--panel-border)]",
  },
  variants: {
    tone: {
      good: {
        trendLabel: "text-[color:var(--panel-success)]",
        icon: "bg-[var(--panel-success-subtle)]",
      },
      bad: {
        trendLabel: "text-[color:var(--panel-destructive)]",
        icon: "bg-[var(--panel-destructive-subtle)]",
      },
      flat: {
        trendLabel: "text-[color:var(--panel-muted-foreground)]",
        icon: "bg-[var(--panel-muted)]",
      },
      neutral: {
        trendLabel: "text-[color:var(--panel-muted-foreground)]",
        icon: "bg-[var(--panel-secondary)]",
      },
    },
    trendVariant: {
      text: {
        trend: "gap-[4px]",
        trendLabel: "text-[28px] leading-[1.428571]",
      },
      badge: {
        trend: "rounded-full px-[16px] py-[4px]",
        trendLabel: "text-[24px] leading-[1.333333]",
      },
    },
    layout: {
      below: {},
      inline: { content: "items-center gap-[32px]" },
    },
  },
  compoundVariants: [
    {
      trendVariant: "badge",
      tone: "good",
      class: { trend: "bg-[var(--panel-success-subtle)]" },
    },
    {
      trendVariant: "badge",
      tone: "bad",
      class: { trend: "bg-[var(--panel-destructive-subtle)]" },
    },
    {
      trendVariant: "badge",
      tone: "flat",
      class: { trend: "bg-[var(--panel-muted)]" },
    },
    {
      trendVariant: "badge",
      tone: "neutral",
      class: { trend: "bg-[var(--panel-muted)]" },
    },
  ],
  defaultVariants: {
    tone: "neutral",
    trendVariant: "text",
    layout: "below",
  },
});
