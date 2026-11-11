export const SWIPE_SPRING = { damping: 22, mass: 0.7, stiffness: 220 } as const;
export const OVERSHOOT_FRICTION = 8;
export const FULL_SWIPE_RATIO = 1.6;
export const OPEN_RATIO = 0.5;
export const VELOCITY_LOOKAHEAD = 0.12;
export const PANEL_FILL = {
  default: "bg-[var(--panel-muted-foreground)]",
  destructive: "bg-[var(--panel-destructive)]",
  info: "bg-[var(--panel-info)]",
  primary: "bg-[var(--panel-primary)]",
  success: "bg-[var(--panel-success)]",
  warning: "bg-[var(--panel-warning)]",
} as const;
