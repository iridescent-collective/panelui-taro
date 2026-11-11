import { tv } from "../../lib/variants";

export const leaderboardVariants = tv({
  slots: {
    root: "w-full gap-[32px]",
    podium: "flex flex-row items-end gap-[16px] px-[8px]",
    column: "flex-1 items-center",
    person: "items-center gap-[8px] pb-[16px]",
    rankBadge:
      "absolute -bottom-[12px] h-[40px] min-w-[40px] items-center justify-center self-center rounded-full border-[4px] border-solid border-[var(--panel-background)] px-[8px]",
    bar: "w-full items-center overflow-hidden rounded-t-[var(--panel-radius-2xl)] pt-[20px]",
    card: "flex-1 items-center gap-[12px] rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] px-[16px] pt-[32px] pb-[24px]",
    list: "overflow-hidden rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
    row: "flex min-h-[112px] flex-row items-center gap-[24px] px-[24px] py-[20px]",
    rowDivider: "ml-[112px] h-[2px] bg-[var(--panel-border)]",
    rank: "w-[56px] text-center text-[28px] leading-[1.428571] font-semibold text-[color:var(--panel-muted-foreground)] tabular-nums",
    rowText: "flex-1 gap-[4px]",
    value:
      "text-[28px] leading-[1.428571] font-semibold text-[color:var(--panel-foreground)] tabular-nums",
    change: "flex min-w-[80px] flex-row items-center justify-end gap-[4px]",
    gap: "flex flex-row items-center justify-center gap-[8px] py-[12px]",
    gapDot:
      "h-[8px] w-[8px] rounded-full bg-[var(--panel-muted-foreground-opacity-40)]",
    empty:
      "items-center rounded-[var(--panel-radius-2xl)] border-[2px] border-dashed border-[var(--panel-border)] px-[32px] py-[64px]",
  },
});
