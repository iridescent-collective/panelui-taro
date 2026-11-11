import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../icons/context";
import { selectionTick } from "../../lib/haptics";
import { mergeStyle } from "../../lib/styles";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { FAB_COLOR } from "./constants";
import { fabAnchor } from "./math";
import type { FabProps } from "./types";
import { fabVariants } from "./variants";

export const FabRoot = forwardRef<ComponentRef<typeof View>, FabProps>(
  (
    {
      className,
      icon,
      children,
      extended = false,
      placement,
      offset = 16,
      size = "md",
      variant = "primary",
      disabled = false,
      haptics = false,
      glass: _glass,
      onPress,
      onClick,
      style,
      ...props
    },
    ref
  ) => {
    const color = useThemeToken(FAB_COLOR[variant]);
    const slots = fabVariants({
      disabled,
      extended: extended && Boolean(children),
      glass: false,
      size,
      variant,
    });
    return (
      <IconColorProvider color={color}>
        <AnimatedPressable
          {...props}
          ref={ref}
          accessibilityRole="button"
          disabled={disabled}
          className={slots.root({ className: `flex ${className ?? ""}` })}
          style={mergeStyle(
            placement ? fabAnchor(placement, offset) : {},
            style
          )}
          onPress={(event) => {
            if (haptics) {
              void selectionTick();
            }
            onPress?.(event);
            onClick?.(event);
          }}
        >
          <View className={slots.content()}>
            {icon}
            {extended && children ? (
              <Text className={slots.label()}>{children}</Text>
            ) : null}
          </View>
        </AnimatedPressable>
      </IconColorProvider>
    );
  }
);
FabRoot.displayName = "Fab";
