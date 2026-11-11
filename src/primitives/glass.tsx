import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentProps, ComponentRef } from "react";

import { mergeStyle } from "../lib/styles";
import { cn } from "../lib/utils";

export type GlassVariant = "regular" | "clear";
export type GlassRadius = number | { top?: number; bottom?: number };
export const hasGlass = false;
export const useGlassMaterial = () => false;
export interface GlassProps extends ComponentProps<typeof View> {
  variant?: GlassVariant;
  tint?: string;
  radius?: GlassRadius;
  interactive?: boolean;
  fallbackClassName?: string;
}
export const Glass = forwardRef<ComponentRef<typeof View>, GlassProps>(
  (
    {
      variant: _variant,
      tint: _tint,
      radius,
      interactive: _interactive,
      fallbackClassName = "bg-[var(--panel-card)]",
      className,
      style,
      ...props
    },
    ref
  ) => {
    const shape =
      typeof radius === "number"
        ? { borderRadius: `${radius * 2}rpx` }
        : radius
          ? {
              borderBottomLeftRadius: `${(radius.bottom ?? 0) * 2}rpx`,
              borderBottomRightRadius: `${(radius.bottom ?? 0) * 2}rpx`,
              borderTopLeftRadius: `${(radius.top ?? 0) * 2}rpx`,
              borderTopRightRadius: `${(radius.top ?? 0) * 2}rpx`,
            }
          : {};
    return (
      <View
        {...props}
        ref={ref}
        className={cn("overflow-hidden", fallbackClassName, className)}
        style={mergeStyle(shape, style)}
      />
    );
  }
);
export interface GlassContainerProps extends ComponentProps<typeof View> {
  spacing?: number;
}
export const GlassContainer = forwardRef<
  ComponentRef<typeof View>,
  GlassContainerProps
>(({ spacing: _spacing, ...props }, ref) => <View {...props} ref={ref} />);
