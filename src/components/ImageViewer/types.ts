import type { ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { Rect, Size } from "./geometry";

export type ImageViewerSource =
  | string
  | {
      uri: string;
      width?: number;
      height?: number;
    };
export type ImageViewerDirection = "ltr" | "rtl";
export interface ImageViewerProps {
  dir?: ImageViewerDirection;
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  blur?: boolean;
  maxScale?: number;
  doubleTapScale?: number;
  haptics?: boolean;
  showClose?: boolean;
  closeLabel?: string;
  inset?: number;
  cornerRadius?: number;
}
export interface ImageViewerTriggerProps extends Omit<
  AnimatedPressableProps,
  "children" | "style" | "disabled"
> {
  source: ImageViewerSource;
  fullSource?: ImageViewerSource;
  alt?: string;
  caption?: ReactNode;
  index?: number;
  radius?: number;
  width?: number;
  height?: number;
  disabled?: boolean;
  children?: ReactNode;
}
export interface ViewerItem {
  id: string;
  order: number;
  index?: number;
  source: ImageViewerSource;
  fullSource?: ImageViewerSource;
  alt?: string;
  caption?: ReactNode;
  radius: number;
  size: Size | null;
  measure: (done: (rect: Rect | null) => void) => void;
}
export interface ViewerFrame {
  t: number;
  scale: number;
  tx: number;
  ty: number;
  dragX: number;
  dragY: number;
  shrink: number;
  fade: number;
  pagerX: number;
  chrome: number;
}
