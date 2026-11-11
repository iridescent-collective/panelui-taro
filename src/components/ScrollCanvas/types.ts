import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";

export type ScrollCanvasEffect = "parallax" | "zoom" | "reveal" | "sequence";
export type ScrollCanvasSource = string | { uri: string };
export interface ScrollCanvasProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  source?: ScrollCanvasSource;
  sources?: ScrollCanvasSource[];
  effect?: ScrollCanvasEffect;
  aspectRatio?: number;
  distance?: number;
  start?: number;
  end?: number;
  progress?: ObservableNumber;
  enabled?: boolean;
  imageClassName?: string;
}
