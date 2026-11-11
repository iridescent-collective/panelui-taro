import type { useInput } from "../Input/use-input";
import { extractNativeTextareaProps } from "./native-props";
import type { TextareaProps } from "./types";
import type { useTextareaPresentation } from "./use-presentation";

export const textareaFieldProps = (
  props: TextareaProps,
  state: ReturnType<typeof useInput>,
  presentation: ReturnType<typeof useTextareaPresentation>
) => {
  const native = extractNativeTextareaProps(props);
  return {
    ...native,
    adjustPosition: presentation.keyboard.adjustPosition,
    "aria-disabled": !!state.blocked,
    "aria-invalid": presentation.invalid,
    "aria-label": props.accessibilityLabel ?? props.label,
    "aria-required": props.isRequired,
    className: presentation.slots.field({
      className: `box-border ${props.className ?? ""}`,
    }),
    confirmType: props.returnKeyType ?? native.confirmType,
    cursorSpacing: presentation.keyboard.cursorSpacing,
    disabled: state.blocked,
    focus: props.focus ?? state.focusRequested,
    id: presentation.field.id,
    maxlength: presentation.limit ?? -1,
    onBlur: state.onBlur,
    onFocus: state.onFocus,
    onInput: state.onInput,
    onKeyboardHeightChange: state.onKeyboardHeightChange,
    onLineChange: presentation.onLineChange,
    placeholderStyle:
      native.placeholderStyle ??
      `color:${props.placeholderTextColor ?? presentation.colors.placeholder}`,
    ref: state.fieldRef,
    style: presentation.fieldStyle,
    value: state.value,
  };
};
