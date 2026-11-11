import type { View } from "@tarojs/components";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import type { PopoverContentProps } from "../Popover/types";
import type { TextProps } from "../primitives/Text";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "start" | "center" | "end";
export type TooltipVariant = "inverted" | "surface";
export type TooltipOpenOn = "longPress" | "press";
export interface TooltipProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  openOn?: TooltipOpenOn;
  duration?: number;
  label?: string;
}
export interface TooltipTarget {
  onClick?: ComponentProps<typeof View>["onClick"];
  onPress?: ComponentProps<typeof View>["onClick"];
  onLongPress?: ComponentProps<typeof View>["onLongPress"];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  "aria-label"?: string;
}
export interface TooltipTriggerProps {
  className?: string;
  children: ReactElement<TooltipTarget>;
}
export interface TooltipContentProps extends Omit<
  PopoverContentProps,
  | "dismissible"
  | "blur"
  | "scrim"
  | "scrimClassName"
  | "unstyled"
  | "background"
> {
  variant?: TooltipVariant;
}
export type TooltipArrowProps = ComponentProps<typeof View>;
export type TooltipTitleProps = TextProps;
export type TooltipDescriptionProps = TextProps;
