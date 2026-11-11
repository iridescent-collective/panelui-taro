export const DEFAULT_HOLD_DURATION = 2000;

export const DEFAULT_RELEASE_DURATION = DEFAULT_HOLD_DURATION;

export const DEFAULT_AUTO_RESET_DELAY = 1000;

export const resolveHoldDuration = (duration: number | undefined): number => {
  if (duration === undefined) {
    return DEFAULT_HOLD_DURATION;
  }
  if (!Number.isFinite(duration)) {
    return DEFAULT_HOLD_DURATION;
  }
  return Math.max(200, duration);
};

export const releaseDuration = (
  progress: number,
  full: number = DEFAULT_RELEASE_DURATION
): number => {
  const travelled = Math.min(1, Math.max(0, progress));
  return Math.max(80, full * travelled);
};

export const isComplete = (progress: number): boolean => progress >= 1;

export const fillDuration = (from: number, full: number): number => {
  const remaining = Math.min(1, Math.max(0, 1 - from));
  return Math.max(80, full * remaining);
};
