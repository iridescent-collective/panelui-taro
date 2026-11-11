import type { View } from "@tarojs/components";
import type { AriaAttributes, ComponentProps } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { TextProps } from "../primitives/Text";

export type MarkerVariant = "default" | "border" | "separator";
export interface MarkerProps extends AnimatedPressableProps, AriaAttributes {
  variant?: MarkerVariant;
}
export type MarkerIconProps = ComponentProps<typeof View>;
export interface MarkerContentProps extends TextProps {
  shimmer?: boolean;
}
