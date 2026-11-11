import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useDirection } from "../../hooks/use-direction";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { Text } from "../primitives/Text";
import {
  colorFor,
  litSegments,
  meterSemantics,
  normalizeScale,
  normalizeSegments,
} from "./meter-scale";
import type { MeterProps } from "./types";
import { meterVariants } from "./variants";

export type { MeterProps } from "./types";
export type { MeterColor, MeterThreshold } from "./meter-scale";
const SEGMENT_DURATION = 180;
const SEGMENT_UNLIT = 0.22;
export const Meter = forwardRef<ComponentRef<typeof View>, MeterProps>(
  (
    {
      className,
      indicatorClassName,
      headerClassName,
      value,
      minValue = 0,
      maxValue = 100,
      label,
      showValueLabel = false,
      valueLabel,
      formatOptions,
      thresholds,
      segments,
      color = "primary",
      size = "md",
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const scale = normalizeScale(value, minValue, maxValue);
    const count = normalizeSegments(segments);
    const slots = meterVariants({
      color: colorFor(scale.value, color, thresholds),
      size,
    });
    const reducedMotion = usePanelReducedMotion();
    const direction = useDirection();
    const lit = litSegments(scale.fraction, count);
    const semantics = meterSemantics({
      accessibilityLabel: accessibilityLabel ?? props.ariaLabel,
      formatOptions,
      fraction: scale.fraction,
      label,
      maxValue: scale.max,
      minValue: scale.min,
      value: scale.value,
      valueLabel,
    });
    const accessibility = {
      "aria-label": semantics.label,
      "aria-role": "progressbar",
      "aria-valuemax": scale.max,
      "aria-valuemin": scale.min,
      "aria-valuenow": scale.value,
      "aria-valuetext": semantics.text,
      role: "progressbar",
    } as const;
    const bar =
      count > 0 ? (
        <View
          {...props}
          ref={ref}
          {...accessibility}
          className={slots.segments({ className })}
        >
          {Array.from({ length: count }, (_, index) => (
            <View
              key={`segment-${index}`}
              aria-hidden
              className={slots.segment({ className: indicatorClassName })}
              style={{
                opacity: index < lit ? 1 : SEGMENT_UNLIT,
                transition: reducedMotion
                  ? "none"
                  : `opacity ${SEGMENT_DURATION}ms ease`,
              }}
            />
          ))}
        </View>
      ) : (
        <View
          {...props}
          ref={ref}
          {...accessibility}
          className={slots.track({ className })}
        >
          <View
            aria-hidden
            className={slots.indicator({ className: indicatorClassName })}
            style={{
              float: direction === "rtl" ? "right" : "left",
              transition: reducedMotion
                ? "none"
                : "width 400ms cubic-bezier(0.22,1,0.36,1)",
              width: `${scale.fraction * 100}%`,
            }}
          />
        </View>
      );
    if (label === undefined && !showValueLabel) {
      return bar;
    }
    return (
      <View className={slots.root({ className: "flex flex-col" })}>
        <View
          aria-hidden
          className={slots.header({ className: headerClassName })}
        >
          {label === undefined ? (
            <View />
          ) : (
            <Text size="sm" weight="medium" numberOfLines={1}>
              {label}
            </Text>
          )}
          {showValueLabel ? (
            <Text size="sm" muted numberOfLines={1}>
              {semantics.text}
            </Text>
          ) : null}
        </View>
        {bar}
      </View>
    );
  }
);
