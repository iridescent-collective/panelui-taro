import type { CSSProperties } from "react";

import {
  CAROUSEL_COVERFLOW_DEPTH,
  CAROUSEL_COVERFLOW_SPREAD,
  CAROUSEL_OVERSCROLL,
  CAROUSEL_RUBBER,
  CAROUSEL_SNAP_FRACTION,
  CAROUSEL_SNAP_VELOCITY,
  CAROUSEL_STACK_DEPTH,
} from "./constants";
import type { CarouselVariant, CarouselOrientation } from "./types";

export const normalizeCarouselIndex = (
  index: number,
  count: number,
  loop: boolean
): number => {
  if (count <= 0 || !Number.isFinite(index)) {
    return 0;
  }
  if (loop) {
    return ((index % count) + count) % count;
  }
  return Math.max(0, Math.min(index, count - 1));
};
export const carouselDistance = (
  index: number,
  progress: number,
  count: number,
  loop: boolean
) => {
  const raw = index - progress;
  if (!loop || count <= 1) {
    return raw;
  }
  const half = count / 2;
  if (raw > half) {
    return raw - count;
  }
  if (raw < -half) {
    return raw + count;
  }
  return raw;
};
const interpolate = (
  value: number,
  low: number,
  high: number,
  from: number,
  to: number
) =>
  from + (to - from) * Math.max(0, Math.min(1, (value - low) / (high - low)));
export const carouselMotion = (
  variant: CarouselVariant,
  orientation: CarouselOrientation,
  d: number,
  itemSize: number,
  engaged: number
): CSSProperties => {
  const a = Math.abs(d);
  const horizontal = orientation === "horizontal";
  if (variant === "coverflow") {
    return {
      opacity: a > CAROUSEL_COVERFLOW_DEPTH ? 0 : Math.max(0, 1 - a * 0.25),
      transform: `perspective(2000rpx) translateX(${d * itemSize * CAROUSEL_COVERFLOW_SPREAD * 2}rpx) rotateY(${interpolate(d, -1, 1, 38, -38)}deg) scale(${interpolate(a, 0, 1, 1.1, 0.92)})`,
      zIndex: Math.round(100 - a * 10),
    };
  }
  if (variant === "stack") {
    const behind = Math.min(Math.max(0, d), CAROUSEL_STACK_DEPTH);
    const leaving = Math.min(0, d);
    return {
      opacity: d < -1 || d > CAROUSEL_STACK_DEPTH ? 0 : 1,
      transform: `translateX(${leaving * itemSize * 1.15 * 2}rpx) translateY(${behind * 28}rpx) rotate(${leaving * 12}deg) scale(${1 - behind * 0.06})`,
      zIndex: Math.round(100 - Math.max(0, d) * 10),
    };
  }
  if (variant === "interactive") {
    const spread = d * itemSize;
    const lift = d * 24 * engaged;
    return {
      opacity: a > 3 ? 0 : 1,
      transform: `translateX(${(horizontal ? spread : lift) * 2}rpx) translateY(${(horizontal ? lift : spread) * 2}rpx) rotate(${d * (5 + engaged * 15)}deg) scale(${interpolate(a, 0, 1, 1, 0.78 - engaged * 0.15)})`,
      zIndex: Math.round(100 - a * 10),
    };
  }
  return {
    transform: `translateX(${horizontal ? d * itemSize * 2 : 0}rpx) translateY(${horizontal ? 0 : d * itemSize * 2}rpx)`,
  };
};
export const carouselDragPosition = (
  from: number,
  moved: number,
  itemSize: number,
  count: number,
  loop: boolean
) => {
  const raw = from - moved / itemSize;
  if (loop) {
    return raw;
  }
  const last = count - 1;
  if (raw < 0) {
    return Math.max(-CAROUSEL_OVERSCROLL, raw * CAROUSEL_RUBBER);
  }
  if (raw > last) {
    return Math.min(
      last + CAROUSEL_OVERSCROLL,
      last + (raw - last) * CAROUSEL_RUBBER
    );
  }
  return raw;
};
export const carouselReleaseIndex = (
  from: number,
  moved: number,
  velocity: number,
  itemSize: number
) => {
  const advance =
    Math.abs(moved) / itemSize > CAROUSEL_SNAP_FRACTION ||
    Math.abs(velocity) > CAROUSEL_SNAP_VELOCITY;
  const direction = moved < 0 ? 1 : -1;
  return Math.round(from) + (advance ? direction : 0);
};
export const carouselCaptionOpacity = (distance: number) =>
  interpolate(Math.abs(distance), 0, 0.3, 1, 0);
