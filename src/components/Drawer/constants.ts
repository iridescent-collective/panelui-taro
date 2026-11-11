export const DRAWER_WIDTH = {
  full: { fraction: 0.94, max: Infinity },
  lg: { fraction: 0.88, max: 400 },
  md: { fraction: 0.78, max: 320 },
  sm: { fraction: 0.62, max: 280 },
} as const;
export const DRAWER_HEIGHT = {
  full: 0.94,
  lg: 0.62,
  md: 0.45,
  sm: 0.3,
} as const;
export const DRAWER_ENTER_SPRING = {
  damping: 24,
  mass: 0.7,
  stiffness: 260,
} as const;
export const DRAWER_RETURN_SPRING = {
  damping: 24,
  mass: 0.7,
  stiffness: 300,
} as const;
export const DRAWER_EXIT_DURATION = 200;
export const DRAWER_DISMISS_DISTANCE = 80;
export const DRAWER_DISMISS_VELOCITY = 650;
