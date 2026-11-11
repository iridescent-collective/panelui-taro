import { tv } from "../../lib/variants";

export const supportVariants = tv({
  slots: {
    root: "flex w-full flex-col gap-[40px]",
    header: "flex w-full flex-row items-center justify-between gap-[24px]",
    headerText: "flex shrink flex-col gap-[4px]",
    status:
      "flex w-full flex-row items-center gap-[16px] rounded-[var(--panel-radius-xl)] bg-[var(--panel-muted)] px-[24px] py-[20px]",
    statusDot: "size-[16px] rounded-full",
    group: "flex w-full flex-col gap-[16px]",
    groupTitle:
      "text-[24px] leading-[1.333333] font-medium text-[color:var(--panel-muted-foreground)]",
    channel:
      "flex w-full flex-row items-center gap-[24px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] px-[28px] py-[24px]",
    channelIcon:
      "flex size-[72px] items-center justify-center rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)]",
    channelText: "flex shrink grow flex-col gap-[4px]",
    topic:
      "flex w-full flex-row items-center gap-[24px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid px-[28px] py-[24px]",
    topicText: "flex shrink grow flex-col gap-[4px]",
    conversation:
      "flex w-full flex-row items-start gap-[24px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] px-[28px] py-[24px]",
    article:
      "flex w-full flex-row items-center gap-[24px] rounded-[var(--panel-radius-xl)] bg-[var(--panel-muted)] px-[28px] py-[24px]",
    badge: "rounded-full px-[16px] py-[4px]",
    agent: "flex w-full flex-row items-center gap-[24px]",
    ticket:
      "flex w-full flex-row items-center justify-between gap-[16px] rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)] px-[24px] py-[16px]",
    note: "w-full text-center",
    handoff:
      "flex w-full flex-row items-center gap-[16px] rounded-[var(--panel-radius-xl)] bg-[var(--panel-muted)] px-[24px] py-[20px]",
    replies: "flex w-full flex-row flex-wrap items-center gap-[16px]",
    reply:
      "rounded-full border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] px-[24px] py-[12px]",
    resolution:
      "flex w-full flex-col items-center gap-[16px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] px-[28px] py-[28px]",
  },
  variants: {
    availability: {
      online: { statusDot: "bg-[var(--panel-success)]" },
      away: { statusDot: "bg-[var(--panel-warning)]" },
      offline: { statusDot: "bg-[var(--panel-muted-foreground)]" },
    },
    selected: {
      true: {
        topic:
          "border-[var(--panel-primary)] bg-[var(--panel-primary-opacity-10)]",
      },
      false: { topic: "border-[var(--panel-border)] bg-[var(--panel-card)]" },
    },
    disabled: {
      true: { channel: "opacity-50", topic: "opacity-50" },
    },
  },
  defaultVariants: {
    availability: "online",
    selected: false,
  },
});
