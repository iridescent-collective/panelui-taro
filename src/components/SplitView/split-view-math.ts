import { sortCopy } from "../../lib/sort-copy";

export const DEFAULT_MIN_HEIGHT = 100;
export const DEFAULT_SNAP_POINTS = [0.2, 0.5, 0.8] as const;
const VELOCITY_REACH = 0.12;
const VELOCITY_CEILING = 0.4;
const closestIndex = (height: number, points: readonly number[]): number => {
  let best = 0;
  let bestDistance = Math.abs(points[0]! - height);
  for (let index = 1; index < points.length; index += 1) {
    const distance = Math.abs(points[index]! - height);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  }
  return best;
};
export const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), high);
export const resolveLength = (
  value: number | undefined,
  room: number,
  fallback: number
): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  if (value < 0) {
    return room + value;
  }
  return value <= 1 ? value * room : value;
};
export const resolveSnapPoints = (
  points: readonly number[] | undefined,
  room: number,
  minPx: number,
  maxPx: number
): number[] => {
  const source = points && points.length > 0 ? points : DEFAULT_SNAP_POINTS;
  const resolved: number[] = [];
  for (const raw of source) {
    if (!Number.isFinite(raw)) {
      continue;
    }
    const height = clamp(resolveLength(raw, room, minPx), minPx, maxPx);
    let seen = false;
    for (const other of resolved) {
      if (Math.abs(other - height) < 0.5) {
        seen = true;
      }
    }
    if (!seen) {
      resolved.push(height);
    }
  }
  if (resolved.length === 0) {
    resolved.push(clamp(minPx, minPx, maxPx));
  }
  return sortCopy(resolved, (a, b) => a - b);
};
export const nearestSnapIndex = (
  height: number,
  points: readonly number[],
  velocity: number,
  room: number
): number => {
  if (points.length === 0) {
    return 0;
  }
  const reach = clamp(
    velocity * VELOCITY_REACH,
    -room * VELOCITY_CEILING,
    room * VELOCITY_CEILING
  );
  const resting = closestIndex(height, points);
  const thrown = closestIndex(height + reach, points);
  return clamp(thrown, resting - 1, resting + 1);
};
export const normalizeSnapIndex = (
  index: number | undefined,
  length: number
): number => {
  if (length === 0) {
    return 0;
  }
  if (typeof index !== "number" || !Number.isFinite(index)) {
    return 0;
  }
  return clamp(Math.round(index), 0, length - 1);
};
