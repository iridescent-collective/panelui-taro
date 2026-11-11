import { timesOfDay, timeToMinutes } from "../../lib/time";
import type { TimeValue } from "../../lib/time";
import { FACE_CENTRE } from "./constants";

export const boundedTimes = (
  step: number,
  min?: TimeValue,
  max?: TimeValue
) => {
  const all = timesOfDay(step);
  if (!min && !max) {
    return all;
  }
  const low = min ? timeToMinutes(min) : Number.NEGATIVE_INFINITY;
  const high = max ? timeToMinutes(max) : Number.POSITIVE_INFINITY;
  const kept = all.filter(
    (time) => timeToMinutes(time) >= low && timeToMinutes(time) <= high
  );
  return kept.length ? kept : all;
};
export const nearestTimeIndex = (times: TimeValue[], value: TimeValue) => {
  let nearest = 0;
  let smallest = Number.POSITIVE_INFINITY;
  for (const [index, time] of times.entries()) {
    const away = Math.abs(timeToMinutes(time) - timeToMinutes(value));
    if (away < smallest) {
      smallest = away;
      nearest = index;
    }
  }
  return nearest;
};
export const handEnd = (turn: number, length: number) => {
  const angle = turn * 2 * Math.PI - Math.PI / 2;
  return {
    x1: FACE_CENTRE,
    x2: FACE_CENTRE + Math.cos(angle) * length,
    y1: FACE_CENTRE,
    y2: FACE_CENTRE + Math.sin(angle) * length,
  };
};
export const rowAppearance = (offset: number, index: number) => {
  const distance = Math.abs(offset / 44 - index);
  const opacity =
    distance <= 1
      ? 1 - distance * 0.25
      : Math.max(0.25, 0.75 - (distance - 1) * 0.5);
  return { opacity, transform: `scale(${1 - Math.min(distance, 1) * 0.06})` };
};
