import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentProps, ComponentRef } from "react";

import { cn } from "../lib/utils";
import { resolvePressableAccessibility } from "./pressable-accessibility";
import { usePressFeedback } from "./use-press-feedback";
import type { PressFeedbackOptions } from "./use-press-feedback";

type ViewTouchEvent = Parameters<
  NonNullable<ComponentProps<typeof View>["onTouchStart"]>
>[0];
export interface AnimatedPressableProps
  extends ComponentProps<typeof View>, PressFeedbackOptions<ViewTouchEvent> {
  unstyled?: boolean;
  onPress?: ComponentProps<typeof View>["onClick"];
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    checked?: boolean | "mixed";
    selected?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  hitSlop?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
}

export const AnimatedPressable = forwardRef<
  ComponentRef<typeof View>,
  AnimatedPressableProps
>(
  (
    {
      unstyled = false,
      pressScale,
      pressOpacity,
      disabled,
      onPressIn,
      onPressOut,
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
      onPress,
      onClick,
      accessibilityRole,
      accessibilityLabel,
      accessibilityHint,
      accessibilityState,
      hitSlop,
      style,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const feedback = usePressFeedback({
      className,
      disabled,
      id: props.id,
      onPressIn,
      onPressOut,
      onTouchCancel,
      onTouchEnd,
      onTouchStart,
      pressOpacity,
      pressScale,
      style,
    });
    const edges =
      typeof hitSlop === "number"
        ? { bottom: hitSlop, left: hitSlop, right: hitSlop, top: hitSlop }
        : hitSlop;
    return (
      <View
        {...props}
        ref={ref}
        className={cn(!unstyled && "relative", className)}
        {...resolvePressableAccessibility(props, {
          disabled,
          hint: accessibilityHint,
          label: accessibilityLabel,
          role: accessibilityRole,
          state: accessibilityState,
        })}
        onClick={disabled ? undefined : (onClick ?? onPress)}
        onTouchStart={feedback.onTouchStart}
        onTouchEnd={feedback.onTouchEnd}
        onTouchCancel={feedback.onTouchCancel}
        id={feedback.id}
        style={unstyled ? style : feedback.mergedStyle}
      >
        {edges ? (
          <View
            aria-hidden
            style={{
              bottom: `${-(edges.bottom ?? 0) * 2}rpx`,
              left: `${-(edges.left ?? 0) * 2}rpx`,
              position: "absolute",
              right: `${-(edges.right ?? 0) * 2}rpx`,
              top: `${-(edges.top ?? 0) * 2}rpx`,
            }}
          />
        ) : null}
        {children}
      </View>
    );
  }
);
AnimatedPressable.displayName = "AnimatedPressable";
