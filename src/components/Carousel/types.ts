import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export type CarouselVariant = "default" | "interactive" | "coverflow" | "stack";
export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselAlign = "start" | "center";
export interface CarouselLayoutEvent {
  nativeEvent: {
    layout: { width: number; height: number; x: number; y: number };
  };
}
export interface CarouselProps extends ComponentProps<typeof View> {
  variant?: CarouselVariant;
  orientation?: CarouselOrientation;
  loop?: boolean;
  align?: CarouselAlign;
  itemSize?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  scrollEnabled?: boolean;
  onLayout?: (event: CarouselLayoutEvent) => void;
  children?: ReactNode;
}
export interface CarouselHandle {
  next: () => void;
  previous: () => void;
  scrollTo: (index: number) => void;
}
export interface CarouselContentProps extends ComponentProps<typeof View> {
  children?: ReactNode;
}
export interface CarouselItemProps extends ComponentProps<typeof View> {
  children?: ReactNode;
}
export interface CarouselCaptionProps extends ComponentProps<typeof View> {
  children?: ReactNode;
}
export interface CarouselDotsProps extends ComponentProps<typeof View> {
  orientation?: CarouselOrientation;
  interactive?: boolean;
}
export interface CarouselArrowProps extends ComponentProps<typeof View> {
  children?: ReactNode;
}
export type CarouselControlsProps = ComponentProps<typeof View>;
