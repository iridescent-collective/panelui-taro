import { sortCopy } from "../../lib/sort-copy";

type AppStateStatus = "active" | "background" | "inactive";
export interface LiveLineReading {
  time: number;
  value: number;
}
export const DEFAULT_LIVE_LINE_WINDOW = 30;
export const DEFAULT_LIVE_LINE_MAX_POINTS = 500;
export const normalizeLiveLineWindow = (seconds: number): number =>
  Number.isFinite(seconds) && seconds > 0
    ? Math.max(seconds, 1)
    : DEFAULT_LIVE_LINE_WINDOW;
export const normalizeLiveLineMaxPoints = (maxPoints: number): number =>
  Number.isFinite(maxPoints) && maxPoints > 0
    ? Math.max(1, Math.floor(maxPoints))
    : DEFAULT_LIVE_LINE_MAX_POINTS;
export const normalizeLiveLinePoints = <T extends LiveLineReading>(
  data: readonly T[],
  maxPoints: number
): T[] => {
  const byTime = new Map<number, T>();
  for (const point of data) {
    if (Number.isFinite(point.time) && Number.isFinite(point.value)) {
      byTime.set(point.time, point);
    }
  }
  return sortCopy(
    [...byTime.values()],
    (left, right) => left.time - right.time
  ).slice(-normalizeLiveLineMaxPoints(maxPoints));
};
export const liveLineClockRuns = (options: {
  paused: boolean;
  loading: boolean;
  reducedMotion: boolean;
  appState: AppStateStatus;
}): boolean =>
  !options.paused &&
  !options.loading &&
  !options.reducedMotion &&
  options.appState === "active";
export const reconcileLiveLineActivePoint = <T extends LiveLineReading>(
  active: T | null,
  points: readonly T[]
): T | null => {
  if (!active) {
    return null;
  }
  return points.find((point) => point.time === active.time) ?? null;
};
