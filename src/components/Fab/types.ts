import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export type FabPlacement = "bottom-right" | "bottom-center" | "bottom-left";
export type FabSize = "sm" | "md" | "lg";
export type FabVariant = "primary" | "secondary" | "surface" | "destructive";
export type FabMenuAppearance = "platform" | "wells";
export type FabMenuIconPlacement = "leading" | "trailing";
export type FabGroupLayout = "dial" | "menu" | "native";
export interface FabProps extends Omit<AnimatedPressableProps, "children"> {
  icon?: ReactNode;
  children?: ReactNode;
  extended?: boolean;
  placement?: FabPlacement;
  offset?: number;
  haptics?: boolean;
  glass?: boolean;
  size?: FabSize;
  variant?: FabVariant;
}
export interface FabGroupProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  icon?: ReactNode;
  label?: string;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: FabPlacement;
  offset?: number;
  layout?: FabGroupLayout;
  appearance?: FabMenuAppearance;
  iconPlacement?: FabMenuIconPlacement;
  menuWidth?: number;
  menuRadius?: number;
  menuClassName?: string;
  rowClassName?: string;
  size?: FabSize;
  variant?: FabVariant;
  disabled?: boolean;
  haptics?: boolean;
  glass?: boolean;
  blur?: boolean;
  accessibilityLabel?: string;
  rotateOnOpen?: boolean;
}
export interface FabActionProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  icon?: ReactNode;
  systemImage?: string;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  labelClassName?: string;
}
