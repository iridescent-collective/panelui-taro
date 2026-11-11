import { View } from "@tarojs/components";
import { createContext, forwardRef, useContext } from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { AlertTriangleIcon, CheckCircleIcon, InfoIcon } from "../../icons";
import { cn } from "../../lib/utils";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { alertVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;
const AlertContext = createContext<AlertVariant>("default");
const INDICATOR_COLOR_VAR: Record<AlertVariant, ThemeToken> = {
  default: "muted-foreground",
  destructive: "destructive-foreground",
  info: "info-foreground",
  success: "success-foreground",
  warning: "warning-foreground",
};
const INDICATOR_ICON: Record<AlertVariant, typeof InfoIcon> = {
  default: InfoIcon,
  destructive: AlertTriangleIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
};
export interface AlertProps
  extends ViewProps, VariantProps<typeof alertVariants> {
  className?: string;
  icon?: ReactNode;
  children?: ReactNode;
}
const AlertRoot = forwardRef<ComponentRef<typeof View>, AlertProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => {
    const { root, indicator, content } = alertVariants({ variant });
    return (
      <AlertContext.Provider value={variant}>
        <View
          ref={ref}
          {...props}
          role="alert"
          aria-role="alert"
          className={root({ className })}
        >
          {icon ? (
            <>
              <View className={indicator()}>{icon}</View>
              <View className={content({ className: "flex flex-col" })}>
                {textChildren(children)}
              </View>
            </>
          ) : (
            children
          )}
        </View>
      </AlertContext.Provider>
    );
  }
);
AlertRoot.displayName = "Alert";
export interface AlertIndicatorProps extends ViewProps {
  className?: string;
  iconProps?: {
    size?: number;
    color?: string;
  };
  children?: ReactNode;
}
const AlertIndicator = forwardRef<
  ComponentRef<typeof View>,
  AlertIndicatorProps
>(({ className, iconProps, children, ...props }, ref) => {
  const variant = useContext(AlertContext);
  const { indicator } = alertVariants({ variant });
  const themeColor = useThemeToken(INDICATOR_COLOR_VAR[variant]);
  const Icon = INDICATOR_ICON[variant];
  const color =
    iconProps?.color ??
    (typeof themeColor === "string" ? themeColor : undefined);
  return (
    <View ref={ref} className={indicator({ className })} {...props}>
      {children ?? <Icon size={iconProps?.size ?? 18} color={color} />}
    </View>
  );
});
AlertIndicator.displayName = "Alert.Indicator";
const AlertContent = forwardRef<
  ComponentRef<typeof View>,
  ViewProps & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  const variant = useContext(AlertContext);
  const { content } = alertVariants({ variant });
  return (
    <View
      ref={ref}
      className={content({ className: `flex flex-col ${className ?? ""}` })}
      {...props}
    />
  );
});
AlertContent.displayName = "Alert.Content";
const AlertTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const variant = useContext(AlertContext);
    const { title } = alertVariants({ variant });
    return <Text ref={ref} className={cn(title(), className)} {...props} />;
  }
);
AlertTitle.displayName = "Alert.Title";
const AlertDescription = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const variant = useContext(AlertContext);
    const { description } = alertVariants({ variant });
    return (
      <Text ref={ref} className={cn(description(), className)} {...props} />
    );
  }
);
AlertDescription.displayName = "Alert.Description";
export const Alert = Object.assign(AlertRoot, {
  Content: AlertContent,
  Description: AlertDescription,
  Indicator: AlertIndicator,
  Title: AlertTitle,
});
