import type { SoundwaveState } from "./types";

export const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

export const hashD = (a: number, b: number): number => {
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43_758.5453;
  return h - Math.floor(h);
};

export const q = (value: number): number => Math.round(value * 10) / 10;

export const idleEnergy = (state: SoundwaveState, t: number): number => {
  if (state === "listening") {
    return clamp01(
      0.34 +
        0.22 * Math.sin(t * 2.3) +
        0.16 * Math.sin(t * 3.9 + 1.3) +
        0.1 * Math.sin(t * 7.1 + 0.6)
    );
  }
  if (state === "speaking") {
    return clamp01(
      0.46 +
        0.27 * Math.sin(t * 3.1) +
        0.18 * Math.sin(t * 5.7 + 0.8) +
        0.09 * Math.sin(t * 9.3)
    );
  }
  if (state === "thinking") {
    return clamp01(
      0.18 + 0.1 * Math.sin(t * 1.6) + 0.05 * Math.sin(t * 2.9 + 2.1)
    );
  }
  return clamp01(0.07 + 0.05 * Math.sin(t * 1.1));
};

export const barValue = (
  i: number,
  count: number,
  scrolling: boolean,
  supplied: number[],
  history: number[],
  clock: number,
  energy: number
): number => {
  if (scrolling) {
    const offset = i - (count - history.length);
    return offset >= 0 ? (history[offset] ?? 0) : 0;
  }
  if (supplied.length) {
    return supplied[Math.floor((i / count) * supplied.length)] ?? 0;
  }
  const rate = 2.1 + hashD(i, 1.3) * 2.9;
  const phase = hashD(i, 4.7) * Math.PI * 2;
  const wobble = 0.5 + 0.5 * Math.sin(clock * rate + phase);
  const centre = count > 1 ? Math.sin((Math.PI * (i + 0.5)) / count) : 1;
  return energy * wobble * (0.45 + 0.55 * centre);
};
