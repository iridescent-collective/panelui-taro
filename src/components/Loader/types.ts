import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

export type LoaderVariant =
  | "pulse-dots"
  | "bounce-dots"
  | "pulsating-dots"
  | "liquid-dots"
  | "bar-cascade"
  | "bouncing-bars"
  | "symmetric-wave"
  | "morph-ring"
  | "wave-physics";
export type LoaderSize = "sm" | "md" | "lg";
export interface LoaderProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  variant?: LoaderVariant;
  size?: LoaderSize;
  color?: string;
  speed?: number;
  label?: string;
}
