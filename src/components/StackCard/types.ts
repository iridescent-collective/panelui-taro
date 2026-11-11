import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { StackCardDirection } from "./geometry";

export type { StackCardDirection } from "./geometry";
export type StackCardLayout = "stack" | "fan" | "flat";
export type StackCardStampColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "destructive";
export interface StackCardHandle {
  swipe: (direction: StackCardDirection) => void;
  undo: () => void;
  reset: () => void;
}
export interface StackCardProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children?: ReactNode;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  onSwipe?: (direction: StackCardDirection, index: number) => void;
  onEmpty?: () => void;
  directions?: readonly StackCardDirection[];
  layout?: StackCardLayout;
  depth?: number;
  threshold?: number;
  disabled?: boolean;
  haptics?: boolean;
  directionLabels?: Partial<Record<StackCardDirection, string>>;
  pileClassName?: string;
}
export type StackCardCardProps = ComponentProps<typeof View>;
export type StackCardEmptyProps = ComponentProps<typeof View>;
export type StackCardActionsProps = ComponentProps<typeof View>;
export interface StackCardStampProps extends ComponentProps<typeof View> {
  direction?: StackCardDirection;
  color?: StackCardStampColor;
  labelClassName?: string;
}
export interface StackCardActionProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  action: StackCardDirection | "undo";
  icon?: ReactNode;
  label?: string;
  onPress?: () => void;
  color?: StackCardStampColor;
  size?: "sm" | "md" | "lg";
}
export interface StackFrame {
  x: number;
  y: number;
  fade: number;
  pivot: number;
  active: number;
  release: number;
  width: number;
  height: number;
}
