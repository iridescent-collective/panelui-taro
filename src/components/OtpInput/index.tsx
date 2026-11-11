import { Input as NativeInput, View } from "@tarojs/components";
import { forwardRef } from "react";

import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { hiddenInputStyle } from "../../primitives/hidden-input-style";
import type { InputHandle } from "../Input/types";
import { Text } from "../primitives/Text";
import { OtpCell } from "./cell";
import { normalizeOtpLength } from "./state";
import type { OtpInputProps } from "./types";
import { useOtp } from "./use-otp";
import { otpVariants } from "./variants";

export type { OtpInputProps, OtpInputSize } from "./types";
export const OtpInput = forwardRef<InputHandle, OtpInputProps>(
  (
    {
      className,
      cellClassName,
      length: lengthProp = 6,
      value,
      defaultValue,
      onChangeText,
      onComplete,
      type = "numeric",
      mask = false,
      placeholder,
      groupEvery = 0,
      size,
      disabled,
      editable,
      isInvalid,
      errorMessage,
      accessibilityLabel,
      onFocus,
      onBlur,
      onInput,
      style,
      focus,
      ...props
    },
    ref
  ) => {
    const length = normalizeOtpLength(lengthProp);
    const state = useOtp(
      {
        defaultValue,
        disabled,
        editable,
        focus,
        id: props.id,
        onBlur,
        onChangeText,
        onComplete,
        onFocus,
        onInput,
        value,
      },
      length,
      type,
      ref
    );
    const slots = otpVariants({ disabled: !!disabled, size });
    const invalid = Boolean(isInvalid || errorMessage);
    const activeIndex = Math.min(state.value.length, length - 1);
    return (
      <View className={cn("flex flex-col", slots.container({ className }))}>
        <View className="relative" onClick={state.focus}>
          <View aria-hidden className={cn("flex", slots.row())}>
            {Array.from({ length }, (_, index) => (
              <View
                key={`cell-${index}`}
                className="flex flex-row items-center"
              >
                <OtpCell
                  char={state.value[index] ?? ""}
                  active={index === activeIndex}
                  focused={state.focused}
                  mask={mask}
                  placeholder={placeholder}
                  invalid={invalid}
                  className={cn(
                    "flex",
                    slots.cell({
                      className: cn(index > 0 && "ms-[16px]", cellClassName),
                    })
                  )}
                  charClassName={slots.char()}
                  caretClassName={slots.caret()}
                />
                {groupEvery > 0 &&
                  (index + 1) % groupEvery === 0 &&
                  index < length - 1 && (
                    <View className={cn(slots.separator(), "ms-[16px]")} />
                  )}
              </View>
            ))}
          </View>
          <NativeInput
            {...props}
            ref={state.native}
            value={state.value}
            type={type === "numeric" ? "number" : "text"}
            maxlength={length}
            disabled={state.blocked}
            focus={state.focusRequested}
            aria-label={accessibilityLabel ?? props["aria-label"]}
            aria-disabled={!!disabled}
            aria-invalid={invalid}
            cursor={state.value.length}
            onInput={state.onInput}
            onFocus={state.onFocus}
            onBlur={state.onBlur}
            style={mergeStyleAfter(style, hiddenInputStyle)}
          />
        </View>
        {errorMessage && <Text className={slots.error()}>{errorMessage}</Text>}
      </View>
    );
  }
);
