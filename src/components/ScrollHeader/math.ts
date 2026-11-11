export const SNAP_EPSILON = 1;
export const RESTING_VELOCITY = 0.05;
export const MINIMUM_SPAN = 1;
export const HANDOVER_DURATION = 200;
export const LARGE_EXIT = [0, 0.45] as const;
export const SURFACE_ARRIVE = [0.35, 0.75] as const;
export const BAR_TITLE_ARRIVE = [0.6, 1] as const;
export const hasSpan = (height: number) => height >= MINIMUM_SPAN;
export const collapseProgress = (
  offset: number,
  height: number,
  threshold: number
) => {
  const span = height * Math.min(Math.max(threshold, 0.05), 1);
  return span < MINIMUM_SPAN
    ? Number(offset > 0)
    : Math.min(Math.max(offset / span, 0), 1);
};
export const bandHeight = (
  bar: number,
  height: number,
  offset: number,
  stretch: boolean
) =>
  bar +
  Math.max(stretch ? height - offset : Math.min(height - offset, height), 0);
export const snapTarget = (
  offset: number,
  height: number,
  velocity: number
): number | null => {
  if (
    Math.abs(velocity) > RESTING_VELOCITY ||
    height < MINIMUM_SPAN ||
    offset <= SNAP_EPSILON ||
    offset >= height - SNAP_EPSILON
  ) {
    return null;
  }
  return offset >= height / 2 ? height : 0;
};
export const isCrossing = (next: boolean, previous: boolean | null) =>
  previous !== null && next !== previous;
export const contentInset = (band: number, padding: unknown) =>
  band +
  (typeof padding === "number" && Number.isFinite(padding) && padding > 0
    ? padding
    : 0);
export const rampOpacity = (
  progress: number,
  ramp: readonly [number, number]
) => Math.min(1, Math.max(0, (progress - ramp[0]) / (ramp[1] - ramp[0])));
