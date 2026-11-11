import type { LoaderSize } from "./types";

export const GEOMETRY = {
  "bar-cascade": { bar: 5, count: 5, gap: 4, max: 26, min: 8 },
  "bounce-dots": { count: 3, dot: 10, gap: 6, travel: 8 },
  "bouncing-bars": { bar: 5, count: 3, gap: 6, height: 30 },
  "liquid-dots": { height: 32, radius: 11, travel: 15, width: 72 },
  "morph-ring": { border: 3, box: 34 },
  "pulsating-dots": { count: 3, dot: 11, gap: 8 },
  "pulse-dots": { count: 3, dot: 10, gap: 6 },
  "symmetric-wave": { bar: 5, count: 9, gap: 5, max: 26, min: 7 },
  "wave-physics": { bar: 5, base: 7, count: 15, gap: 3, peak: 26 },
} as const;
export const SIZE_SCALE: Record<LoaderSize, number> = {
  lg: 1.35,
  md: 1,
  sm: 0.75,
};
export const WAVE_OFFSETS = [0, 1, 2, 3, 4, 3, 2, 1, 0] as const;
