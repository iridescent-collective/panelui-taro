import type { Input as NativeInput } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChipVariant } from "../Chip";
import type { InputProps } from "../Input/types";

export type TagInputVariant = "outline" | "filled";
export type TagInputSize = "sm" | "md" | "lg";
export type TagRejection = "duplicate" | "max" | "invalid";
export type TagBlurBehavior = "add" | "clear" | "keep";
export interface TagKeyEvent {
  nativeEvent: { key: string };
}
export interface TagInputProps
  extends
    Pick<
      InputProps,
      | "keyboardType"
      | "returnKeyType"
      | "secureTextEntry"
      | "placeholderTextColor"
    >,
    Omit<
      ComponentProps<typeof NativeInput>,
      "value" | "defaultValue" | "children"
    > {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  inputValue?: string;
  onInputValueChange?: (text: string) => void;
  className?: string;
  containerClassName?: string;
  variant?: TagInputVariant;
  size?: TagInputSize;
  label?: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  max?: number;
  allowOverflow?: boolean;
  allowDuplicates?: boolean;
  delimiters?: string[];
  blurBehavior?: TagBlurBehavior;
  validate?: (tag: string, tags: string[]) => boolean;
  onReject?: (tag: string, reason: TagRejection) => void;
  chipVariant?: ChipVariant;
  renderTag?: (tag: string, index: number) => ReactNode;
  clearable?: boolean;
  showCount?: boolean;
  haptics?: boolean;
  accessibilityLabel?: string;
  onKeyPress?: (event: TagKeyEvent) => void;
  onSubmitEditing?: ComponentProps<typeof NativeInput>["onConfirm"];
  autoFocus?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  autoComplete?: string;
  maxLength?: number;
}
