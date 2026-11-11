import type { SliderThumb } from "./types";

export const THUMB_WIDTH = { lg: 32, md: 28, sm: 24 } as const;
export const SLIDER_SPRING = { damping: 18, mass: 0.6, stiffness: 220 };
export const KNOB_SPRING = { damping: 15, mass: 0.5, stiffness: 200 };
export const clampSlider = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
export const snapSlider = (
  value: number,
  min: number,
  max: number,
  step: number
) =>
  step <= 0
    ? clampSlider(value, min, max)
    : clampSlider(Math.round((value - min) / step) * step + min, min, max);
export const sliderFraction = (value: number, min: number, max: number) =>
  max > min ? (value - min) / (max - min) : 0;
export const sliderPointFraction = (
  x: number,
  width: number,
  thumbWidth: number,
  sign: number
) =>
  clampSlider(
    ((sign === 1 ? x : width - x) - thumbWidth / 2) /
      Math.max(width - thumbWidth, 1),
    0,
    1
  );
export const pickSliderThumb = (
  x: number,
  width: number,
  thumbWidth: number,
  sign: number,
  low: number,
  high: number
): SliderThumb => {
  const w = Math.max(width, 1);
  const p =
    ((sign === 1 ? x : w - x) - thumbWidth / 2) / Math.max(w - thumbWidth, 1);
  const toLow = Math.abs(p - low);
  const toHigh = Math.abs(p - high);
  if (toLow === toHigh) {
    return p < low ? "low" : "high";
  }
  return toLow < toHigh ? "low" : "high";
};
