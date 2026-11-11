import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export interface SelectionModeProps extends ComponentProps<typeof View> {
  values?: string[];
  active?: boolean;
  defaultActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (selected: string[]) => void;
  max?: number;
  haptics?: boolean;
  children: ReactNode;
}
export interface SelectionModeContextValue {
  active: boolean;
  enter: (value?: string) => Promise<void>;
  exit: () => void;
  selected: string[];
  isSelected: (value: string) => boolean;
  toggle: (value: string) => Promise<void>;
  selectAll: () => void;
  clear: () => void;
  allSelected: boolean;
  count: number;
  total: number;
  max?: number;
  haptics: boolean;
  sheet: boolean;
}
export interface SelectionModeIndicatorProps {
  className?: string;
  value?: string;
}
export interface SelectionModeItemProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  value: string;
  onPress?: () => void;
  disabled?: boolean;
  alwaysShowIndicator?: boolean;
  indicator?: "leading" | "ring" | "none";
  children: ReactNode;
}
export interface SelectionModeGroupProps extends ComponentProps<typeof View> {
  columns?: number;
  horizontal?: boolean;
  itemWidth?: number;
  gap?: number;
  label?: string;
  labelClassName?: string;
  separators?: boolean;
  children: ReactNode;
}
export interface SelectionModeHeaderProps extends ComponentProps<typeof View> {
  title?: string;
  hideSelectAll?: boolean;
}
export interface SelectionModeBarProps extends ComponentProps<typeof View> {
  placement?: "bar" | "floating";
  inset?: number;
  showWhenEmpty?: boolean;
  children: ReactNode;
}
export interface SelectionModeActionProps extends ComponentProps<typeof View> {
  destructive?: boolean;
  icon?: ReactNode;
  onPress?: (selected: string[]) => void;
  exitOnPress?: boolean;
  disabled?: boolean;
  labelClassName?: string;
}
export interface SelectionModeSheetProps {
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  hideSelectAll?: boolean;
  size?: "auto" | "half" | "full";
  children: ReactNode;
}
