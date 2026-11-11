import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { MenuProps, MenuContentProps, MenuItemProps } from "../Menu";
import type { ContextMenuKeyDownEvent } from "./invocation";

export type ContextMenuProps = MenuProps;
export type ContextMenuAnchor = "point" | "target";
export interface ContextMenuTargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ContextMenuAccessibilityAction {
  name: string;
  label?: string;
}
export interface ContextMenuAccessibilityEvent {
  nativeEvent: { actionName: string };
}
export interface ContextMenuTriggerHandle {
  showMenu: () => void;
  activate: () => void;
  handleKeyDown: (event: ContextMenuKeyDownEvent) => void;
  handleAccessibilityAction: (event: ContextMenuAccessibilityEvent) => void;
  getFocusOptions: () => {
    accessible: boolean;
    focusable: boolean;
    tabIndex: number;
  };
  getAccessibilityActions: () =>
    | readonly ContextMenuAccessibilityAction[]
    | undefined;
}
export interface ContextMenuTriggerProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children: ReactNode;
  anchor?: ContextMenuAnchor;
  delay?: number;
  slop?: number;
  onPress?: () => void;
  haptics?: boolean;
  disabled?: boolean;
  accessible?: boolean;
  accessibilityActions?: readonly ContextMenuAccessibilityAction[];
  onAccessibilityAction?: (event: ContextMenuAccessibilityEvent) => void;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
    busy?: boolean;
  };
  focusable?: boolean;
  tabIndex?: number;
  onKeyDown?: (event: ContextMenuKeyDownEvent) => void;
}
export interface ContextMenuPreviewProps {
  children?: ReactNode;
  className?: string;
}
export interface ContextMenuItemProps extends MenuItemProps {
  icon?: ReactNode;
}
export interface ContextMenuContentProps extends MenuContentProps {
  placement?: MenuContentProps["placement"];
  align?: MenuContentProps["align"];
  offset?: number;
  minWidth?: number;
  scrim?: boolean;
}
