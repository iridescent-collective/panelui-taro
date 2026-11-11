import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ComponentProps, ReactNode } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { CheckIcon, MinusIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { isolateLabelLinks } from "./label-links";
import { checkboxVariants } from "./variants";

export type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";
export interface CheckboxProps extends ComponentProps<typeof View> {
  boxClassName?: string;
  fillClassName?: string;
  indicator?: ReactNode;
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: CheckboxSize;
  variant?: "default" | "card";
  label?: ReactNode;
  contentClassName?: string;
  accessibilityLabel?: string;
  "aria-label"?: string;
  hitSlop?: AnimatedPressableProps["hitSlop"];
  description?: string;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  onCheckedChange?: (value: boolean) => void;
}
const GLYPH_SIZE: Record<CheckboxSize, number> = {
  lg: 14,
  md: 12,
  sm: 10,
  xl: 16,
  xs: 8,
};

const checkboxAccessibleLabel = (
  label: ReactNode,
  accessibilityLabel?: string,
  ariaLabel?: string
) =>
  accessibilityLabel ??
  ariaLabel ??
  (typeof label === "string" ? label : undefined);

export const Checkbox = forwardRef<ComponentRef<typeof View>, CheckboxProps>(
  (
    {
      checked,
      indeterminate,
      disabled,
      size = "md",
      variant,
      label,
      description,
      className,
      labelClassName,
      contentClassName,
      accessibilityLabel,
      "aria-label": ariaLabel,
      hitSlop,
      descriptionClassName,
      onCheckedChange,
      boxClassName,
      fillClassName,
      indicator,
      onClick,
      ...hostProps
    },
    ref
  ) => {
    const on = checked || !!indeterminate;
    const reducedMotion = usePanelReducedMotion();
    const color = useThemeToken("primary-foreground");
    const slots = checkboxVariants({
      checked: on,
      disabled: !!disabled,
      size,
      variant,
    });
    let transition = on
      ? "opacity 180ms ease-out, transform 220ms cubic-bezier(0.22,1,0.36,1)"
      : "opacity 120ms ease, transform 120ms ease";
    if (reducedMotion) {
      transition = "none";
    }
    const fillSlot = slots.fill;
    const box = (
      <View
        className={`${slots.box({ className: boxClassName })} relative flex shrink-0`}
      >
        <View
          aria-hidden
          className={`${fillSlot({ className: fillClassName })} flex`}
          style={{
            opacity: on ? 1 : 0,
            transform: `scale(${on ? 1 : 0.6})`,
            transition,
          }}
        >
          {indicator ??
            (indeterminate ? (
              <MinusIcon size={GLYPH_SIZE[size]} color={color} />
            ) : (
              <CheckIcon size={GLYPH_SIZE[size]} color={color} />
            ))}
        </View>
      </View>
    );
    return (
      <AnimatedPressable
        {...hostProps}
        unstyled
        hitSlop={hitSlop}
        ref={ref}
        role="checkbox"
        aria-role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        aria-disabled={!!disabled}
        aria-label={checkboxAccessibleLabel(
          label,
          accessibilityLabel,
          ariaLabel
        )}
        aria-description={description}
        onClick={
          disabled
            ? undefined
            : (event) => {
                onClick?.(event);
                onCheckedChange?.(indeterminate ? true : !checked);
              }
        }
        className={cn(
          { relative: hitSlop },
          slots.row({
            className:
              description && variant !== "card"
                ? `items-start ${className ?? ""}`
                : className,
          })
        )}
      >
        {variant === "card" ? null : box}
        {label || description ? (
          <View
            className={cn(
              "flex flex-col",
              slots.content({ className: contentClassName })
            )}
          >
            {label ? (
              <Text className={slots.label({ className: labelClassName })}>
                {isolateLabelLinks(label)}
              </Text>
            ) : null}
            {description ? (
              <Text
                className={slots.description({
                  className: descriptionClassName,
                })}
              >
                {description}
              </Text>
            ) : null}
          </View>
        ) : null}
        {variant === "card" ? box : null}
      </AnimatedPressable>
    );
  }
);
Checkbox.displayName = "Checkbox";
