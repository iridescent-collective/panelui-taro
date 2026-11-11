import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";

export type FlipCardDirection = "horizontal" | "vertical";
export type FlipCardRotation = "normal" | "reverse";
export type FlipCardTrigger = "press" | "drag" | "none";
export interface FlipCardProps extends ComponentProps<typeof View> {
  direction?: FlipCardDirection;
  rotation?: FlipCardRotation;
  flipped?: boolean;
  defaultFlipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  trigger?: FlipCardTrigger;
  perspective?: number;
}
export type FlipCardFaceProps = ComponentProps<typeof View>;
export interface FlipCardContextValue {
  flipped: boolean;
  direction: FlipCardDirection;
  rotation: FlipCardRotation;
  perspective: number;
  progress: ObservableNumber;
  flip: () => void;
}
export interface FlipControllerOptions extends FlipCardProps {
  direction: FlipCardDirection;
  rotation: FlipCardRotation;
  trigger: FlipCardTrigger;
  perspective: number;
  defaultFlipped: boolean;
}
