import type { View } from "@tarojs/components";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import type { DialogActionTarget } from "../Dialog/types";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";
export type PopoverPresentation = "popover" | "bottom-sheet";
export interface PopoverAnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PopoverAnchorControls {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorTo: (rect: PopoverAnchorRect) => void;
}
export interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  presentation?: PopoverPresentation;
  native?: boolean;
}
export interface PopoverTriggerProps {
  children: ReactElement<DialogActionTarget>;
}
export type PopoverCloseProps = PopoverTriggerProps;
export type PopoverArrowProps = ComponentProps<typeof View>;
export interface PopoverContentProps extends ComponentProps<typeof View> {
  "aria-role"?: string;
  accessibilityRole?: string;
  modal?: boolean;
  dismissLabel?: string | false;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  offset?: number;
  alignOffset?: number;
  width?: number | "trigger" | "full" | "content-fit";
  minWidth?: number;
  maxHeight?: number;
  /** Stop the entry spring at its target instead of bouncing past it. */
  overshootClamping?: boolean;
  scrollable?: boolean;
  unstyled?: boolean;
  background?: ReactNode;
  dismissible?: boolean;
  blur?: boolean;
  scrim?: boolean;
  scrimClassName?: string;
  onLayout?: (event: {
    nativeEvent: {
      layout: { x: number; y: number; width: number; height: number };
    };
  }) => void;
}
