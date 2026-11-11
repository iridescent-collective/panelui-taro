import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { InputHandle, InputProps } from "../Input";

export type SearchBarPanelPlacement = "top" | "bottom";
export type SearchBarPanelMode = "never" | "focus" | "always";
export type SearchBarSize = "sm" | "md" | "lg";
export type SearchBarHandle = InputHandle;
export interface SearchBarKeyEvent {
  nativeEvent: { key: string };
}
type InheritedInputProps = Omit<
  InputProps,
  | "avoidKeyboard"
  | "defaultValue"
  | "description"
  | "endContent"
  | "errorMessage"
  | "interactiveContent"
  | "isRequired"
  | "keyboardBottomInset"
  | "keyboardMode"
  | "keyboardOffset"
  | "label"
  | "multiline"
  | "onChangeText"
  | "size"
  | "startContent"
  | "value"
>;
export interface SearchBarProps extends InheritedInputProps {
  size?: SearchBarSize;
  shape?: "rounded" | "pill";
  value?: string;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  onSubmit?: (value: string) => void;
  debounce?: number;
  onDebouncedChange?: (value: string) => void;
  onClear?: () => void;
  onCancel?: () => void;
  isClearable?: boolean;
  cancel?: "never" | "focus" | "always";
  cancelLabel?: string;
  clearLabel?: string;
  loading?: boolean;
  icon?: ReactNode;
  avoidKeyboard?: boolean;
  keyboardOffset?: number;
  panel?: SearchBarPanelMode;
  panelPlacement?: SearchBarPanelPlacement;
  panelMaxHeight?: number;
  tokens?: ReactNode;
  onRemoveLastToken?: () => void;
  onKeyPress?: (event: SearchBarKeyEvent) => void;
  onSubmitEditing?: InputProps["onConfirm"];
  children?: ReactNode;
}
export interface SearchBarSectionProps extends ComponentProps<typeof View> {
  label?: string;
}
export interface SearchBarItemProps extends AnimatedPressableProps {
  leading?: ReactNode;
  trailing?: ReactNode;
  description?: string;
  selected?: boolean;
}
export interface SearchBarStatusProps extends ComponentProps<typeof View> {
  loading?: boolean;
}
export type SearchBarActionProps = AnimatedPressableProps;
export interface SearchBarTokenProps extends ComponentProps<typeof View> {
  leading?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}
export interface SearchBarContextValue {
  size: SearchBarSize;
  retainFocus: () => void;
}
