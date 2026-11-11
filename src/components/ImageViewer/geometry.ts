export interface Size {
  width: number;
  height: number;
}
export interface Rect extends Size {
  x: number;
  y: number;
}
export const RUBBER_BAND = 0.55;
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
export const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;
export const lerpRect = (from: Rect, to: Rect, t: number): Rect => ({
  height: lerp(from.height, to.height, t),
  width: lerp(from.width, to.width, t),
  x: lerp(from.x, to.x, t),
  y: lerp(from.y, to.y, t),
});
export const fitContain = (image: Size, box: Size): Rect => {
  if (image.width <= 0 || image.height <= 0) {
    return { height: box.height, width: box.width, x: 0, y: 0 };
  }
  const scale = Math.min(box.width / image.width, box.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    height,
    width,
    x: (box.width - width) / 2,
    y: (box.height - height) / 2,
  };
};
export const fitWithin = (image: Size, box: Rect): Rect => {
  const fitted = fitContain(image, box);
  return { ...fitted, x: box.x + fitted.x, y: box.y + fitted.y };
};
export const coverSize = (image: Size, frame: Size): Size => {
  if (image.width <= 0 || image.height <= 0) {
    return { height: frame.height, width: frame.width };
  }
  const scale = Math.max(
    frame.width / image.width,
    frame.height / image.height
  );
  return { height: image.height * scale, width: image.width * scale };
};
export const rubberBand = (
  overshoot: number,
  dimension: number,
  coefficient?: number
): number => {
  if (dimension <= 0) {
    return 0;
  }
  const give = coefficient ?? RUBBER_BAND;
  return (1 - 1 / ((overshoot * give) / dimension + 1)) * dimension;
};
export const rubberBandClamp = (
  value: number,
  min: number,
  max: number,
  dimension: number,
  coefficient?: number
): number => {
  const clamped = clamp(value, min, max);
  const overshoot = Math.abs(value - clamped);
  if (overshoot === 0) {
    return clamped;
  }
  const sign = value < clamped ? -1 : 1;
  return clamped + sign * rubberBand(overshoot, dimension, coefficient);
};
export const panBound = (
  fitted: number,
  scale: number,
  viewport: number
): number => Math.max(0, (fitted * scale - viewport) / 2);
export const focalTranslation = (
  focal: number,
  offset: number,
  fromScale: number,
  toScale: number
): number => {
  if (fromScale === 0) {
    return focal;
  }
  return focal - offset * (toScale / fromScale);
};
export const snapPage = (
  offset: number,
  velocity: number,
  current: number,
  count: number,
  pageWidth: number
): number => {
  if (count <= 1 || pageWidth <= 0) {
    return 0;
  }
  const projected = -(offset + velocity * 0.25) / pageWidth;
  const target = Math.round(projected);
  return clamp(clamp(target, current - 1, current + 1), 0, count - 1);
};
export const DISMISS_DISTANCE = 110;
export const shouldDismiss = (
  translation: number,
  velocity: number
): boolean => {
  const projected = translation + velocity * 0.2;
  if (Math.abs(projected) <= DISMISS_DISTANCE) {
    return false;
  }
  return translation === 0 || Math.sign(projected) === Math.sign(translation);
};
export const dragFade = (distance: number, viewport: number): number => {
  if (viewport <= 0) {
    return 1;
  }
  return 1 - clamp(Math.abs(distance) / (viewport * 0.4), 0, 1) * 0.85;
};
export const dragScale = (distance: number, viewport: number): number => {
  if (viewport <= 0) {
    return 1;
  }
  return 1 - clamp(Math.abs(distance) / viewport, 0, 1) * 0.2;
};
export const hitsRect = (
  px: number,
  py: number,
  rect: Rect,
  scale: number,
  tx: number,
  ty: number
): boolean => {
  const cx = rect.x + rect.width / 2 + tx;
  const cy = rect.y + rect.height / 2 + ty;
  return (
    Math.abs(px - cx) <= (rect.width * scale) / 2 &&
    Math.abs(py - cy) <= (rect.height * scale) / 2
  );
};
