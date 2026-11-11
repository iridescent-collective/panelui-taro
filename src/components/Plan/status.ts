import type { PlanStepStatus } from "./types";

export const STEP_STATUS: Record<
  PlanStepStatus,
  { marker: string; title: string; connector: string }
> = {
  active: {
    connector: "bg-[var(--panel-border)]",
    marker: "border-[4px] border-solid border-[var(--panel-primary)]",
    title: "font-medium text-[color:var(--panel-foreground)]",
  },
  done: {
    connector: "bg-[var(--panel-primary)]",
    marker: "bg-[var(--panel-primary)]",
    title: "text-[color:var(--panel-foreground)]",
  },
  pending: {
    connector: "bg-[var(--panel-border)]",
    marker: "border-[2px] border-solid border-[var(--panel-border)]",
    title: "text-[color:var(--panel-muted-foreground)]",
  },
  skipped: {
    connector: "bg-[var(--panel-border)]",
    marker: "border-[2px] border-dashed border-[var(--panel-border)]",
    title: "text-[color:var(--panel-muted-foreground)] line-through",
  },
};
