export type MeterColor =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "muted";
export interface MeterThreshold {
  from: number;
  color: MeterColor;
}
export const MAX_METER_SEGMENTS = 100;
export interface MeterScale {
  min: number;
  max: number;
  value: number;
  fraction: number;
}
export const normalizeScale = (
  value: number,
  min: number,
  max: number
): MeterScale => {
  const floor = Number.isFinite(min) ? min : 0;
  const candidateMax = Number.isFinite(max) ? max : 100;
  const ceiling = candidateMax > floor ? candidateMax : floor;
  let held = Math.min(Math.max(value, floor), ceiling);
  if (Number.isNaN(value) || value === Number.NEGATIVE_INFINITY) {
    held = floor;
  } else if (value === Number.POSITIVE_INFINITY) {
    held = ceiling;
  }
  const magnitude = Math.max(Math.abs(floor), Math.abs(ceiling), 1);
  const position =
    ceiling > floor
      ? (held / magnitude - floor / magnitude) /
        (ceiling / magnitude - floor / magnitude)
      : 0;
  return {
    fraction: Math.min(Math.max(position, 0), 1),
    max: ceiling,
    min: floor,
    value: held,
  };
};
export const normalizeSegments = (segments: number | undefined) => {
  if (segments === undefined || !Number.isFinite(segments) || !(segments > 0)) {
    return 0;
  }
  return Math.min(Math.floor(segments), MAX_METER_SEGMENTS);
};
export const clamp = (value: number, min: number, max: number) =>
  normalizeScale(value, min, max).value;
export const fractionOf = (value: number, min: number, max: number) =>
  normalizeScale(value, min, max).fraction;
export const colorFor = (
  value: number,
  base: MeterColor | undefined,
  thresholds: MeterThreshold[] | undefined
) => {
  if (!thresholds?.length) {
    return base;
  }
  let winner: MeterThreshold | undefined;
  for (const threshold of thresholds) {
    if (!Number.isFinite(threshold.from)) {
      continue;
    }
    if (value < threshold.from) {
      continue;
    }
    if (!winner || threshold.from > winner.from) {
      winner = threshold;
    }
  }
  return winner?.color ?? base;
};
export const litSegments = (fraction: number, segments: number) => {
  const count = normalizeSegments(segments);
  if (count === 0 || Number.isNaN(fraction) || fraction <= 0) {
    return 0;
  }
  if (!Number.isFinite(fraction) || fraction >= 1) {
    return count;
  }
  return Math.min(Math.ceil(fraction * count), count);
};
export const formatValue = (
  value: number,
  fraction: number,
  valueLabel?: string,
  formatOptions?: Intl.NumberFormatOptions
) => {
  if (valueLabel !== undefined) {
    return valueLabel;
  }
  const fallback = `${Math.round(fraction * 100)}%`;
  if (formatOptions) {
    try {
      return new Intl.NumberFormat(undefined, formatOptions).format(
        formatOptions.style === "percent" ? fraction : value
      );
    } catch {
      return fallback;
    }
  }
  return fallback;
};
export const meterSemantics = ({
  value,
  fraction,
  minValue,
  maxValue,
  label,
  accessibilityLabel,
  valueLabel,
  formatOptions,
}: {
  value: number;
  fraction: number;
  minValue: number;
  maxValue: number;
  label?: string;
  accessibilityLabel?: string;
  valueLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
}) => {
  const text = formatValue(value, fraction, valueLabel, formatOptions);
  return {
    label: accessibilityLabel ?? label,
    text,
    value: { max: maxValue, min: minValue, now: value, text },
  };
};
