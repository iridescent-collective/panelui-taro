import type { Input as NativeInput } from "@tarojs/components";
import type { AriaAttributes, ComponentProps } from "react";

export type OtpInputSize = "sm" | "md" | "lg";
export interface OtpInputProps
  extends
    Omit<
      ComponentProps<typeof NativeInput>,
      | "value"
      | "defaultValue"
      | "onInput"
      | "maxLength"
      | "maxlength"
      | "children"
      | "type"
      | "size"
      | "placeholder"
    >,
    AriaAttributes {
  cellClassName?: string;
  length?: number;
  value?: string;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  onComplete?: (value: string) => void;
  type?: "numeric" | "text";
  mask?: boolean;
  placeholder?: string;
  groupEvery?: number;
  size?: OtpInputSize;
  editable?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  accessibilityLabel?: string;
  onInput?: ComponentProps<typeof NativeInput>["onInput"];
}
