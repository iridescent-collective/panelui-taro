import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export type TabsVariant = "segmented" | "underline" | "pill" | "expanding";
export type TabsSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TabsKeepMounted = boolean | "measured";
export type TabsAnimation = "disable-all";
export interface TabsProps extends Omit<
  ComponentProps<typeof View>,
  "animation"
> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue: string;
  variant?: TabsVariant;
  size?: TabsSize;
  keepMounted?: TabsKeepMounted;
  swipeable?: boolean;
  animation?: TabsAnimation;
  children: ReactNode;
}
export interface TabsListProps extends ComponentProps<typeof View> {
  scrollable?: boolean;
  indicatorClassName?: string;
  children: ReactNode;
}
export interface TabsTriggerProps extends ComponentProps<typeof View> {
  activeClassName?: string;
  labelClassName?: string;
  activeLabelClassName?: string;
  pressScale?: number;
  className?: string;
  value: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}
export interface TabsContentProps extends ComponentProps<typeof View> {
  value: string;
  children: ReactNode;
}
export interface TabLayout {
  x: number;
  width: number;
}
