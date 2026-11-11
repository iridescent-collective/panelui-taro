import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

export interface ScrollFadeProps extends ComponentProps<typeof View> {
  size?: number;
  edges?: "both" | "start" | "end" | "none";
  orientation?: "horizontal" | "vertical";
  color?: string;
  fadeInDistance?: number;
  enabled?: boolean;
}
