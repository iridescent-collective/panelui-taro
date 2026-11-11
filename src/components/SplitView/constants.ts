export const SPLIT_SPRING = {
  damping: 25,
  mass: 0.8,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
  stiffness: 300,
} as const;
export const GRIP_SPRING = { damping: 18, mass: 0.8, stiffness: 300 } as const;
