import type { View } from "@tarojs/components";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import type { VariantProps } from "../../vendor/tailwind-variants/lite";
import type { TextProps } from "../primitives/Text";
import type { dialogFooterVariants } from "./variants";

export interface DialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}
export interface DialogContentProps extends ComponentProps<typeof View> {
  dismissible?: boolean;
  unstyled?: boolean;
  exitDuration?: number;
  overlayClassName?: string;
  blur?: boolean;
  children?: ReactNode;
}
export interface DialogActionTarget {
  onClick?: ComponentProps<typeof View>["onClick"];
  onPress?: ComponentProps<typeof View>["onClick"];
}
export interface DialogTriggerProps {
  children: ReactElement<DialogActionTarget>;
}
export type DialogCloseProps = DialogTriggerProps;
export type DialogTextProps = TextProps;
export interface DialogFooterProps
  extends
    ComponentProps<typeof View>,
    VariantProps<typeof dialogFooterVariants> {}
