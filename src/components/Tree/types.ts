import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

type ViewProps = ComponentProps<typeof View>;
type PressableProps = AnimatedPressableProps;
export type TreeSize = "sm" | "default";
export type TreeSelectionMode = "none" | "single" | "multiple";
export interface TreeContextValue {
  expanded: string[];
  toggleExpanded: (value: string) => void;
  selected: string[];
  select: (value: string) => void;
  selectionMode: TreeSelectionMode;
  expandOnPress: boolean;
  showLines: boolean;
  indent: number;
  size: TreeSize;
}
export interface TreeItemContextValue {
  value: string;

  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isBranch: boolean;
}
export interface TreeProps extends ViewProps {
  className?: string;

  size?: TreeSize;

  selectionMode?: TreeSelectionMode;

  value?: string | string[];
  defaultValue?: string | string[];

  onValueChange?: (value: string | string[]) => void;

  expanded?: string[];
  defaultExpanded?: string[];

  onExpandedChange?: (expanded: string[]) => void;

  expandOnPress?: boolean;

  showLines?: boolean;

  indent?: number;
  children?: ReactNode;
}
export interface TreeItemProps extends ViewProps {
  className?: string;

  value: string;
  isDisabled?: boolean;

  hasChildren?: boolean;
  children?: ReactNode;
}
export interface TreeTriggerProps extends Omit<PressableProps, "children"> {
  className?: string;
  children?: ReactNode;
}
export interface TreeIndicatorProps extends ViewProps {
  className?: string;

  children?: ReactNode;
}
export interface TreeIconProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
export interface TreeActionsProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
export interface TreeGroupProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
