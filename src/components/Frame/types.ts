import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export type FrameVariant = "default" | "plain" | "inset";
export type FrameProps = ComponentProps<typeof View>;
export interface FrameRootProps extends FrameProps {
  variant?: FrameVariant;
}
export type FrameHeaderProps = FrameProps;
export type FrameActionProps = FrameProps;
export type FrameMediaProps = FrameProps;
export type FrameContentProps = FrameProps;
export type FrameActionsProps = FrameProps;
export interface FramePanelProps extends FrameProps {
  dividers?: boolean;
}
export interface FrameRowProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  divided?: boolean;
  chevron?: boolean;
  wrap?: boolean;
  align?: "center" | "start";
  children?: ReactNode;
}
export interface FrameSectionProps extends FrameProps {
  divided?: boolean;
  title?: ReactNode;
}
export type FrameFooterProps = FrameProps;
