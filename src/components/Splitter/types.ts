import type { View } from "@tarojs/components";
import type { AriaAttributes, ComponentProps } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";

export type SplitterOrientation = "horizontal" | "vertical";
export interface SplitterProps extends ComponentProps<typeof View> {
  orientation?: SplitterOrientation;
  layout?: number[];
  defaultLayout?: number[];
  onLayoutChange?: (layout: number[]) => void;
  disabled?: boolean;
  step?: number;
  onLayout?: (layout: ElementLayout) => void;
}
export interface SplitterPanelProps extends ComponentProps<typeof View> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
}
export interface SplitterHandleProps
  extends ComponentProps<typeof View>, AriaAttributes {
  disabled?: boolean;
  withGrip?: boolean;
  accessibilityLabel?: string;
}
