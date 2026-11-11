import { View } from "@tarojs/components";

import { Text } from "../primitives/Text";
import type { SliderProps } from "./types";
import type { SliderState } from "./use-state";
import { sliderVariants } from "./variants";

export const SliderHeader = ({
  props,
  state,
}: {
  props: SliderProps;
  state: SliderState;
}) => {
  if (!props.label && !props.showValue) {
    return null;
  }
  const slots = sliderVariants({
    color: props.color,
    disabled: props.disabled,
    size: props.size,
  });
  const print =
    props.formatValue ?? ((value: number) => String(Math.round(value)));
  const shown = state.isRange
    ? `${print(state.low)} – ${print(state.high)}`
    : print(state.value);
  return (
    <View className={slots.header({ className: props.headerClassName })}>
      {props.label ? (
        <Text className={slots.label()}>{props.label}</Text>
      ) : (
        <View />
      )}
      {props.showValue ? <Text className={slots.value()}>{shown}</Text> : null}
    </View>
  );
};
