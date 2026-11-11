import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";
import type { DotFieldAnimation } from "./dot-field";

export type ImageGenerationStatus =
  | "queued"
  | "generating"
  | "refining"
  | "complete"
  | "error";
export interface ImageGenerationFieldProps extends Omit<
  ComponentProps<typeof View>,
  "children" | "animation"
> {
  paused?: boolean;
  animation?: DotFieldAnimation;
  onLayout?: (layout: ElementLayout) => void;
}
export interface ImageGenerationProps extends Omit<
  ComponentProps<typeof View>,
  "animation"
> {
  status?: ImageGenerationStatus;
  label?: string;
  prompt?: string;
  resolution?: string;
  aspectRatio?: number;
  size?: "compact" | "fluid";
  animation?: DotFieldAnimation;
  statusText?: string;
  showStatus?: boolean;
  onRetry?: () => void;
  frameClassName?: string;
  mediaClassName?: string;
  statusClassName?: string;
}
