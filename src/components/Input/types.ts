import type {
  Input as NativeInput,
  Textarea as NativeTextarea,
} from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export type InputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type InputVariant = "outline" | "filled";
export type KeyboardAvoidanceMode = "lift" | "dock";
export type InputNativeProps = ComponentProps<typeof NativeInput>;
export type TextareaNativeProps = ComponentProps<typeof NativeTextarea>;
export interface InputProps extends Omit<InputNativeProps, "size"> {
  "aria-label"?: string;
  size?: InputSize;
  variant?: InputVariant;
  containerClassName?: string;
  visuallyHidden?: boolean;
  label?: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  interactiveContent?: boolean;
  avoidKeyboard?: boolean;
  keyboardMode?: KeyboardAvoidanceMode;
  keyboardOffset?: number;
  keyboardBottomInset?: number;
  multiline?: boolean;
  onChangeText?: (value: string) => void;
  defaultValue?: string;
  autoFocus?: boolean;
  placeholderTextColor?: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  maxLength?: number;
  keyboardType?:
    | "default"
    | "numeric"
    | "decimal-pad"
    | "number-pad"
    | "email-address"
    | "phone-pad"
    | "url";
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  accessibilityLabel?: string;
}
export interface InputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}
