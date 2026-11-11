import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ComponentProps } from "react";

import { useDirection } from "../../hooks/use-direction";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import type { PROGRESS_COLOR, PROGRESS_SIZE } from "./constants";
import { progressMotion } from "./motion";
import { progressRange, progressValueLabel } from "./utils";
import { progressVariants } from "./variants";

export interface ProgressProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  value?: number;
  minValue?: number;
  maxValue?: number;
  indeterminate?: boolean;
  indicatorClassName?: string;
  label?: string;
  showValueLabel?: boolean;
  valueLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
  headerClassName?: string;
  color?: keyof typeof PROGRESS_COLOR;
  size?: keyof typeof PROGRESS_SIZE;
}

export const Progress = forwardRef<ComponentRef<typeof View>, ProgressProps>(
  (
    {
      value = 0,
      minValue = 0,
      maxValue = 100,
      indeterminate = false,
      color = "primary",
      size = "md",
      label,
      showValueLabel = false,
      valueLabel,
      formatOptions,
      className,
      indicatorClassName,
      headerClassName,
      ...props
    }: ProgressProps,
    ref
  ) => {
    const { clamped, fraction } = progressRange(value, minValue, maxValue);
    const slots = progressVariants({ color, size });
    const reducedMotion = usePanelReducedMotion();
    const direction = useDirection();
    const motion = progressMotion(
      fraction,
      indeterminate,
      reducedMotion,
      direction
    );
    const displayValue = progressValueLabel(
      clamped,
      fraction,
      valueLabel,
      formatOptions
    );
    const hasLabel = label !== undefined && label !== null;
    const showValue = showValueLabel && !indeterminate;
    const track = (
      <View
        ref={ref}
        {...props}
        role="progressbar"
        aria-role="progressbar"
        aria-label={props.ariaLabel ?? label}
        aria-valuemin={indeterminate ? undefined : minValue}
        aria-valuemax={indeterminate ? undefined : maxValue}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : displayValue}
        aria-busy={indeterminate}
        className={slots.track({ className })}
      >
        <View
          aria-hidden
          className={cn(
            slots.indicator(),
            motion.className,
            indicatorClassName
          )}
          style={motion.style}
        />
      </View>
    );
    if (!hasLabel && !showValue) {
      return track;
    }
    return (
      <View className="flex w-full flex-col gap-[16px]">
        <View
          className={cn(
            "flex flex-row items-center justify-between",
            headerClassName
          )}
        >
          {hasLabel ? (
            <Text size="sm" weight="medium" className="truncate">
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showValue ? (
            <Text size="sm" muted className={cn(!hasLabel && "ms-auto")}>
              {displayValue}
            </Text>
          ) : null}
        </View>
        {track}
      </View>
    );
  }
);
