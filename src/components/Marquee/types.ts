import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";

export type MarqueeDirection = "horizontal" | "vertical";
export interface MarqueeProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children: ReactNode;
  speed?: number;
  spacing?: number;
  direction?: MarqueeDirection;
  reverse?: boolean;
  playing?: boolean;
  showPauseControl?: boolean;
  pauseLabel?: string;
  playLabel?: string;
  onPlayingChange?: (playing: boolean) => void;
  onLayout?: (layout: ElementLayout) => void;
}
export interface MarqueeGroupProps extends ComponentProps<typeof View> {
  playing?: boolean;
  showPauseControl?: boolean;
  pauseLabel?: string;
  playLabel?: string;
  onPlayingChange?: (playing: boolean) => void;
}
