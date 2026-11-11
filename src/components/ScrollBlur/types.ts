import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

export type ScrollBlurTint = "light" | "dark" | "default";
export interface ScrollBlurProps extends ComponentProps<typeof View> {
  size?: number;
  edges?: "both" | "start" | "end" | "none";
  orientation?: "horizontal" | "vertical";
  layers?: number;
  intensity?: number;
  material?: ScrollBlurTint;
  color?: string;
  tint?: number;
  fadeInDistance?: number;
  enabled?: boolean;
}
