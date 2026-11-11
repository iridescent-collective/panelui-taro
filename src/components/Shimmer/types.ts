import type { View } from "@tarojs/components";
import type { ComponentProps, CSSProperties } from "react";

export interface ShimmerProps extends ComponentProps<typeof View> {
  as?: "text" | "view";
  duration?: number;
  spread?: number;
  baseColor?: string;
  shimmerColor?: string;
  mode?: "loop" | "ping-pong";
  once?: boolean;
  reverse?: boolean;
  enabled?: boolean;
  textClassName?: string;
  textStyle?: CSSProperties | string;
  color?: string;
  intensity?: number;
  maskSource?: string;
}
