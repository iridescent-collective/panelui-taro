import { Button as TaroButton } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../../icons/context";
import { resolveAccessibilityLabel } from "../../../primitives/accessibility-label";
import type { ButtonProps } from "../index";

export const NativeButton = forwardRef<
  ComponentRef<typeof TaroButton>,
  ButtonProps
>(
  (
    {
      native: _native,
      glass: _glass,
      systemImage: _systemImage,
      fullWidth: _fullWidth,
      startContent: _start,
      endContent: _end,
      spinnerProps: _spinner,
      labelClassName: _labelClassName,
      pressScale: _scale,
      pressOpacity: _opacity,
      onPressIn: _in,
      onPressOut: _out,
      accessibilityLabel,
      accessibilityState: _state,
      hitSlop: _hitSlop,
      variant = "primary",
      size = "md",
      disabled,
      loading,
      onPress,
      onClick,
      openType,
      onGetPhoneNumber,
      children,
      className: _className,
      ...props
    },
    ref
  ) => {
    const blocked = disabled || loading;
    const prominent = variant === "primary" || variant === "destructive";
    let type: "warn" | "primary" | "default" = prominent
      ? "primary"
      : "default";
    if (variant === "destructive") {
      type = "warn";
    }
    return (
      <IconColorProvider color={prominent ? "#ffffff" : undefined}>
        <TaroButton
          {...props}
          ref={ref}
          className="panelui-button-native"
          size={size === "xs" || size === "sm" ? "mini" : "default"}
          type={type}
          plain={variant === "outline"}
          disabled={blocked}
          aria-label={resolveAccessibilityLabel({
            ...props,
            accessibilityLabel,
          })}
          onClick={blocked ? undefined : (onClick ?? onPress)}
          openType={blocked ? undefined : openType}
          onGetPhoneNumber={blocked ? undefined : onGetPhoneNumber}
        >
          {children}
        </TaroButton>
      </IconColorProvider>
    );
  }
);
