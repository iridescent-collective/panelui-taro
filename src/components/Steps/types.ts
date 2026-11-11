import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

type ViewProps = ComponentProps<typeof View>;
type PressableProps = AnimatedPressableProps & {
  accessibilityValue?: { text?: string };
};
export type StepState = "active" | "completed" | "inactive" | "loading";
export type StepsOrientation = "horizontal" | "vertical";
export interface StepsProps extends ViewProps {
  className?: string;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: StepsOrientation;
  separators?: boolean;
  children?: ReactNode;
}
export interface StepsItemProps extends ViewProps {
  className?: string;
  step: number;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
}
export interface StepsTriggerProps extends PressableProps {
  className?: string;
  children?: ReactNode;
}
export interface StepsIndicatorProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
export interface StepsSeparatorProps extends ViewProps {
  className?: string;
}
