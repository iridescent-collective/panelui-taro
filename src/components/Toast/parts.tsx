import { View } from "@tarojs/components";
import { useContext } from "react";
import type { ComponentProps } from "react";

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  XIcon,
} from "../../icons";
import { cn } from "../../lib/utils";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";
import { Button } from "../Button";
import type { ButtonProps } from "../Button";
import { Text } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { ToastContext } from "./context";
import type { ToastVariant } from "./toast-store";
import type { ToastCloseProps, ToastIndicatorProps } from "./types";
import { toastVariants } from "./variants";

const INDICATOR_TOKEN: Record<ToastVariant, ThemeToken> = {
  default: "muted-foreground",
  destructive: "destructive-foreground",
  info: "info-foreground",
  success: "success-foreground",
  warning: "warning-foreground",
};
const INDICATOR_ICON = {
  default: InfoIcon,
  destructive: AlertTriangleIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
};
export const ToastIndicator = ({
  className,
  iconProps,
  children,
  ...props
}: ToastIndicatorProps) => {
  const { variant } = useContext(ToastContext);
  const tint = useThemeToken(INDICATOR_TOKEN[variant]);
  const Icon = INDICATOR_ICON[variant];
  return (
    <View
      className={toastVariants({ variant }).indicator({ className })}
      {...props}
    >
      {children ?? (
        <Icon size={iconProps?.size ?? 18} color={iconProps?.color ?? tint} />
      )}
    </View>
  );
};
export const ToastContent = ({
  className,
  ...props
}: ComponentProps<typeof View>) => {
  const { variant } = useContext(ToastContext);
  return (
    <View
      className={cn(
        "flex flex-col",
        toastVariants({ variant }).content({ className })
      )}
      {...props}
    />
  );
};
export const ToastTitle = ({ className, ...props }: TextProps) => {
  const { variant } = useContext(ToastContext);
  return (
    <Text
      className={cn(toastVariants({ variant }).title(), className)}
      {...props}
    />
  );
};
export const ToastDescription = ({ className, ...props }: TextProps) => {
  const { variant } = useContext(ToastContext);
  return (
    <Text
      className={cn(toastVariants({ variant }).description(), className)}
      {...props}
    />
  );
};
export const ToastAction = ({
  variant = "secondary",
  size = "sm",
  onPress,
  onClick,
  ...props
}: ButtonProps) => {
  const { hide } = useContext(ToastContext);
  return (
    <Button
      variant={variant}
      size={size}
      onPress={(event) => {
        (onClick ?? onPress)?.(event);
        hide();
      }}
      {...props}
    />
  );
};
export const ToastClose = ({ className, ...props }: ToastCloseProps) => {
  const { hide } = useContext(ToastContext);
  const color = useThemeToken("muted-foreground");
  return (
    <View className={cn("pt-[2px]", className)} {...props}>
      <Button
        variant="ghost"
        size="icon"
        accessibilityLabel="Dismiss notification"
        className="h-[48px] w-[48px] rounded-full"
        onPress={hide}
      >
        <XIcon size={14} color={color} />
      </Button>
    </View>
  );
};
ToastIndicator.displayName = "Toast.Indicator";
ToastContent.displayName = "Toast.Content";
ToastTitle.displayName = "Toast.Title";
ToastDescription.displayName = "Toast.Description";
ToastAction.displayName = "Toast.Action";
ToastClose.displayName = "Toast.Close";
