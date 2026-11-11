import type { TouchPoint } from "../../primitives/touch-event";
import { normalizeDegrees, rotateAbout, zoomAbout } from "./math";
import type { CropState } from "./math";

const focal = (value: readonly TouchPoint[]) => ({
  x: value.reduce((sum, point) => sum + point.clientX, 0) / value.length,
  y: value.reduce((sum, point) => sum + point.clientY, 0) / value.length,
});
const distance = (value: readonly TouchPoint[]) =>
  Math.hypot(
    value[1].clientX - value[0].clientX,
    value[1].clientY - value[0].clientY
  );
const angle = (value: readonly TouchPoint[]) =>
  (Math.atan2(
    value[1].clientY - value[0].clientY,
    value[1].clientX - value[0].clientX
  ) *
    180) /
  Math.PI;
export const transformGesture = (
  state: CropState,
  previous: readonly TouchPoint[],
  current: readonly TouchPoint[],
  centre: { x: number; y: number },
  units: number
): CropState => {
  const before = previous.slice(0, 2);
  const after = before.map((point) =>
    current.find((next) => next.identifier === point.identifier)
  );
  if (!before.length || after.some((point) => !point)) {
    return state;
  }
  const points = after as TouchPoint[];
  const a = focal(before);
  const b = focal(points);
  let next = state;
  if (before.length === 2 && points.length === 2) {
    const original = distance(before);
    const ratio = original > 0 ? distance(points) / original : 1;
    const x = (a.x - centre.x) * units;
    const y = (a.y - centre.y) * units;
    next = rotateAbout(
      zoomAbout(next, ratio, x, y),
      normalizeDegrees(angle(points) - angle(before)),
      x,
      y
    );
  }
  return {
    ...next,
    x: next.x + (b.x - a.x) * units,
    y: next.y + (b.y - a.y) * units,
  };
};
