export const BUTTON_VARIANT = {
  destructive:
    "border-[var(--panel-destructive)] bg-[var(--panel-destructive)] text-[color:var(--panel-destructive-solid-foreground)] shadow-sm",
  ghost: "bg-transparent text-[color:var(--panel-foreground)]",
  outline:
    "border-[var(--panel-input)] bg-[var(--panel-popover)] text-[color:var(--panel-foreground)] shadow-sm",
  primary:
    "border-[var(--panel-primary)] bg-[var(--panel-primary)] text-[color:var(--panel-primary-foreground)] shadow-sm",
  secondary:
    "bg-[var(--panel-secondary)] text-[color:var(--panel-secondary-foreground)]",
  social:
    "border-[var(--panel-input)] bg-[var(--panel-card)] text-[color:var(--panel-foreground)] shadow-sm",
} as const;

export const BUTTON_SIZE = {
  icon: "h-[88px] w-[88px] px-0",
  lg: "min-h-[96px] min-w-[96px] px-[48px] py-[20px] text-[36px]",
  md: "min-h-[88px] min-w-[88px] px-[32px] py-[20px] text-[32px]",
  sm: "min-h-[72px] min-w-[72px] gap-[12px] px-[20px] py-[16px] text-[28px]",
  xl: "min-h-[112px] min-w-[112px] px-[64px] py-[24px] text-[36px]",
  xs: "min-h-[56px] min-w-[56px] gap-[8px] rounded-[var(--panel-radius-md)] px-[16px] py-[8px] text-[24px]",
} as const;

export const BUTTON_CONTENT_COLOR = {
  destructive: "var(--panel-destructive-solid-foreground)",
  ghost: "var(--panel-foreground)",
  outline: "var(--panel-foreground)",
  primary: "var(--panel-primary-foreground)",
  secondary: "var(--panel-secondary-foreground)",
  social: "var(--panel-foreground)",
} as const;

export const BUTTON_SPINNER_SIZE = {
  icon: "sm",
  lg: "md",
  md: "sm",
  sm: "sm",
  xl: "md",
  xs: "sm",
} as const;

export const BUTTON_HIT_SLOP = {
  icon: 2,
  lg: 0,
  md: 2,
  sm: 6,
  xl: 0,
  xs: 10,
} as const;

export const BUTTON_CONTENT_TOKEN = {
  destructive: "destructive-solid-foreground",
  ghost: "foreground",
  outline: "foreground",
  primary: "primary-foreground",
  secondary: "secondary-foreground",
  social: "foreground",
} as const;
