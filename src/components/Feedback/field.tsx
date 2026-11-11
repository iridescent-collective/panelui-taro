import { Textarea } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { mergeStyle } from "../../lib/styles";
import type { FeedbackFieldProps } from "./types";
import { useFeedbackField } from "./use-field";
import { feedbackVariants } from "./variants";

export const FeedbackField = forwardRef<
  ComponentRef<typeof Textarea>,
  FeedbackFieldProps
>((props, ref) => {
  const {
    className,
    value: _value,
    onChangeText: _onChangeText,
    onInput: _onInput,
    minHeight = 200,
    placeholder = "Tell us what you think",
    style,
    editable: _editable,
    autoFocus,
    maxLength,
    accessibilityLabel,
    disabled: _disabled,
    ...native
  } = props;
  const field = useFeedbackField(props, ref);
  return (
    <Textarea
      {...native}
      ref={field.attach}
      autoHeight
      adjustPosition={false}
      showConfirmBar={false}
      disabled={field.blocked}
      focus={autoFocus ?? native.focus}
      maxlength={maxLength ?? native.maxlength ?? -1}
      aria-label={accessibilityLabel ?? props["aria-label"] ?? native.ariaLabel}
      placeholder={placeholder}
      value={field.value}
      onInput={field.onInput}
      className={feedbackVariants().field({ className })}
      style={mergeStyle(
        {
          background: "transparent",
          minHeight: `${minHeight * 2}rpx`,
          width: "100%",
        },
        style
      )}
    />
  );
});
