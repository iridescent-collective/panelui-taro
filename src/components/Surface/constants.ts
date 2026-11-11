export const SURFACE_VARIANT = {
  default: "bg-[var(--panel-surface)]",
  secondary: "bg-[var(--panel-surface-secondary)]",
  tertiary: "bg-[var(--panel-surface-tertiary)]",
  transparent: "bg-transparent",
} as const;

export const SURFACE_PADDING = {
  default: "p-[32px]",
  lg: "p-[48px]",
  none: "",
  sm: "p-[20px]",
} as const;
