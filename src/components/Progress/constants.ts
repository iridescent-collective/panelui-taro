export const PROGRESS_COLOR = {
  destructive: "bg-[var(--panel-destructive)]",
  info: "bg-[var(--panel-info)]",
  primary: "bg-[var(--panel-primary)]",
  success: "bg-[var(--panel-success)]",
  warning: "bg-[var(--panel-warning)]",
} as const;

export const PROGRESS_TRACK = {
  destructive: "bg-[var(--panel-destructive-subtle)]",
  info: "bg-[var(--panel-info-subtle)]",
  primary: "bg-[var(--panel-primary-subtle)]",
  success: "bg-[var(--panel-success-subtle)]",
  warning: "bg-[var(--panel-warning-subtle)]",
} as const;

export const PROGRESS_SIZE = {
  lg: "h-[24px]",
  md: "h-[16px]",
  sm: "h-[12px]",
} as const;
