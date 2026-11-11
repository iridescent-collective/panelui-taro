import type { SupportAvailability, SupportConversationStatus } from "./types";

export const STATUS_STYLE: Record<
  SupportConversationStatus,
  {
    label: string;
    className: string;
    textClassName: string;
  }
> = {
  closed: {
    className: "bg-[var(--panel-muted)]",
    label: "Closed",
    textClassName: "text-[color:var(--panel-muted-foreground)]",
  },
  open: {
    className: "bg-[var(--panel-info-opacity-15)]",
    label: "Open",
    textClassName: "text-[color:var(--panel-info)]",
  },
  pending: {
    className: "bg-[var(--panel-warning-opacity-15)]",
    label: "Waiting on you",
    textClassName: "text-[color:var(--panel-warning)]",
  },
  solved: {
    className: "bg-[var(--panel-success-opacity-15)]",
    label: "Solved",
    textClassName: "text-[color:var(--panel-success)]",
  },
};

export const AVAILABILITY_LABEL: Record<SupportAvailability, string> = {
  away: "Away",
  offline: "Offline",
  online: "Online",
};
export const AVAILABILITY_STATUS: Record<SupportAvailability, string> = {
  away: "Away at the moment",
  offline: "Nobody is here right now",
  online: "Someone is here now",
};
