import type { View } from "@tarojs/components";
import type { ComponentProps, AriaAttributes } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";

export type CompareOrientation = "horizontal" | "vertical";
export interface CompareProps extends ComponentProps<typeof View> {
  height?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  orientation?: CompareOrientation;
  disabled?: boolean;
  step?: number;
  haptics?: boolean;
  onLayout?: (layout: ElementLayout) => void;
}
export type CompareAfterProps = ComponentProps<typeof View>;
export type CompareBeforeProps = ComponentProps<typeof View>;
export interface CompareHandleProps
  extends ComponentProps<typeof View>, AriaAttributes {
  withGrip?: boolean;
  accessibilityLabel?: string;
}
export interface CompareLabelProps extends ComponentProps<typeof View> {
  side?: "start" | "end";
}
