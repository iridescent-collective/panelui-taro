import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

export type ThinkingOrbState =
  | "working"
  | "searching"
  | "solving"
  | "listening"
  | "composing"
  | "shaping";
export interface Profile {
  speed: number;
  rows: number;
  density: number;
  radius: number;
}
export interface ThinkingOrbProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  state?: ThinkingOrbState;
  size?: number;
  speed?: number;
  paused?: boolean;
  color?: string;
  accessibilityLabel?: string;
}
