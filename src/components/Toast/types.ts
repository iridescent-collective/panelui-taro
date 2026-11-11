import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ToastVariant } from "./toast-store";

export interface ToastProps extends ComponentProps<typeof View> {
  variant?: ToastVariant;
  onHide?: () => void;
}
export interface ToastIndicatorProps extends ComponentProps<typeof View> {
  iconProps?: { size?: number; color?: string };
  children?: ReactNode;
}
export type ToastCloseProps = ComponentProps<typeof View>;
