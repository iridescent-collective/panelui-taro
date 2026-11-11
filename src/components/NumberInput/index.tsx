import { Input as NativeInput, View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useInputFocusOwner } from "../../primitives/input-focus";
import { Label } from "../Label";
import { Text } from "../primitives/Text";
import { precisionOf } from "./number-input-math";
import { StepButton } from "./step-button";
import type { NumberInputProps } from "./types";
import { useNumberRepeat } from "./use-number-repeat";
import { useNumberValue } from "./use-number-value";
import { numberInputVariants } from "./variants";

export type { NumberInputProps } from "./types";
const ICON_SIZE = { lg: 20, md: 18, sm: 16 };
const FONT_SIZE = { lg: "32rpx", md: "32rpx", sm: "28rpx" };
export const NumberInput = forwardRef<
  ComponentRef<typeof NativeInput>,
  NumberInputProps
>((props, ref) => {
  const focusOwner = useInputFocusOwner(props.id);
  const {
    className,
    containerClassName,
    min = -Infinity,
    max = Infinity,
    step = 1,
    variant = "outline",
    size = "md",
    editable = true,
    disabled,
    label,
    description,
    errorMessage,
    isRequired,
    placeholder,
    onFocus,
    onBlur,
    returnKeyType,
    id,
    name,
    onInput,
    onConfirm,
    adjustPosition,
    cursorSpacing,
  } = props;
  const model = useNumberValue(props);
  const repeat = useNumberRepeat(model.valueRef, model.commit, {
    disabled,
    max,
    min,
    step,
  });
  const invalid = Boolean(errorMessage);
  const slots = numberInputVariants({
    disabled: Boolean(disabled),
    invalid,
    size,
    variant,
  });
  const feedback = errorMessage ? (
    <Text className={slots.error()}>{errorMessage}</Text>
  ) : (
    <Text className={slots.description()}>{description}</Text>
  );
  return (
    <View
      className={slots.container({
        className: `flex flex-col ${containerClassName ?? ""}`,
      })}
    >
      {label ? (
        <Label
          isRequired={isRequired}
          isInvalid={invalid}
          isDisabled={Boolean(disabled)}
        >
          {label}
        </Label>
      ) : null}
      <View className={slots.control({ className })}>
        <StepButton
          direction={-1}
          label={label}
          disabled={disabled}
          bound={model.value <= min}
          iconSize={ICON_SIZE[size]}
          className={slots.button({ className: "flex flex-col" })}
          {...repeat}
        />
        <NativeInput
          ref={ref}
          id={id}
          name={name}
          disabled={!editable || disabled}
          value={model.text}
          type={precisionOf(step) > 0 ? "digit" : "number"}
          placeholder={placeholder}
          confirmType={returnKeyType}
          adjustPosition={adjustPosition}
          cursorSpacing={cursorSpacing}
          aria-label={label}
          aria-disabled={Boolean(disabled)}
          aria-required={isRequired}
          aria-invalid={invalid}
          className={slots.field({ className: "min-w-0 box-border" })}
          style={{
            fontSize: FONT_SIZE[size],
            fontVariantNumeric: "tabular-nums",
            padding: 0,
          }}
          onInput={(event) => {
            model.setText(event.detail.value);
            return onInput?.(event);
          }}
          onFocus={(event) => {
            focusOwner.claim();
            model.setFocused(true);
            onFocus?.(event);
          }}
          onBlur={async (event) => {
            focusOwner.release();
            await model.endEditing();
            onBlur?.(event);
          }}
          onConfirm={async (event) => {
            await model.endEditing();
            onConfirm?.(event);
          }}
        />
        <StepButton
          direction={1}
          label={label}
          disabled={disabled}
          bound={model.value >= max}
          iconSize={ICON_SIZE[size]}
          className={slots.button({ className: "flex flex-col" })}
          {...repeat}
        />
      </View>
      {errorMessage || description ? feedback : null}
    </View>
  );
});
