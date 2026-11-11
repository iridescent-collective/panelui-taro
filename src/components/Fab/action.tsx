import { View } from "@tarojs/components";
import { forwardRef, useState } from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../icons/context";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useFabGroup } from "./context";
import { FabRoot } from "./root";
import type { FabActionProps } from "./types";

export const FabAction = forwardRef<ComponentRef<typeof View>, FabActionProps>(
  (
    {
      className,
      icon,
      systemImage: _systemImage,
      label,
      onPress,
      onClick,
      disabled = false,
      destructive = false,
      labelClassName,
      ...props
    },
    ref
  ) => {
    const { size, layout, appearance, iconPlacement, rowClassName, close } =
      useFabGroup();
    const [pressed, setPressed] = useState(false);
    const color = useThemeToken(destructive ? "destructive" : "foreground");
    const press: NonNullable<FabActionProps["onClick"]> = (event) => {
      if (disabled) {
        return;
      }
      close();
      onPress?.();
      onClick?.(event);
    };
    if (layout === "menu") {
      const wells = appearance === "wells";
      const glyph = wells ? (
        <View
          className={cn(
            "flex h-[64px] w-[64px] items-center justify-center rounded-full",
            destructive
              ? "bg-[var(--panel-destructive)]/15"
              : "bg-[var(--panel-foreground)]/10"
          )}
        >
          {icon}
        </View>
      ) : (
        icon
      );
      return (
        <IconColorProvider color={color}>
          <AnimatedPressable
            {...props}
            ref={ref}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={press}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            pressScale={1}
            className={cn(
              "flex flex-row items-center gap-[24px]",
              wells
                ? "h-[96px] rounded-[var(--panel-radius-2xl)] px-[16px]"
                : "h-[88px] px-[32px]",
              iconPlacement === "trailing" && "justify-between",
              pressed && "bg-[var(--panel-foreground)]/10",
              disabled && "opacity-40",
              rowClassName,
              className
            )}
          >
            {iconPlacement === "leading" ? glyph : null}
            <Text
              className={cn(
                "shrink truncate",
                destructive
                  ? "text-[var(--panel-destructive)]"
                  : "text-[var(--panel-foreground)]",
                labelClassName
              )}
            >
              {label}
            </Text>
            {iconPlacement === "trailing" ? glyph : null}
          </AnimatedPressable>
        </IconColorProvider>
      );
    }
    return (
      <View
        {...props}
        className="flex flex-row items-center justify-end gap-[24px]"
      >
        {label ? (
          <View className="rounded-[var(--panel-radius-lg)] bg-[var(--panel-popover)] px-[20px] py-[8px] shadow-sm">
            <Text
              size="sm"
              className={cn("text-[var(--panel-foreground)]", labelClassName)}
            >
              {label}
            </Text>
          </View>
        ) : null}
        <FabRoot
          ref={ref}
          icon={icon}
          size={size === "lg" ? "md" : "sm"}
          variant={destructive ? "destructive" : "surface"}
          disabled={disabled}
          accessibilityLabel={label}
          onPress={press}
          className={className}
        />
      </View>
    );
  }
);
FabAction.displayName = "Fab.Action";
