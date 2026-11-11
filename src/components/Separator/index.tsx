import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ComponentProps, CSSProperties } from "react";

import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";

export interface SeparatorProps extends Omit<
  ComponentProps<typeof View>,
  "style"
> {
  orientation?: "horizontal" | "vertical";
  variant?: "thin" | "thick";
  thickness?: number;
  decorative?: boolean;
  labelClassName?: string;
  style?: CSSProperties;
}

export const Separator = forwardRef<ComponentRef<typeof View>, SeparatorProps>(
  (
    {
      orientation = "horizontal",
      variant = "thin",
      thickness,
      decorative = true,
      children,
      className,
      labelClassName,
      style,
      ...props
    }: SeparatorProps,
    ref
  ) => {
    const horizontal = orientation === "horizontal";
    const labelled =
      horizontal &&
      children !== null &&
      children !== undefined &&
      children !== false;
    const ruleClass = cn(
      "bg-[var(--panel-border)]",
      horizontal
        ? cn("w-full", variant === "thick" ? "h-[8px]" : "h-[2px]")
        : cn("h-full", variant === "thick" ? "w-[8px]" : "w-[2px]")
    );
    const thicknessStyle =
      thickness === undefined
        ? undefined
        : { [horizontal ? "height" : "width"]: `${thickness * 2}rpx` };
    if (labelled) {
      return (
        <View
          ref={ref}
          {...props}
          role="separator"
          aria-role="separator"
          aria-orientation="horizontal"
          className={cn(
            "flex w-full flex-row items-center gap-[24px]",
            className
          )}
          style={style}
        >
          <View
            aria-hidden
            className={cn(ruleClass, "flex-1")}
            style={thicknessStyle}
          />
          {textChildren(children, (value) => (
            <Text size="xs" muted className={labelClassName}>
              {value}
            </Text>
          ))}
          <View
            aria-hidden
            className={cn(ruleClass, "flex-1")}
            style={thicknessStyle}
          />
        </View>
      );
    }
    return (
      <View
        ref={ref}
        {...props}
        role={decorative ? undefined : "separator"}
        aria-role={decorative ? undefined : "separator"}
        aria-hidden={decorative}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(ruleClass, className)}
        style={{ ...style, ...thicknessStyle }}
      />
    );
  }
);
