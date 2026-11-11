import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export type SwipeSide = "start" | "end";
export type SwipeOpenSide = SwipeSide | null;
export type SwipeActionColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "destructive";
export interface SwipeHandle {
  open: (side: SwipeSide) => void;
  close: () => void;
}
export interface SwipeProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children?: ReactNode;
  fullSwipe?: boolean;
  disabled?: boolean;
  haptics?: boolean;
  onOpenChange?: (side: SwipeOpenSide) => void;
  contentClassName?: string;
}
export interface SwipeGroupProps extends ComponentProps<typeof View> {
  exclusive?: boolean;
}
export type SwipePanelProps = ComponentProps<typeof View>;
export interface SwipeActionProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  keepOpen?: boolean;
  labelClassName?: string;
  color?: SwipeActionColor;
}
export interface DeclaredAction {
  label: string;
  color: SwipeActionColor;
  onPress?: () => void;
}
