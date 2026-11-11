import type { RingDatum } from "./types";

export const ringRadius = (
  size: number,
  strokeWidth: number,
  ringGap: number,
  index: number
) =>
  Math.max(
    size / 2 - strokeWidth / 2 - index * (strokeWidth + ringGap),
    strokeWidth / 2
  );
export interface RingGeometryOptions {
  datum: RingDatum | undefined;
  index: number;
  count: number;
  size: number;
  strokeWidth: number;
  ringGap: number;
  arc: number;
  reveal: number;
  segments?: number;
  segmentGap: number;
  lineCap?: "round" | "butt";
}
export const ringGeometry = ({
  datum,
  index,
  count,
  size,
  strokeWidth,
  ringGap,
  arc,
  reveal,
  segments,
  segmentGap,
  lineCap,
}: RingGeometryOptions) => {
  const radius = ringRadius(size, strokeWidth, ringGap, index);
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * arc;
  const ticks =
    segments && segments > 0 && Number.isFinite(segments)
      ? Math.floor(segments)
      : 0;
  const slot = ticks ? arcLength / ticks : 0;
  const dash = ticks ? Math.max(slot - segmentGap, 0.5) : 0;
  const cap = lineCap ?? (ticks ? "butt" : "round");
  const fraction =
    datum &&
    datum.maxValue > 0 &&
    Number.isFinite(datum.value) &&
    Number.isFinite(datum.maxValue)
      ? datum.value / datum.maxValue
      : 0;
  const clamped = Math.max(0, Math.min(1, fraction));
  const start = (index / Math.max(1, count)) * 0.4;
  const progress = Math.max(0, Math.min(1, (reveal - start) / 0.6));
  const trackDash = ticks ? [dash, slot - dash] : [arcLength, circumference];
  let progressDash = [arcLength * clamped * progress, circumference];
  if (ticks) {
    const lit = Math.round(ticks * clamped * progress);
    progressDash = [];
    for (let tick = 0; tick < ticks; tick += 1) {
      if (tick < lit) {
        progressDash.push(dash, slot - dash);
      } else {
        progressDash.push(0, slot);
      }
    }
  }
  return { cap, progressDash, radius, trackDash };
};
export const ringContainsPoint = (
  x: number,
  y: number,
  size: number,
  radius: number,
  strokeWidth: number,
  startAngle: number,
  arc: number
) => {
  if (arc <= 0) {
    return false;
  }
  const dx = x - size / 2;
  const dy = y - size / 2;
  const distance = Math.hypot(dx, dy);
  if (Math.abs(distance - radius) > Math.max(strokeWidth, 28) / 2) {
    return false;
  }
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90 - startAngle;
  const degrees = ((angle % 360) + 360) % 360;
  return arc >= 1 || degrees <= arc * 360;
};
