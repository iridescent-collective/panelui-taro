import type { ScrollView, View } from "@tarojs/components";
import type {
  ComponentProps,
  ReactElement,
  ReactNode,
  CSSProperties,
} from "react";

import type { DialogActionTarget } from "../Dialog/types";

export type DrawerSide = "start" | "end" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "full";
export type DrawerCloseSide = "start" | "end";
export interface DrawerProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}
export interface DrawerTriggerProps {
  children: ReactElement<DialogActionTarget>;
}
export type DrawerCloseProps = DrawerTriggerProps;
export interface DrawerContentProps extends ComponentProps<typeof View> {
  unstyled?: boolean;
  overlayClassName?: string;
  exitDuration?: number;
  side?: DrawerSide;
  size?: DrawerSize;
  dismissible?: boolean;
  swipeToDismiss?: boolean;
  showClose?: boolean;
  closeSide?: DrawerCloseSide;
  blur?: boolean;
}
export interface DrawerHeaderProps extends ComponentProps<typeof View> {
  title?: ReactNode;
  description?: ReactNode;
}
export interface DrawerBodyProps extends ComponentProps<typeof ScrollView> {
  scrollable?: boolean;
  contentContainerStyle?: CSSProperties | string;
}
export type DrawerFooterProps = ComponentProps<typeof View>;
