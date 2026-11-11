import type { SoundwaveVariant, SoundwaveState } from "./types";

export const STATE_LABEL: Record<SoundwaveState, string> = {
  idle: "Idle",
  listening: "Listening",
  speaking: "Speaking",
  thinking: "Thinking",
};
export const DEFAULTS: Record<
  SoundwaveVariant,
  { bars: number; barWidth: number; barGap: number; height: number }
> = {
  ambient: { barGap: 0, barWidth: 0, bars: 0, height: 0 },
  bars: { barGap: 3, barWidth: 3, bars: 40, height: 56 },
  line: { barGap: 0, barWidth: 3, bars: 0, height: 72 },
  pills: { barGap: 10, barWidth: 28, bars: 4, height: 96 },
};
export const ATTACK = 16;
export const RELEASE = 5;
export const FLOOR = 0.04;
export const SAMPLE_INTERVAL = 1 / 24;
export const LINE_POINTS = 56;
export const UNPLAYED_OPACITY = 0.3;
