import type { PieDatum } from "./types";

export interface SliceAngles {
  from: number;
  to: number;
  mid: number;
  fraction: number;
}
export const pieValue = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
export const pieTotal = (data: PieDatum[]) =>
  data.reduce((sum, slice) => sum + pieValue(slice.value), 0);
export const pieSlices = (
  data: PieDatum[],
  total: number,
  origin: number,
  span: number,
  padAngle: number,
  minAngle: number
): SliceAngles[] => {
  const count = data.length;
  if (!count || total <= 0 || span <= 0) {
    return [];
  }
  const pad = Math.min(padAngle / 360, span / (count * 2));
  const gaps = count > 1 || span < 1 ? pad * count : 0;
  const floor = Math.min(minAngle / 360, (span - gaps) / (count * 2));
  const drawn = data.filter((slice) => pieValue(slice.value) > 0).length;
  const floors = floor * drawn;
  const free = Math.max(span - gaps - floors, 0);
  const result: SliceAngles[] = [];
  let cursor = origin + pad / 2;
  for (const slice of data) {
    const value = pieValue(slice.value);
    const fraction = value / total;
    const sweep = value > 0 ? floor + free * fraction : 0;
    result.push({
      fraction,
      from: cursor,
      mid: cursor + sweep / 2,
      to: cursor + sweep,
    });
    cursor += sweep + pad;
  }
  return result;
};
