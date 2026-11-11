import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { TextProps } from "../primitives/Text";

export type AttachmentState =
  | "idle"
  | "uploading"
  | "processing"
  | "error"
  | "done";
export type AttachmentSize = "default" | "sm" | "xs";
export interface AttachmentProps extends Omit<
  AnimatedPressableProps,
  "disabled"
> {
  state?: AttachmentState;
  size?: AttachmentSize;
  orientation?: "horizontal" | "vertical";
  progress?: number;
  disabled?: boolean;
}
export interface AttachmentGroupProps extends ComponentProps<typeof View> {
  orientation?: "horizontal" | "vertical";
}
export interface AttachmentMediaProps extends ComponentProps<typeof View> {
  variant?: "default" | "icon" | "image";
}
export type AttachmentContentProps = ComponentProps<typeof View>;
export type AttachmentTitleProps = TextProps;
export type AttachmentDescriptionProps = TextProps;
export type AttachmentActionsProps = ComponentProps<typeof View>;
export interface AttachmentActionProps extends AnimatedPressableProps {
  accessibilityLabel: string;
}
