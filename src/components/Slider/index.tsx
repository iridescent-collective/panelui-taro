import { Slider as WeChatSlider, View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { SliderHeader } from "./header";
import { SliderTrack } from "./track";
import type { SliderProps } from "./types";
import { useSliderState } from "./use-state";
import { sliderVariants } from "./variants";

export type { SliderProps } from "./types";
export const Slider = forwardRef<ComponentRef<typeof View>, SliderProps>(
  (props, ref) => {
    const reduced = usePanelReducedMotion();
    const state = useSliderState(props, reduced);
    const native =
      props.native &&
      !state.isRange &&
      Number.isInteger(state.min) &&
      Number.isInteger(state.max) &&
      Number.isInteger(state.step) &&
      state.step > 0 &&
      state.step <= state.max - state.min;
    const slots = sliderVariants({
      color: props.color,
      disabled: props.disabled,
      size: props.size,
    });
    return (
      <View
        ref={ref}
        className={cn(
          "flex flex-col",
          slots.root({ className: props.className })
        )}
      >
        <SliderHeader props={props} state={state} />
        {native ? (
          <View
            className="flex w-full items-center"
            style={{ height: "88rpx" }}
          >
            <WeChatSlider
              min={state.min}
              max={state.max}
              step={state.step}
              value={state.value}
              disabled={props.disabled}
              style={{ width: "100%" }}
              onChanging={(event) =>
                state.nativeChange(event.detail.value, false)
              }
              onChange={(event) => state.nativeChange(event.detail.value, true)}
            />
          </View>
        ) : (
          <SliderTrack props={props} state={state} />
        )}
      </View>
    );
  }
);
Slider.displayName = "Slider";
