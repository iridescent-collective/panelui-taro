import type { View } from "@tarojs/components";
import type { AriaAttributes, ComponentProps } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";

export type SplitViewVariant = "panes" | "seam";
export interface SplitViewProps extends ComponentProps<typeof View> {
  variant?: SplitViewVariant;
  snapPoints?: readonly number[];
  minHeight?: number;
  maxHeight?: number;
  defaultSnapIndex?: number;
  snapIndex?: number;
  onSnapIndexChange?: (index: number) => void;
  onSnap?: (index: number, topHeight: number) => void;
  disabled?: boolean;
  animateOnMount?: boolean;
  onLayout?: (layout: ElementLayout) => void;
}
export type SplitViewPaneProps = ComponentProps<typeof View>;
export type SplitViewHandleProps = ComponentProps<typeof View>;
export interface SplitViewDragAreaProps
  extends ComponentProps<typeof View>, AriaAttributes {
  accessibilityLabel?: string;
  onLayout?: (layout: ElementLayout) => void;
}
