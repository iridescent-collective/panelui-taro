import {
  FULL_SWIPE_RATIO,
  OPEN_RATIO,
  OVERSHOOT_FRICTION,
  VELOCITY_LOOKAHEAD,
} from "./constants";

export const swipeOffset = (next: number, start: number, end: number) => {
  const limit = next > 0 ? start : end;
  if (limit === 0) {
    return 0;
  }
  const beyond = Math.abs(next) - limit;
  return beyond > 0
    ? Math.sign(next) * (limit + beyond / OVERSHOOT_FRICTION)
    : next;
};
export const swipeRelease = (
  offset: number,
  velocity: number,
  start: number,
  end: number,
  full: boolean
) => {
  const side = offset > 0 ? "start" : "end";
  const limit = offset > 0 ? start : end;
  if (limit === 0) {
    return { fire: false, side: null, target: 0 } as const;
  }
  if (full && Math.abs(offset) > limit * FULL_SWIPE_RATIO) {
    return { fire: true, side: null, target: 0 } as const;
  }
  const opened =
    Math.abs(offset + velocity * VELOCITY_LOOKAHEAD) > limit * OPEN_RATIO;
  const target = offset > 0 ? limit : -limit;
  return {
    fire: false,
    side: opened ? side : null,
    target: opened ? target : 0,
  } as const;
};
