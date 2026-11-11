import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type {
  PopoverProps,
  PopoverContentProps,
  PopoverTriggerProps,
} from "../Popover";

export type MenuItemVariant = "default" | "destructive";
export interface MenuProps extends PopoverProps {
  haptics?: boolean;
}
export type MenuTriggerProps = PopoverTriggerProps;
export interface MenuContentProps extends Omit<
  PopoverContentProps,
  "children" | "scrollable"
> {
  children?: ReactNode;
  scrollable?: boolean;
}
export interface MenuBackgroundProps extends ComponentProps<typeof View> {
  children?: ReactNode;
}
export interface MenuLabelProps extends ComponentProps<typeof View> {
  inset?: boolean;
  children?: ReactNode;
}
export type MenuSeparatorProps = ComponentProps<typeof View>;
export interface MenuItemProps extends Omit<
  AnimatedPressableProps,
  "children" | "style"
> {
  children?: ReactNode;
  icon?: ReactNode;
  description?: string;
  shortcut?: string;
  trailing?: ReactNode;
  variant?: MenuItemVariant;
  inset?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onSelect?: () => void;
}
export interface MenuCheckboxItemProps extends Omit<
  MenuItemProps,
  "icon" | "inset"
> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
export interface MenuRadioGroupProps extends ComponentProps<typeof View> {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}
export type MenuRadioIndicator = "check" | "dot";
export interface MenuRadioItemProps extends Omit<
  MenuItemProps,
  "icon" | "inset"
> {
  value: string;
  indicator?: MenuRadioIndicator;
}
export interface MenuSubProps {
  children?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export type MenuSubTriggerProps = Omit<
  MenuItemProps,
  "closeOnSelect" | "shortcut" | "trailing"
>;
export type MenuSubContentProps = ComponentProps<typeof View>;
