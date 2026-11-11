const DEFAULT_MAX = 5;
const DEFAULT_PRECISION = 1;

export const normalizeRatingMax = (max?: number) =>
  typeof max === "number" && Number.isFinite(max) && max >= 1
    ? Math.min(100, Math.floor(max))
    : DEFAULT_MAX;
export const normalizeRatingPrecision = (precision?: number) =>
  typeof precision === "number" && Number.isFinite(precision) && precision > 0
    ? precision
    : DEFAULT_PRECISION;
export const normalizeRatingValue = (value: number | undefined, max: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(value, 0), max)
    : 0;
export const ratingFromPosition = (
  x: number,
  width: number,
  max: number,
  precision: number
) => {
  if (width <= 0) {
    return 0;
  }
  const raw = Math.min(Math.max(x / width, 0), 1) * max;
  const steps = Math.ceil(raw / precision);
  if (!Number.isSafeInteger(steps)) {
    return raw;
  }
  return normalizeRatingValue(steps * precision, max);
};
