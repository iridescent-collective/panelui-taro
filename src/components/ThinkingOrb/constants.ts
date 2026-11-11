import type { ThinkingOrbState, Profile } from "./types";

export const BUCKETS = 8;
export const MIN_INK = 0.03;
export const MIN_RADIUS = 0.3;
export const STILL_FRAME = 2.4;
export const STATE_LABEL: Record<ThinkingOrbState, string> = {
  composing: "Composing",
  listening: "Listening",
  searching: "Searching",
  shaping: "Shaping",
  solving: "Solving",
  working: "Working",
};
export const PROFILES: Record<
  ThinkingOrbState,
  {
    md: Profile;
    sm: Profile;
  }
> = {
  composing: {
    md: { density: 44, radius: 0.85, rows: 5, speed: 2.3 },
    sm: { density: 20, radius: 1.1, rows: 3, speed: 3.1 },
  },
  listening: {
    md: { density: 24, radius: 1, rows: 10, speed: 4.4 },
    sm: { density: 11, radius: 1.6, rows: 5, speed: 4 },
  },
  searching: {
    md: { density: 28, radius: 1.15, rows: 11, speed: 2 },
    sm: { density: 12, radius: 1.75, rows: 5, speed: 2.7 },
  },
  shaping: {
    md: { density: 26, radius: 1, rows: 1, speed: 2.4 },
    sm: { density: 14, radius: 2.2, rows: 1, speed: 2.1 },
  },
  solving: {
    md: { density: 24, radius: 1.05, rows: 10, speed: 1.8 },
    sm: { density: 11, radius: 1.9, rows: 5, speed: 2 },
  },
  working: {
    md: { density: 26, radius: 1, rows: 9, speed: 1.9 },
    sm: { density: 12, radius: 2.4, rows: 4, speed: 3.9 },
  },
};
export const SHAPES: number[][] = [
  [],
  [0, -0.26, 0.24, 0.16, -0.24, 0.16],
  [0, -0.2, 0.2, -0.2, 0.2, 0.2, -0.2, 0.2, -0.2, -0.2],
];
