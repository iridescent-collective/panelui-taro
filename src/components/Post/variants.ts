import { tv } from "../../lib/variants";

export const postVariants = tv({
  slots: {
    root: "relative flex w-full flex-col overflow-hidden rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
    header: "flex flex-row items-start gap-[24px]",
    author: "flex min-w-[0px] flex-1 flex-col gap-[4px]",
    authorLine: "flex flex-row items-center gap-[12px]",
    name: "font-semibold text-[color:var(--panel-card-foreground)]",
    handle: "text-[color:var(--panel-muted-foreground)]",
    meta: "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    action: "flex h-[48px] shrink-0 flex-col items-center justify-center",
    community:
      "flex h-[48px] min-w-[0px] flex-1 flex-row items-center gap-[16px]",
    communityName:
      "text-[24px] leading-[1.333333] font-semibold text-[color:var(--panel-card-foreground)]",
    communityMeta:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    title:
      "text-[32px] leading-snug font-semibold text-[color:var(--panel-card-foreground)]",
    body: "text-[color:var(--panel-card-foreground)]",
    media: "flex flex-col overflow-hidden bg-[var(--panel-muted)]",
    footer: "flex flex-row items-center",
    stat: "flex flex-row items-center gap-[12px] rounded-full",
    statLabel:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    votes:
      "flex flex-row items-center gap-[4px] rounded-full bg-[var(--panel-muted)]",
    voteButton:
      "flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full",
    voteScore: "text-[28px] leading-[1.428571] font-semibold tabular-nums",
  },
  variants: {
    variant: {
      feed: {
        header: "p-[32px] pb-[24px]",
        body: "px-[32px] pb-[24px] text-[32px] leading-relaxed",
        media: "mx-[32px] rounded-[var(--panel-radius-xl)]",
        footer: "gap-[40px] p-[32px]",
      },
      vote: {
        header: "px-[32px] pt-[28px] pb-[16px]",
        body: "px-[32px] pb-[24px] text-[28px] leading-relaxed",
        media: "mx-[32px] rounded-[var(--panel-radius-xl)]",
        footer: "gap-[16px] px-[32px] pb-[28px]",
      },
      compact: {
        root: "rounded-[var(--panel-radius-xl)]",
        header: "p-[28px] pb-[16px]",
        body: "px-[28px] pb-[20px] text-[28px] leading-relaxed",
        media: "mx-[28px] rounded-[var(--panel-radius-lg)]",
        footer: "gap-[48px] px-[28px] pb-[24px]",
      },
      media: {
        header: "absolute inset-x-[0px] top-[0px] z-10 p-[24px]",
        body: "px-[32px] pt-[24px] pb-[24px] text-[28px] leading-relaxed",
        media: "rounded-none",
        footer: "gap-[40px] px-[32px] pb-[32px]",
      },
    },
    size: {
      default: {},
      sm: {
        name: "text-[28px] leading-[1.428571]",
        meta: "text-[24px] leading-[1.333333]",
        statLabel: "text-[24px] leading-[1.333333]",
      },
    },
  },
  defaultVariants: {
    variant: "feed",
    size: "default",
  },
});
