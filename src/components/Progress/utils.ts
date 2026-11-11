export const progressRange = (
  value: number,
  min: number,
  max: number
): { clamped: number; fraction: number } => {
  let clamped = min;
  if (value > min) {
    clamped = Math.min(value, max);
  }
  return { clamped, fraction: max > min ? (clamped - min) / (max - min) : 0 };
};

export const progressIndicatorWidth = (
  fraction: number,
  indeterminate: boolean,
  reducedMotion: boolean
): string => {
  if (indeterminate) {
    return reducedMotion ? "100%" : "40%";
  }
  return `${fraction * 100}%`;
};

export const progressValueLabel = (
  value: number,
  fraction: number,
  label?: string,
  options?: Intl.NumberFormatOptions
): string => {
  if (label !== undefined) {
    return label;
  }
  if (options) {
    try {
      return new Intl.NumberFormat(undefined, options).format(
        options.style === "percent" ? fraction : value
      );
    } catch {
      return `${Math.round(fraction * 100)}%`;
    }
  }
  return `${Math.round(fraction * 100)}%`;
};
