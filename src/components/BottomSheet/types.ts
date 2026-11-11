import type { ScrollView, View } from "@tarojs/components";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import type { DialogActionTarget } from "../Dialog/types";

export interface BottomSheetProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  native?: boolean;
  snapPoints?: ("half" | "full" | { fraction: number } | { height: number })[];
  nativeBackground?: boolean | string;
}
export interface BottomSheetTriggerProps {
  children: ReactElement<DialogActionTarget>;
}
export interface BottomSheetContentProps extends ComponentProps<typeof View> {
  dismissible?: boolean;
  showClose?: boolean;
  showGrabber?: boolean;
  detached?: boolean;
  blur?: boolean;
  size?: "auto" | "half" | "full";
}
export interface BottomSheetHeaderProps extends ComponentProps<typeof View> {
  title?: ReactNode;
  description?: ReactNode;
}
export interface BottomSheetBodyProps extends ComponentProps<
  typeof ScrollView
> {
  overScrollMode?: "auto" | "always" | "never";
  contentContainerClassName?: string;
}
export type BottomSheetFooterProps = ComponentProps<typeof View>;
