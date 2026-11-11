import type { Input } from "@tarojs/components";
import type { ComponentProps } from "react";

export interface NumberInputProps extends Pick<
  ComponentProps<typeof Input>,
  | "onFocus"
  | "onBlur"
  | "placeholder"
  | "id"
  | "name"
  | "onConfirm"
  | "onInput"
  | "adjustPosition"
  | "cursorSpacing"
> {
  variant?: "outline" | "filled";
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  formatValue?: (value: number) => string;
  editable?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  haptics?: boolean;
  returnKeyType?: ComponentProps<typeof Input>["confirmType"];
}
