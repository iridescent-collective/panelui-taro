const MAX_DECIMAL_PRECISION = 15;
const requestedPrecision = (step: number): number => {
  if (!Number.isFinite(step)) {
    return 0;
  }
  const [coefficient = "", exponentText] = Math.abs(step)
    .toString()
    .toLowerCase()
    .split("e");
  const decimals = coefficient.split(".")[1]?.length ?? 0;
  const exponent = exponentText === undefined ? 0 : Number(exponentText);
  return Math.max(0, decimals - exponent);
};
export const precisionOf = (step: number): number =>
  Math.min(MAX_DECIMAL_PRECISION, requestedPrecision(step));

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const normalize = (
  value: number,
  min: number,
  max: number,
  step: number
): number => {
  const base = Number.isFinite(min) ? min : 0;
  const offset = (value - base) / step;
  const snapped =
    Number.isFinite(step) &&
    step > 0 &&
    Number.isSafeInteger(Math.round(offset))
      ? Math.round(offset) * step + base
      : value;
  if (requestedPrecision(step) > MAX_DECIMAL_PRECISION) {
    return clamp(snapped, min, max);
  }
  const precision = Math.max(precisionOf(step), precisionOf(base));
  const factor = 10 ** precision;
  const scaled = snapped * factor;
  const rounded = Number.isSafeInteger(Math.round(scaled))
    ? Math.round(scaled) / factor
    : Number(snapped.toFixed(precision));
  return clamp(rounded, min, max);
};
