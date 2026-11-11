import type { View } from "@tarojs/components";
import { cloneElement, forwardRef, isValidElement, useContext } from "react";
import type { ComponentRef, ReactNode } from "react";

import { IconColorProvider } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { SwipeContext } from "./context";
import type { SwipeActionProps, SwipePanelProps } from "./types";
import { actionVariants } from "./variants";

const sizeIcon = (icon: ReactNode) =>
  isValidElement<{ size?: number }>(icon) && icon.props.size === undefined
    ? cloneElement(icon, { size: 22 })
    : icon;
export const SwipeAction = forwardRef<
  ComponentRef<typeof View>,
  SwipeActionProps
>(
  (
    {
      className,
      labelClassName,
      color = "default",
      label,
      icon,
      onPress,
      onClick,
      keepOpen = false,
      ...props
    },
    ref
  ) => {
    const context = useContext(SwipeContext);
    const slots = actionVariants({ color });
    const background = useThemeToken("background");
    const primary = useThemeToken("primary-foreground");
    let tint = "#ffffff";
    if (color === "default") {
      tint = background;
    } else if (color === "primary") {
      tint = primary;
    }
    return (
      <AnimatedPressable
        {...props}
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={(event) => {
          if (!keepOpen) {
            context?.close();
          }
          onClick?.(event);
          onPress?.();
        }}
        className={cn("flex shrink-0 flex-col", slots.root({ className }))}
      >
        {icon ? (
          <IconColorProvider color={tint}>{sizeIcon(icon)}</IconColorProvider>
        ) : null}
        <Text
          className={slots.label({ className: labelClassName })}
          numberOfLines={1}
        >
          {label}
        </Text>
      </AnimatedPressable>
    );
  }
);
SwipeAction.displayName = "Swipe.Action";
export const SwipeStart = forwardRef<
  ComponentRef<typeof View>,
  SwipePanelProps
>(() => null);
export const SwipeEnd = forwardRef<ComponentRef<typeof View>, SwipePanelProps>(
  () => null
);
SwipeStart.displayName = "Swipe.Start";
SwipeEnd.displayName = "Swipe.End";
