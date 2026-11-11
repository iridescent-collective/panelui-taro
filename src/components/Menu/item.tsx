import { View } from "@tarojs/components";
import { useState } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { selectionTick } from "../../lib/haptics";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { textChildren, Text } from "../primitives/Text";
import { useMenu } from "./context";
import type { MenuItemProps } from "./types";
import { menuVariants } from "./variants";

export const MenuItem = ({
  className,
  children,
  icon,
  description,
  shortcut,
  trailing,
  variant = "default",
  inset,
  disabled = false,
  closeOnSelect = true,
  onSelect,
  onPress,
  onClick,
  onPressIn,
  onPressOut,
  accessibilityState,
  ...props
}: MenuItemProps) => {
  const { close, haptics } = useMenu("Menu.Item");
  const slots = menuVariants({ disabled, inset: inset && !icon, variant });
  const [pressed, setPressed] = useState(false);
  const reduced = usePanelReducedMotion();
  const progress = useTimingNumber(
    pressed ? 1 : 0,
    pressed ? 90 : 160,
    reduced,
    0
  );
  const accent = useThemeToken("accent");
  const destructive = useThemeToken("destructive-subtle");
  const fill = variant === "destructive" ? destructive : accent;
  const select: NonNullable<MenuItemProps["onPress"]> = async (event) => {
    if (disabled) {
      return;
    }
    const pulse = haptics ? selectionTick() : null;
    try {
      onPress?.(event);
      if (onClick !== onPress) {
        onClick?.(event);
      }
      onSelect?.();
      if (closeOnSelect) {
        close();
      }
    } finally {
      if (pulse) {
        await pulse;
      }
    }
  };
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="menuitem"
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      pressScale={1}
      onPress={select}
      onPressIn={(event) => {
        onPressIn?.(event);
        setPressed(true);
      }}
      onPressOut={(event) => {
        onPressOut?.(event);
        setPressed(false);
      }}
      style={{ transform: `scale(${1 - 0.02 * progress})` }}
      className={cn(slots.item(), "overflow-hidden", className)}
    >
      <View
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: fill,
          opacity: progress,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      {icon ? (
        <View
          className={cn("relative flex flex-col", slots.indicator())}
          style={{ height: "36rpx", width: "36rpx" }}
        >
          {icon}
        </View>
      ) : null}
      <View className="relative flex flex-1 flex-col">
        {textChildren(children, (text) => (
          <Text className={slots.itemLabel()}>{text}</Text>
        ))}
        {description ? (
          <Text size="xs" muted className={slots.itemDescription()}>
            {description}
          </Text>
        ) : null}
      </View>
      {shortcut ? (
        <Text size="xs" muted className={cn("relative", slots.shortcut())}>
          {shortcut}
        </Text>
      ) : null}
      {trailing}
    </AnimatedPressable>
  );
};
MenuItem.displayName = "Menu.Item";
