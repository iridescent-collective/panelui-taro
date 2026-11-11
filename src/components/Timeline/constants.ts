import type { TimelineVariant, TimelineTone } from "./types";

export const HORIZONTAL_RAIL_TOP = 64;
export const HORIZONTAL_TICK_HEIGHT = 10;
export const SOLID_VARIANTS: TimelineVariant[] = ["dot", "card"];
export const TONE_NODE: Record<
  TimelineTone,
  { solid: string; tinted: string }
> = {
  danger: {
    solid: "bg-[var(--panel-destructive)]",
    tinted:
      "border-[2px] border-solid border-[var(--panel-destructive-opacity-32)] bg-[var(--panel-destructive-soft)]",
  },
  default: {
    solid: "bg-[var(--panel-primary)]",
    tinted:
      "border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted)]",
  },
  info: {
    solid: "bg-[var(--panel-info)]",
    tinted:
      "border-[2px] border-solid border-[var(--panel-info-opacity-32)] bg-[var(--panel-info-soft)]",
  },
  success: {
    solid: "bg-[var(--panel-success)]",
    tinted:
      "border-[2px] border-solid border-[var(--panel-success-opacity-32)] bg-[var(--panel-success-soft)]",
  },
  warning: {
    solid: "bg-[var(--panel-warning)]",
    tinted:
      "border-[2px] border-solid border-[var(--panel-warning-opacity-32)] bg-[var(--panel-warning-soft)]",
  },
};
export const PENDING_NODE = {
  solid: "bg-[var(--panel-muted)]",
  tinted:
    "border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted)]",
};
export const TONE_ICON_VAR: Record<TimelineTone, string> = {
  danger: "--color-destructive-foreground",
  default: "--color-primary",
  info: "--color-info-foreground",
  success: "--color-success-foreground",
  warning: "--color-warning-foreground",
};
