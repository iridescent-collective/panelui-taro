export const RETURN_SPRING = {
  damping: 20,
  mass: 0.7,
  stiffness: 220,
} as const;
export const ARRIVE_SPRING = {
  damping: 22,
  mass: 0.9,
  stiffness: 160,
} as const;
export const STACK_DIRECTIONS = ["left", "right"] as const;
export const DIRECTION_LABELS = {
  down: "Swipe down",
  left: "Swipe left",
  right: "Swipe right",
  up: "Swipe up",
} as const;
export const ACTION_ICON_SIZE = { lg: 28, md: 24, sm: 18 } as const;
