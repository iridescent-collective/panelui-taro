import { FUNNEL_TEXT_BAND, FUNNEL_HIT_ITERATIONS } from "./constants";
import type { Band, FunnelDatum } from "./types";

export const funnelModel = (
  data: FunnelDatum[],
  width: number,
  height: number,
  stageSize: number | undefined,
  gap: number,
  minWidth: number,
  mirrored: boolean,
  animationDuration: number,
  staggerDelay: number
) => {
  const count = data.length;
  const spacing = Math.max(gap, 0);
  const size =
    stageSize ?? Math.max(0, (width - (count - 1) * spacing) / count);
  const peak = Math.max(0, ...data.map((stage) => stage.value));
  const first = Math.max(0, data[0]?.value ?? 0);
  const textBand = height * FUNNEL_TEXT_BAND;
  const middle = height / 2;
  const reach = Math.max(0, middle - textBand);
  const floor = Math.max(0, Math.min(minWidth, 1));
  const extents = data.map((stage) => {
    const value = Math.max(0, stage.value);
    return value <= 0 || peak <= 0 ? 0 : reach * Math.max(value / peak, floor);
  });
  const bands: Band[] =
    count && width > 0 && reach > 0
      ? extents.map((extent, index) => {
          const offset = index * (size + spacing);
          const next = extents[index + 1] ?? extent;
          return {
            head: mirrored ? next : extent,
            length: size,
            offset: mirrored ? width - offset - size : offset,
            tail: mirrored ? extent : next,
          };
        })
      : [];
  const shares = data.map((stage) =>
    first > 0 ? Math.max(0, stage.value) / first : 0
  );
  const steps = data.map((stage, index) => {
    if (index === 0) {
      return 1;
    }
    const previous = Math.max(0, data[index - 1]?.value ?? 0);
    return previous > 0 ? Math.max(0, stage.value) / previous : 0;
  });
  const stagger = Math.max(0, staggerDelay);
  const total = animationDuration + Math.max(count - 1, 0) * stagger;
  const windows = data.map((_, index) => ({
    from: total > 0 ? (index * stagger) / total : 0,
    to: total > 0 ? (index * stagger + animationDuration) / total : 1,
  }));
  return { bands, middle, shares, steps, textBand, total, windows };
};
export const funnelReach = (
  reveal: number,
  window: { from: number; to: number }
) => {
  const range = window.to - window.from;
  const raw = range > 0 ? (reveal - window.from) / range : 1;
  const progress = Math.max(0, Math.min(1, raw));
  return 1 - (1 - progress) ** 3;
};
export const funnelContains = (
  band: Band,
  middle: number,
  curve: number,
  reach: number,
  x: number,
  y: number
) => {
  if (
    band.length <= 0 ||
    reach <= 0 ||
    x < band.offset ||
    x > band.offset + band.length
  ) {
    return false;
  }
  const position = (x - band.offset) / band.length;
  let t = position;
  if (curve > 0) {
    let high = 1;
    let low = 0;
    for (let iteration = 0; iteration < FUNNEL_HIT_ITERATIONS; iteration += 1) {
      t = (low + high) / 2;
      const px =
        3 * (1 - t) ** 2 * t * curve +
        3 * (1 - t) * t * t * (1 - curve) +
        t ** 3;
      if (px < position) {
        low = t;
      } else {
        high = t;
      }
    }
  }
  const fraction = curve > 0 ? 3 * (1 - t) * t * t + t ** 3 : t;
  const extent = (band.head + (band.tail - band.head) * fraction) * reach;
  return extent > 0 && Math.abs(y - middle) <= extent;
};
