import { View } from "@tarojs/components";
import { useMemo } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { THUMB_WIDTH } from "./math";
import { SliderGrip } from "./thumb";
import type { SliderProps } from "./types";
import { useSliderGesture } from "./use-gesture";
import type { SliderState } from "./use-state";
import { sliderVariants } from "./variants";

export const SliderTrack = ({
  props,
  state,
}: {
  props: SliderProps;
  state: SliderState;
}) => {
  const sign = useDirectionSign();
  const size = props.size ?? "md";
  const width = props.thumbSize ?? THUMB_WIDTH[size];
  const input = useMemo(
    () => ({ className: props.trackClassName, size }),
    [props.trackClassName, size]
  );
  const measured = useElementLayout(true, input, undefined, false);
  const travel = Math.max(
    (measured.layout?.width ?? 0) -
      (props.thumbPlacement === "centered" ? 0 : width),
    0
  );
  const gesture = useSliderGesture(state, {
    disabled: props.disabled ?? false,
    layout: measured.layout,
    minStepsBetweenThumbs: props.minStepsBetweenThumbs ?? 0,
    sign,
    thumbWidth: props.thumbPlacement === "centered" ? 0 : width,
  });
  const { active: _active, ...handlers } = gesture;
  const slots = sliderVariants({
    color: props.color,
    disabled: props.disabled,
    size: props.size,
  });
  const anchorStyle = sign === 1 ? { left: 0 } : { right: 0 };
  const fillSlot = slots.fill;
  const fillOptions = { className: props.fillClassName };
  // Changing catchMove during a gesture switches Taro native templates.
  return (
    <View
      id={measured.id}
      className={cn(
        "relative flex flex-col",
        slots.track({ className: props.trackClassName })
      )}
      style={{ overflow: "visible" }}
      {...handlers}
      catchMove={!props.disabled}
    >
      <View aria-hidden style={{ inset: "-32rpx", position: "absolute" }} />
      <View
        className={fillSlot(fillOptions)}
        style={{
          ...anchorStyle,
          pointerEvents: "none",
          transform: `translateX(${state.lowProgress * travel * sign * 2}rpx)`,
          width: `${((state.highProgress - state.lowProgress) * travel + (props.thumbPlacement === "centered" ? 0 : width)) * 2}rpx`,
        }}
      />
      {state.isRange ? (
        <SliderGrip
          state={state}
          props={props}
          thumb="low"
          width={width}
          travel={travel}
          sign={sign}
        />
      ) : null}
      <SliderGrip
        state={state}
        props={props}
        thumb="high"
        width={width}
        travel={travel}
        sign={sign}
      />
    </View>
  );
};
