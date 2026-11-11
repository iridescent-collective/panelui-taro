export const DEFAULT_THRESHOLD = 0.9;
export const DEFAULT_AUTO_RESET_DELAY = 1000;
export const VELOCITY_LOOKAHEAD = 0.12;
export const OVERSHOOT_FRICTION = 8;
export const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));
export const resolveThreshold = (threshold: number | undefined): number =>
  threshold === undefined || !Number.isFinite(threshold)
    ? DEFAULT_THRESHOLD
    : Math.min(1, Math.max(0.1, threshold));
export const progressFor = (translation: number, travel: number): number =>
  travel <= 0 ? 0 : clamp(translation / travel, 0, 1);
export const offsetFor = (translation: number, travel: number): number => {
  if (travel <= 0) {
    return 0;
  }
  if (translation < 0) {
    return translation / OVERSHOOT_FRICTION;
  }
  if (translation <= travel) {
    return translation;
  }
  return travel + (translation - travel) / OVERSHOOT_FRICTION;
};
export const isCommitted = (
  progress: number,
  velocity: number,
  travel: number,
  threshold: number
): boolean =>
  travel > 0 &&
  progress + (velocity * VELOCITY_LOOKAHEAD) / travel >= threshold;
