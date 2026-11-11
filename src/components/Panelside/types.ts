import type { View, ScrollView } from "@tarojs/components";
import type { ComponentProps, ReactNode, ReactElement } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { InputNativeProps } from "../Input/types";
import type { MenuContentProps } from "../Menu";
import type { TextProps } from "../primitives/Text";

export type PanelsidePressableProps = AnimatedPressableProps;
export type PanelsideViewProps = ComponentProps<typeof View>;
export type PanelsideScrollViewProps = ComponentProps<typeof ScrollView>;
export interface PanelsideSearchNativeProps extends InputNativeProps {
  onChangeText?: (value: string) => void;
  returnKeyType?: string;
  clearButtonMode?: string;
  maxLength?: number;
  autoFocus?: boolean;
  editable?: boolean;
}
export type PanelsideMode = "push" | "overlay";
export type PanelsideSwipeFrom = "anywhere" | "edge";
export type PanelsideItemSize = "default" | "sm";
export type PanelsideCtaSize = "default" | "lg" | "xl";
export type PanelsideSurface = "transparent" | "fade" | "solid";
export type PanelsideControlVariant = "filled" | "outline";
export interface UsePanelsideResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  progress: ObservableNumber;
  docked: boolean;
  route: string;
  navigate: (route: string) => void;
}
export interface PanelsideProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  mode?: PanelsideMode;
  width?: number;
  dock?: number | false;
  swipeEnabled?: boolean;
  swipeFrom?: PanelsideSwipeFrom;
  edgeWidth?: number;
  dismissible?: boolean;
  haptics?: boolean;
  scale?: number;
  radius?: number;
  dim?: number;
  route?: string;
  defaultRoute?: string;
  onRouteChange?: (route: string) => void;
  className?: string;
}
export interface PanelsidePanelProps extends PanelsideViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PanelsideHeaderProps extends PanelsideViewProps {
  className?: string;
  title?: string;
  action?: ReactNode;
  surface?: PanelsideSurface;
  children?: ReactNode;
}
export interface PanelsideSearchProps extends PanelsideSearchNativeProps {
  className?: string;
  containerClassName?: string;
}
export interface PanelsideContentProps extends PanelsideScrollViewProps {
  contentContainerStyle?: PanelsideViewProps["style"];
  className?: string;
  contentContainerClassName?: string;
  children?: ReactNode;
}
export interface PanelsideGroupProps extends PanelsideViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PanelsideGroupLabelProps extends PanelsideViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PanelsideItemProps extends Omit<
  PanelsidePressableProps,
  "children"
> {
  className?: string;
  icon?: ReactNode;
  label?: string;
  to?: string;
  closeOnNavigate?: boolean;
  active?: boolean;
  badge?: ReactNode;
  disabled?: boolean;
  size?: PanelsideItemSize;
  children?: ReactNode;
}
export interface PanelsideItemIconProps extends PanelsideViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PanelsideItemLabelProps extends TextProps {
  className?: string;
  children?: ReactNode;
}
export interface PanelsideItemBadgeProps extends PanelsideViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PanelsideActionProps extends Omit<
  PanelsidePressableProps,
  "children"
> {
  className?: string;
  label?: string;
  children?: ReactNode;
}
export interface PanelsideItemActionsProps {
  className?: string;
  label?: string;
  icon?: ReactNode;
  placement?: MenuContentProps["placement"];
  align?: MenuContentProps["align"];
  minWidth?: number;
  contentProps?: Omit<
    MenuContentProps,
    "children" | "placement" | "align" | "minWidth"
  >;
  children?: ReactNode;
}
export interface PanelsideFooterProps extends PanelsideViewProps {
  className?: string;
  floating?: boolean;
  surface?: PanelsideSurface;
  children?: ReactNode;
}
export interface PanelsideCtaProps extends Omit<
  PanelsidePressableProps,
  "children"
> {
  className?: string;
  label?: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
  size?: PanelsideCtaSize;
  native?: boolean;
  glass?: boolean;
  children?: ReactNode;
}
export interface PanelsideSceneProps extends PanelsideViewProps {
  className?: string;
  scale?: number;
  radius?: number;
  dim?: number;
  scrimClassName?: string;
  children?: ReactNode;
}
export interface PanelsidePagesProps extends PanelsideViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PanelsidePageProps extends PanelsideViewProps {
  className?: string;
  value: string;
  keepAlive?: boolean;
  hidden?: boolean;
  children?: ReactNode;
}
export interface PanelsideTriggerProps extends Omit<
  PanelsidePressableProps,
  "children"
> {
  className?: string;
  label?: string;
  children?: ReactElement<{
    onPress?: (...args: unknown[]) => void;
    onClick?: (...args: unknown[]) => void;
  }>;
}
export interface PanelsideSearchTriggerProps extends Omit<
  PanelsidePressableProps,
  "children"
> {
  className?: string;
  label?: string;
  variant?: PanelsideControlVariant;
  children?: ReactNode;
  native?: boolean;
  glass?: boolean;
}
