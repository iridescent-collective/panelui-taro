import type { ScrollView, View } from "@tarojs/components";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { AvatarImageSource } from "../Avatar/types";

export type ScrollHeaderMaterial = "light" | "dark" | "default";
export type ScrollHeaderSurface = "plain" | "muted" | "none" | "blur";
export type ScrollHeaderSlot = "bar" | "large";
export interface ScrollHeaderProps extends ComponentProps<typeof View> {
  barHeight?: number;
  threshold?: number;
  snap?: boolean;
  stretch?: boolean;
  inset?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  progress?: ObservableNumber;
}
export interface ScrollHeaderBarProps extends ComponentProps<typeof View> {
  surface?: ScrollHeaderSurface;
  divider?: boolean;
  intensity?: number;
  material?: ScrollHeaderMaterial;
}
export interface ScrollHeaderLargeProps extends ComponentProps<typeof View> {
  onLayout?: (event: { nativeEvent: { layout: ElementLayout } }) => void;
}
export type ScrollHeaderActionsProps = ComponentProps<typeof View>;
export interface ScrollHeaderCoverProps extends ComponentProps<typeof View> {
  source?: AvatarImageSource;
  colors?: [string, string, ...string[]];
  scrim?: boolean;
}
export interface ScrollHeaderContextValue {
  progress: ObservableNumber;
  offset: ObservableNumber;
  largeHeight: ObservableNumber;
  collapsed: boolean;
  hasLarge: boolean;
  measureLarge: (height: number) => void;
  barBand: number;
  insetTop: number;
}
export interface HeaderContentStyle extends CSSProperties {
  paddingVertical?: number;
}
export interface HeaderScrollableProps extends ComponentProps<
  typeof ScrollView
> {
  contentContainerStyle?: HeaderContentStyle;
  scrollIndicatorInsets?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  scrollEventThrottle?: number;
  contentInsetAdjustmentBehavior?:
    | "automatic"
    | "scrollableAxes"
    | "never"
    | "always";
  children?: ReactNode;
}
