export const OPEN_SPRING = { damping: 30, mass: 1, stiffness: 260 } as const;
export const CLOSE_SPRING = {
  damping: 32,
  mass: 1,
  overshootClamping: true,
  stiffness: 300,
} as const;
export const SETTLE_SPRING = { damping: 34, mass: 1, stiffness: 320 } as const;
