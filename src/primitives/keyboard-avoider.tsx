import { View } from "@tarojs/components";
import { useEffect } from "react";
import type { ComponentProps } from "react";

import { textChildren } from "../components/primitives/Text";
import { useKeyboardAvoidance } from "../hooks/use-keyboard-avoidance";
import type { UseKeyboardAvoidanceOptions } from "../hooks/use-keyboard-avoidance";

export interface KeyboardAvoiderProps
  extends ComponentProps<typeof View>, UseKeyboardAvoidanceOptions {
  onLayout?: (event: {
    nativeEvent: {
      layout: { x: number; y: number; width: number; height: number };
    };
  }) => void;
}
export const KeyboardAvoider = ({
  enabled,
  active,
  mode,
  offset,
  bottomInset,
  children,
  style,
  onLayout,
  ...props
}: KeyboardAvoiderProps) => {
  const avoidance = useKeyboardAvoidance({
    active,
    bottomInset,
    enabled,
    id: props.id,
    mode,
    offset,
  });
  useEffect(() => {
    if (avoidance.layout) {
      const { left, top, width, height } = avoidance.layout;
      onLayout?.({
        nativeEvent: { layout: { height, width, x: left, y: top } },
      });
    }
  }, [avoidance.layout, onLayout]);
  return (
    <View
      {...props}
      id={avoidance.id}
      style={
        typeof style === "string"
          ? `${style};transform:${avoidance.animatedStyle.transform};transition:${avoidance.animatedStyle.transition};`
          : { ...style, ...avoidance.animatedStyle }
      }
    >
      {textChildren(children)}
    </View>
  );
};
