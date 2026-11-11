import { resolveAccessibilityLabel } from "../../primitives/accessibility-label";
import { extractNativeInputProps } from "./native-props";
import type { InputNativeProps, InputProps } from "./types";
import type { useInput } from "./use-input";
import type { useInputPresentation } from "./use-presentation";

const keyboardType = (
  type: InputProps["keyboardType"]
): InputNativeProps["type"] => {
  if (type === "numeric" || type === "decimal-pad") {
    return "digit";
  }
  if (type === "number-pad" || type === "phone-pad") {
    return "number";
  }
  return "text";
};
export const inputFieldProps = (
  props: InputProps,
  state: ReturnType<typeof useInput>,
  presentation: ReturnType<typeof useInputPresentation>
) => {
  const native = extractNativeInputProps(props);
  return {
    ...native,
    adjustPosition: presentation.keyboard.adjustPosition,
    "aria-disabled": !!state.blocked,
    "aria-invalid": presentation.invalid,
    "aria-label": resolveAccessibilityLabel(props) ?? props.label,
    "aria-required": props.isRequired,
    className: presentation.slots.field({
      className: `box-border ${props.className ?? ""}`,
    }),
    confirmType: props.returnKeyType ?? native.confirmType,
    cursorSpacing: presentation.keyboard.cursorSpacing,
    disabled: state.blocked,
    focus: props.focus ?? state.focusRequested,
    maxlength: props.maxLength ?? native.maxlength ?? -1,
    onBlur: state.onBlur,
    onFocus: state.onFocus,
    onInput: state.onInput,
    onKeyboardHeightChange: state.onKeyboardHeightChange,
    password: props.secureTextEntry ?? native.password,
    placeholderStyle:
      native.placeholderStyle ??
      `color:${props.placeholderTextColor ?? presentation.colors.placeholder}`,
    ref: state.fieldRef,
    style: presentation.fieldStyle,
    type: native.type ?? keyboardType(props.keyboardType),
    value: state.value,
  };
};
