import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { cn } from "../../lib/utils";
import type { SliderProps, SliderThumb } from "./types";
import type { SliderState } from "./use-state";
import { sliderVariants } from "./variants";

interface SliderThumbProps {
  state: SliderState;
  thumb: SliderThumb;
  props: SliderProps;
  width: number;
  travel: number;
  sign: number;
}
export const SliderGrip = ({
  state,
  thumb,
  props,
  width,
  travel,
  sign,
}: SliderThumbProps) => {
  const slots = sliderVariants({
    color: props.color,
    disabled: props.disabled,
    size: props.size,
  });
  const minimum = thumb === "low";
  const maximum = state.isRange ? state.high : state.value;
  const now = minimum ? state.low : maximum;
  const lowerBound = state.isRange ? Math.round(state.low) : state.min;
  const anchorStyle = sign === 1 ? { left: 0 } : { right: 0 };
  const print =
    props.formatValue ?? ((value: number) => String(Math.round(value)));
  let { label } = props;
  if (state.isRange) {
    const side = minimum ? "minimum" : "maximum";
    const fallback = minimum ? "Minimum" : "Maximum";
    label = props.label ? `${props.label}, ${side}` : fallback;
  }
  const latest = useRef({ props, state });
  latest.current = { props, state };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const adjust = async () => {
    const request = latest.current;
    if (request.props.disabled) {
      return;
    }
    try {
      const { tapIndex } = await showActionSheet({
        itemList: ["Increase value", "Decrease value"],
      });
      const owner = latest.current;
      if (
        !mounted.current ||
        owner.props.disabled ||
        owner.state.isRange !== request.state.isRange ||
        owner.state.low !== request.state.low ||
        owner.state.high !== request.state.high ||
        owner.state.value !== request.state.value ||
        (tapIndex !== 0 && tapIndex !== 1)
      ) {
        return;
      }
      owner.state.nudge(tapIndex === 0 ? 1 : -1, thumb);
    } catch {
      return false;
    }
  };
  return (
    <View
      role="slider"
      aria-role="adjustable"
      aria-label={label}
      aria-disabled={props.disabled ?? false}
      aria-valuemin={minimum ? state.min : lowerBound}
      aria-valuemax={minimum ? Math.round(state.high) : state.max}
      aria-valuenow={Math.round(now)}
      aria-valuetext={print(now)}
      aria-description="Touch and hold for value actions."
      onLongPress={adjust}
      className={cn(
        "flex flex-col",
        slots.thumb({ className: props.thumbClassName })
      )}
      style={{
        ...anchorStyle,
        transform: `translateX(${(minimum ? state.lowProgress : state.highProgress) * travel * sign * 2 - (props.thumbPlacement === "centered" ? width * sign : 0)}rpx)`,
        width: `${width * 2}rpx`,
      }}
    >
      <View
        className={slots.knob({ className: props.knobClassName })}
        style={{
          pointerEvents: "none",
          transform: `scale(${1 - (minimum ? state.lowKnob : state.highKnob) * 0.14})`,
        }}
      />
    </View>
  );
};
