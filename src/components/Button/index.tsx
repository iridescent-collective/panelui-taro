import { Button as TaroButton } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef, ComponentProps, ReactNode } from "react";

import { IconColorProvider } from "../../icons/context";
import { resolveAccessibilityLabel } from "../../primitives/accessibility-label";
import { usePressFeedback } from "../../primitives/use-press-feedback";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren, textLabel } from "../primitives/Text";
import { Spinner } from "../Spinner";
import type { SpinnerProps } from "../Spinner";
import type { BUTTON_SIZE, BUTTON_VARIANT } from "./constants";
import {
  BUTTON_SPINNER_SIZE,
  BUTTON_CONTENT_TOKEN,
  BUTTON_HIT_SLOP,
} from "./constants";
import { ButtonGroupContext } from "./context";
import type { ButtonGroupContextValue as GroupContextValue } from "./context";
import { HitArea } from "./HitArea";
import { NativeButton } from "./NativeButton";
import { resolveButtonPresentation } from "./utils";

export const useButtonGroup = () => useContext(ButtonGroupContext);
export type ButtonGroupContextValue = GroupContextValue;
export type ButtonSize = keyof typeof BUTTON_SIZE;
export type ButtonVariant = keyof typeof BUTTON_VARIANT;
export const ButtonGroupProvider = ({
  value,
  children,
}: {
  value: ButtonGroupContextValue;
  children?: ReactNode;
}) => (
  <ButtonGroupContext.Provider value={value}>
    {children}
  </ButtonGroupContext.Provider>
);

export interface ButtonProps extends Omit<
  ComponentProps<typeof TaroButton>,
  "size" | "type" | "loading"
> {
  variant?: keyof typeof BUTTON_VARIANT;
  size?: keyof typeof BUTTON_SIZE;
  fullWidth?: boolean;
  loading?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  labelClassName?: string;
  spinnerProps?: Omit<SpinnerProps, "label">;
  onPress?: ComponentProps<typeof TaroButton>["onClick"];
  pressScale?: number;
  pressOpacity?: number;
  onPressIn?: ComponentProps<typeof TaroButton>["onTouchStart"];
  onPressOut?: ComponentProps<typeof TaroButton>["onTouchEnd"];
  native?: boolean;
  glass?: boolean;
  systemImage?: string;
  accessibilityLabel?: string;
  "aria-label"?: string;
  accessibilityState?: {
    busy?: boolean;
    disabled?: boolean;
    selected?: boolean;
    expanded?: boolean;
    checked?: boolean | "mixed";
  };
  hitSlop?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
}

const buttonAccessibility = (state: ButtonProps["accessibilityState"]) => ({
  "aria-checked": state?.checked,
  "aria-expanded": state?.expanded,
  "aria-selected": state?.selected,
});

export const Button = forwardRef<ComponentRef<typeof TaroButton>, ButtonProps>(
  (
    {
      variant,
      size,
      fullWidth,
      disabled,
      loading = false,
      startContent,
      endContent,
      labelClassName,
      spinnerProps,
      className,
      children,
      onPress,
      onClick,
      openType,
      onGetPhoneNumber,
      native,
      glass,
      systemImage,
      accessibilityLabel,
      accessibilityState,
      hitSlop,
      pressScale,
      pressOpacity,
      onPressIn,
      onPressOut,
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
      style,
      ...props
    }: ButtonProps,
    ref
  ) => {
    const group = useButtonGroup();
    const blocked = disabled || loading;
    const presentation = resolveButtonPresentation(
      { className, fullWidth, size, variant },
      group,
      blocked
    );
    const resolvedSize = presentation.size;
    const resolvedVariant = presentation.variant;
    const contentColor = useThemeToken(BUTTON_CONTENT_TOKEN[resolvedVariant]);
    const attached = !native && group?.attached === true;
    const feedback = usePressFeedback({
      className: presentation.className,
      disabled: blocked,
      id: props.id,
      onPressIn,
      onPressOut,
      onTouchCancel,
      onTouchEnd,
      onTouchStart,
      pressOpacity,
      pressScale: pressScale ?? (attached ? 1 : 0.97),
      style,
    });
    if (native) {
      return (
        <NativeButton
          {...props}
          ref={ref}
          native
          glass={glass}
          systemImage={systemImage}
          variant={resolvedVariant}
          size={resolvedSize}
          disabled={disabled}
          loading={loading}
          onPress={onPress}
          onClick={onClick}
          openType={openType}
          onGetPhoneNumber={onGetPhoneNumber}
          accessibilityLabel={accessibilityLabel}
          style={style}
        >
          {children}
        </NativeButton>
      );
    }
    const inset = hitSlop ?? (attached ? 0 : BUTTON_HIT_SLOP[resolvedSize]);
    return (
      <IconColorProvider color={contentColor}>
        <TaroButton
          ref={ref}
          {...props}
          aria-label={
            resolveAccessibilityLabel({ ...props, accessibilityLabel }) ??
            textLabel(children)
          }
          {...buttonAccessibility(accessibilityState)}
          aria-busy={loading}
          aria-disabled={blocked}
          disabled={blocked}
          openType={blocked ? undefined : openType}
          onGetPhoneNumber={blocked ? undefined : onGetPhoneNumber}
          onClick={blocked ? undefined : (onClick ?? onPress)}
          hoverClass={
            blocked ? "none" : (props.hoverClass ?? presentation.hoverClass)
          }
          className={presentation.className}
          onTouchStart={feedback.onTouchStart}
          onTouchEnd={feedback.onTouchEnd}
          onTouchCancel={feedback.onTouchCancel}
          id={feedback.id}
          style={feedback.mergedStyle}
        >
          {inset ? <HitArea inset={inset} /> : null}
          {loading ? (
            <Spinner
              size={BUTTON_SPINNER_SIZE[resolvedSize]}
              {...spinnerProps}
              className={presentation.slots.spinner({
                className: spinnerProps?.className,
              })}
            />
          ) : (
            textChildren(startContent)
          )}
          {textChildren(children, (value) => (
            <Text
              className={presentation.slots.label({
                className: labelClassName,
              })}
            >
              {value}
            </Text>
          ))}
          {textChildren(endContent)}
        </TaroButton>
      </IconColorProvider>
    );
  }
);
