import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ComponentProps, CSSProperties } from "react";

import { useDirection, useDirectionSign } from "../../hooks/use-direction";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { selectionTick } from "../../lib/haptics";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useFieldLabelledBy } from "../Field";
import { NativeSwitchControl } from "./native-control";
import { switchVariants } from "./variants";

export type SwitchSize = "xs" | "sm" | "md" | "lg" | "xl";
export interface SwitchProps extends Omit<
  ComponentProps<typeof View>,
  "onChange"
> {
  thumbClassName?: string;
  activeTrackClassName?: string;
  thumbStyle?: CSSProperties;
  className?: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  native?: boolean;
  label?: string;
  haptics?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLabelledBy?: string | string[];
}
const TRAVEL: Record<SwitchSize, number> = {
  lg: 24,
  md: 20,
  sm: 16,
  xl: 28,
  xs: 12,
};
const HIT_SLOP: Record<
  SwitchSize,
  {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }
> = {
  lg: { bottom: 8, left: 0, right: 0, top: 8 },
  md: { bottom: 10, left: 0, right: 0, top: 10 },
  sm: { bottom: 12, left: 4, right: 4, top: 12 },
  xl: { bottom: 6, left: 0, right: 0, top: 6 },
  xs: { bottom: 14, left: 8, right: 8, top: 14 },
};
export const Switch = forwardRef<ComponentRef<typeof View>, SwitchProps>(
  (
    {
      className,
      value,
      onValueChange,
      disabled,
      size = "md",
      native,
      label,
      haptics,
      accessibilityLabel,
      accessibilityHint,
      accessibilityLabelledBy,
      thumbClassName,
      activeTrackClassName,
      thumbStyle,
      onClick,
      ...hostProps
    },
    ref
  ) => {
    const direction = useDirection();
    const sign = useDirectionSign();
    const reducedMotion = usePanelReducedMotion();
    const field = useFieldLabelledBy();
    const labelledBy =
      accessibilityLabelledBy ??
      (accessibilityLabel || label ? undefined : field);
    const slots = switchVariants({ disabled: !!disabled, size });
    const name = accessibilityLabel ?? label;
    const transition = reducedMotion
      ? "none"
      : "transform 220ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease-out";
    if (native) {
      return (
        <View ref={ref}>
          <NativeSwitchControl
            value={value}
            disabled={disabled}
            label={name}
            labelledBy={
              Array.isArray(labelledBy) ? labelledBy.join(" ") : labelledBy
            }
            onValueChange={onValueChange}
          />
        </View>
      );
    }
    return (
      <AnimatedPressable
        {...hostProps}
        ref={ref}
        pressScale={1}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={name}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ checked: value, disabled: !!disabled }}
        aria-labelledby={
          Array.isArray(labelledBy) ? labelledBy.join(" ") : labelledBy
        }
        hitSlop={HIT_SLOP[size]}
        onPress={async (event) => {
          onClick?.(event);
          onValueChange?.(!value);
          if (haptics) {
            await selectionTick();
          }
        }}
      >
        <View
          className={slots.track({
            className: `relative flex flex-col items-start ${className ?? ""}`,
          })}
          style={{ direction }}
        >
          <View
            aria-hidden
            className={slots.activeTrack({ className: activeTrackClassName })}
            style={{ opacity: value ? 1 : 0, transition }}
          />
          <View
            aria-hidden
            className={slots.thumb({
              className: `relative shrink-0 ${thumbClassName ?? ""}`,
            })}
            style={{
              transform: `translateX(${value ? TRAVEL[size] * sign * 2 : 0}rpx)`,
              transition,
              ...thumbStyle,
            }}
          />
        </View>
      </AnimatedPressable>
    );
  }
);
Switch.displayName = "Switch";
