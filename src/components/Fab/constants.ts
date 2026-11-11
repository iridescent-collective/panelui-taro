export const FAB_SIZE = { lg: 64, md: 56, sm: 44 } as const;
export const FAB_SPRING = { damping: 15, mass: 0.9, stiffness: 170 } as const;
export const FAB_MENU = {
  platform: {
    hairline: 1,
    icon: "trailing",
    padding: 6,
    radius: 26,
    row: 44,
    width: 250,
  },
  wells: {
    hairline: 0,
    icon: "leading",
    padding: 6,
    radius: 22,
    row: 48,
    width: 224,
  },
} as const;
export const FAB_COLOR = {
  destructive: "destructive-solid-foreground",
  primary: "primary-foreground",
  secondary: "secondary-foreground",
  surface: "foreground",
} as const;
