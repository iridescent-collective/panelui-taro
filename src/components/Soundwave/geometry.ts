import { FLOOR, LINE_POINTS } from "./constants";
import { barValue, clamp01, hashD, q } from "./math";
import type { WaveFrame } from "./types";

export const pillHeight = (
  index: number,
  count: number,
  width: number,
  height: number,
  frame: WaveFrame
) => {
  const rate = 2.2 + hashD(index, 1.7) * 2.6;
  const phase = hashD(index, 5.1) * Math.PI * 2;
  const wobble = 0.55 + 0.45 * Math.sin(frame.clock * rate + phase);
  const centre = count > 1 ? 1 - Math.abs((index / (count - 1)) * 2 - 1) : 1;
  const value = clamp01(
    Math.max(FLOOR, frame.energy) * wobble * (0.68 + 0.32 * centre)
  );
  const min = width * 1.35;
  return min + (height - min) * value;
};
export interface BarsGeometry {
  frame: WaveFrame;
  bands: number[];
  progress?: number;
  count: number;
  barWidth: number;
  width: number;
  height: number;
  centered: boolean;
  scrolling: boolean;
}
export const barsPath = (options: BarsGeometry, played: boolean) => {
  const {
    frame,
    bands,
    progress,
    count,
    barWidth,
    width,
    height,
    centered,
    scrolling,
  } = options;
  const step = count > 1 ? (width - barWidth) / (count - 1) : 0;
  const span = height - barWidth;
  const head = progress === undefined ? count : clamp01(progress) * count;
  let path = "";
  for (let index = 0; index < count; index += 1) {
    if (index + 0.5 <= head !== played) {
      continue;
    }
    const value = barValue(
      index,
      count,
      scrolling,
      bands,
      frame.samples,
      frame.clock,
      frame.energy
    );
    const length = span * clamp01(Math.max(FLOOR, value));
    const x = q(barWidth / 2 + index * step);
    path += centered
      ? `M${x} ${q(height / 2 - length / 2)}L${x} ${q(height / 2 + length / 2)}`
      : `M${x} ${q(height - barWidth / 2)}L${x} ${q(height - barWidth / 2 - length)}`;
  }
  return path;
};
export const linePath = (
  frame: WaveFrame,
  width: number,
  height: number,
  strokeWidth: number
) => {
  const mid = height / 2;
  const amplitude =
    (height / 2 - strokeWidth) * clamp01(Math.max(FLOOR, frame.energy));
  let path = "";
  for (let index = 0; index <= LINE_POINTS; index += 1) {
    const f = index / LINE_POINTS;
    const y =
      mid -
      amplitude *
        Math.sin(Math.PI * f) *
        (0.62 * Math.sin(f * 12.6 - frame.clock * 3.1) +
          0.26 * Math.sin(f * 21.4 - frame.clock * 4.7 + 1.1) +
          0.12 * Math.sin(f * 33.2 - frame.clock * 2.3));
    path += `${index === 0 ? "M" : "L"}${q(f * width)} ${q(y)}`;
  }
  return path;
};
