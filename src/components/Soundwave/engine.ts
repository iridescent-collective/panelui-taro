import { ATTACK, RELEASE, SAMPLE_INTERVAL } from "./constants";
import { clamp01, hashD, idleEnergy } from "./math";
import type { WaveEngineOptions, WaveFrame } from "./types";

export const readNumber = (value: WaveEngineOptions["level"], fallback = 0) => {
  const number = typeof value === "object" ? value.value : (value ?? fallback);
  return Number.isFinite(number) ? number : 0;
};
export const advanceWaveFrame = (
  frame: WaveFrame,
  options: WaveEngineOptions,
  elapsed: number
): WaveFrame => {
  const delta = Math.min(Math.max(0, elapsed), 48) / 1000;
  const clock = frame.clock + delta * options.speed;
  const target =
    options.level === undefined
      ? idleEnergy(options.state, clock)
      : clamp01(readNumber(options.level) * options.sensitivity);
  const energy =
    frame.energy +
    (target - frame.energy) *
      Math.min(1, delta * (target > frame.energy ? ATTACK : RELEASE));
  if (options.history > 0 && clock >= frame.nextSample) {
    const samples = frame.samples.slice(
      frame.samples.length >= options.history ? 1 : 0
    );
    samples.push(clamp01(energy * (0.82 + 0.36 * hashD(clock, 3.3))));
    return { clock, energy, nextSample: clock + SAMPLE_INTERVAL, samples };
  }
  return { ...frame, clock, energy };
};
export const stillWaveFrame = (
  frame: WaveFrame,
  options: WaveEngineOptions
): WaveFrame => {
  const energy =
    options.level === undefined
      ? 0.42
      : clamp01(readNumber(options.level) * options.sensitivity);
  return {
    ...frame,
    energy,
    samples:
      options.history > 0
        ? Array.from({ length: options.history }, (_, index) =>
            clamp01(energy * (0.45 + 0.55 * Math.abs(Math.sin(index * 0.7))))
          )
        : frame.samples,
  };
};
