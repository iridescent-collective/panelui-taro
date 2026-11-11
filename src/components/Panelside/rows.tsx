import { View } from "@tarojs/components";
import { useCallback, useContext, useMemo } from "react";

import { IconColorProvider } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken as usePanelsideToken } from "../../theme/use-theme";
import { Menu } from "../Menu";
import { Text } from "../primitives/Text";
import { ACTIONS_MIN_WIDTH } from "./constants";
import {
  usePanelsideItem,
  PanelsideContext,
  PanelsideItemContext,
} from "./context";
import type { PanelsideItemContextValue } from "./context";
import { Glyph, MoreHorizontalIcon } from "./glyph";
import { itemVariants } from "./item-variants";
import type {
  PanelsidePressableProps,
  PanelsideItemProps,
  PanelsideItemIconProps,
  PanelsideItemLabelProps,
  PanelsideItemBadgeProps,
  PanelsideActionProps,
  PanelsideItemActionsProps,
} from "./types";

export const PanelsideItemIcon = ({
  className,
  children,
  ...props
}: PanelsideItemIconProps) => {
  const { tint } = usePanelsideItem("Panelside.ItemIcon");
  if (className === undefined && Object.keys(props).length === 0) {
    return <IconColorProvider color={tint}>{children}</IconColorProvider>;
  }
  return (
    <View className={className} {...props}>
      <IconColorProvider color={tint}>{children}</IconColorProvider>
    </View>
  );
};
export const PanelsideItemLabel = ({
  className,
  children,
  ...props
}: PanelsideItemLabelProps) => {
  const { active } = usePanelsideItem("Panelside.ItemLabel");
  return (
    <Text
      size="base"
      weight={active ? "medium" : "normal"}
      muted={!active}
      numberOfLines={1}
      className={cn("flex-1", className)}
      {...props}
    >
      {children}
    </Text>
  );
};
export const PanelsideItemBadge = ({
  className,
  children,
  ...props
}: PanelsideItemBadgeProps) => {
  usePanelsideItem("Panelside.ItemBadge");
  if (typeof children !== "string" && typeof children !== "number") {
    return <>{children}</>;
  }
  return (
    <View
      className={cn(
        "rounded-full bg-[var(--panel-secondary)] px-[16px] py-[4px]",
        className
      )}
      {...props}
    >
      <Text size="xs" muted>
        {children}
      </Text>
    </View>
  );
};
export const PanelsideItem = ({
  className,
  icon,
  label,
  to,
  closeOnNavigate = true,
  active: activeProp,
  badge,
  disabled = false,
  size = "default",
  onPress,
  onClick,
  children,
  ...props
}: PanelsideItemProps) => {
  const panel = useContext(PanelsideContext);
  const restTint = usePanelsideToken("muted-foreground");
  const activeTint = usePanelsideToken("foreground");
  const active = activeProp ?? (to !== undefined && panel?.route === to);
  const press = useCallback(
    (event: Parameters<NonNullable<PanelsidePressableProps["onPress"]>>[0]) => {
      onClick?.(event);
      onPress?.(event);
      if (to === undefined || !panel) {
        return;
      }
      panel.navigate(to);
      if (closeOnNavigate) {
        panel.setOpen(false);
      }
    },
    [closeOnNavigate, onClick, onPress, panel, to]
  );
  const tint = active ? activeTint : restTint;
  const context = useMemo<PanelsideItemContextValue>(
    () => ({ active, disabled, size, tint }),
    [active, disabled, size, tint]
  );
  const filled = label !== undefined || children !== undefined;
  const trailing = badge !== undefined && badge !== null;
  return (
    <PanelsideItemContext.Provider value={context}>
      <AnimatedPressable
        className={itemVariants({ active, className, disabled, size })}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: active }}
        accessibilityLabel={label}
        pressScale={0.985}
        onPress={to !== undefined || onPress || onClick ? press : undefined}
        {...props}
      >
        {icon ? <PanelsideItemIcon>{icon}</PanelsideItemIcon> : null}

        {label === undefined ? null : (
          <PanelsideItemLabel>{label}</PanelsideItemLabel>
        )}

        {filled || !trailing ? null : <View className="flex-1" />}

        {badge !== undefined && badge !== null ? (
          <PanelsideItemBadge>{badge}</PanelsideItemBadge>
        ) : null}

        {children}
      </AnimatedPressable>
    </PanelsideItemContext.Provider>
  );
};
export const PanelsideAction = ({
  className,
  label = "More options",
  children,
  onPress,
  onClick,
  ...props
}: PanelsideActionProps) => {
  const tint = usePanelsideToken("muted-foreground");
  const color = typeof tint === "string" ? tint : undefined;
  return (
    <AnimatedPressable
      className={cn(
        "flex h-[56px] w-[56px] flex-col items-center justify-center rounded-[var(--panel-radius-lg)]",
        className
      )}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
        onPress?.(event);
      }}
      {...props}
    >
      {children ?? <Glyph icon={MoreHorizontalIcon} size={18} color={color} />}
    </AnimatedPressable>
  );
};
export const PanelsideItemActions = ({
  className,
  label = "More options",
  icon,
  placement = "bottom",
  align = "end",
  minWidth = ACTIONS_MIN_WIDTH,
  contentProps,
  children,
}: PanelsideItemActionsProps) => (
  <Menu>
    <Menu.Trigger>
      <PanelsideAction className={className} label={label}>
        {icon}
      </PanelsideAction>
    </Menu.Trigger>
    <Menu.Content
      placement={placement}
      align={align}
      width="content-fit"
      minWidth={minWidth}
      {...contentProps}
    >
      {children}
    </Menu.Content>
  </Menu>
);
