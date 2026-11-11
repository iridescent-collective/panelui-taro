import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";

export type SoundwaveVariant = "pills" | "bars" | "line" | "ambient";
export type SoundwaveState = "idle" | "listening" | "thinking" | "speaking";
export interface SoundwaveProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  variant?: SoundwaveVariant;
  state?: SoundwaveState;
  level?: number | ObservableNumber;
  levels?: number[];
  progress?: number | ObservableNumber;
  bars?: number;
  barWidth?: number;
  barGap?: number;
  height?: number;
  mode?: "static" | "scrolling";
  centered?: boolean;
  fadeEdges?: boolean;
  sensitivity?: number;
  speed?: number;
  color?: string;
  gradient?: readonly string[];
  trackColor?: string;
  paused?: boolean;
  radius?: number;
  accessibilityLabel?: string;
}
export interface WaveFrame {
  clock: number;
  energy: number;
  samples: number[];
  nextSample: number;
}
export interface WaveEngineOptions {
  level?: number | ObservableNumber;
  state: SoundwaveState;
  sensitivity: number;
  speed: number;
  paused: boolean;
  history: number;
}
