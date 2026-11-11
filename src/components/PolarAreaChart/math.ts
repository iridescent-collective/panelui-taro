import type { PolarAreaDatum, PolarAreaScale } from "./types";

const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
export interface WedgeGeometry {
  from: number;
  to: number;
  mid: number;
  radius: number;
  fraction: number;
}
export const niceMax = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return (
    (NICE_STEPS.find((step) => value / magnitude <= step) ?? 10) * magnitude
  );
};
export const polarMax = (data: PolarAreaDatum[], explicit?: number) => {
  if (explicit !== undefined && Number.isFinite(explicit)) {
    return Math.max(explicit, 0) || 1;
  }
  let top = 0;
  for (const datum of data) {
    if (Number.isFinite(datum.value)) {
      top = Math.max(top, datum.value);
    }
  }
  return niceMax(top);
};
export const polarFraction = (value: number, maxValue: number) =>
  Number.isFinite(value) ? Math.min(Math.max(value, 0) / maxValue, 1) : 0;
export const polarRadius = (
  value: number,
  maxValue: number,
  radius: number,
  scale: PolarAreaScale
) => {
  const fraction = polarFraction(value, maxValue);
  return radius * (scale === "area" ? Math.sqrt(fraction) : fraction);
};
export const polarWedges = (
  data: PolarAreaDatum[],
  radius: number,
  origin: number,
  padAngle: number,
  maxValue: number,
  scale: PolarAreaScale
): WedgeGeometry[] => {
  if (!data.length || radius <= 0) {
    return [];
  }
  const each = 1 / data.length;
  const pad = Math.min(padAngle / 360, each / 2);
  return data.map((datum, index) => {
    const from = origin + each * index + pad / 2;
    const to = origin + each * (index + 1) - pad / 2;
    return {
      fraction: polarFraction(datum.value, maxValue),
      from,
      mid: (from + to) / 2,
      radius: polarRadius(datum.value, maxValue, radius, scale),
      to,
    };
  });
};
