import {
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIndicator,
  ToastTitle,
} from "./parts";
import { ToastRoot } from "./surface";
import { toast } from "./toast-store";

export type { ToastProps, ToastIndicatorProps, ToastCloseProps } from "./types";
export type {
  ToastOptions,
  ToastItem,
  ToastPlacement,
  ToastVariant,
  ToastHandle,
} from "./toast-store";
export { toast } from "./toast-store";
export { ToastViewport } from "./viewport";
export const useToast = () => ({ toast });
export const Toast = Object.assign(ToastRoot, {
  Action: ToastAction,
  Close: ToastClose,
  Content: ToastContent,
  Description: ToastDescription,
  Indicator: ToastIndicator,
  Title: ToastTitle,
});
