import { View } from "@tarojs/components";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useContext,
  useSyncExternalStore,
} from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../icons/context";
import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { actionVariants } from "./action-variants";
import { ACTION_ICON_SIZE, DIRECTION_LABELS } from "./constants";
import { StackCardSlotIndex, useStackCardContext } from "./context";
import { directionProgress } from "./geometry";
import type {
  StackCardActionProps,
  StackCardActionsProps,
  StackCardCardProps,
  StackCardEmptyProps,
  StackCardStampProps,
} from "./types";
import { stampVariants } from "./variants";

export const StackCardCard = forwardRef<
  ComponentRef<typeof View>,
  StackCardCardProps
>(({ className, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-[var(--panel-radius-3xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]",
      className
    )}
  />
));
export const StackCardEmpty = forwardRef<
  ComponentRef<typeof View>,
  StackCardEmptyProps
>(({ className, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn(
      "absolute inset-0 flex flex-col items-center justify-center gap-[16px] rounded-[var(--panel-radius-3xl)] border-[2px] border-dashed border-[var(--panel-border)] p-[48px]",
      className
    )}
  />
));
export const StackCardActions = forwardRef<
  ComponentRef<typeof View>,
  StackCardActionsProps
>(({ className, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn(
      "flex flex-row items-center justify-center gap-[32px] pt-[40px]",
      className
    )}
  />
));
export const StackCardStamp = forwardRef<
  ComponentRef<typeof View>,
  StackCardStampProps
>(
  (
    {
      className,
      labelClassName,
      color = "default",
      direction = "right",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { signal, threshold } = useStackCardContext();
    const frame = useSyncExternalStore(
      signal.subscribe,
      signal.getSnapshot,
      signal.getSnapshot
    );
    const slot = useContext(StackCardSlotIndex);
    const progress =
      slot === null || slot === frame.active
        ? directionProgress(
            direction,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            threshold
          )
        : 0;
    const slots = stampVariants({ color, direction });
    return (
      <View
        {...props}
        ref={ref}
        aria-hidden
        style={mergeStyleAfter(style, {
          opacity: progress,
          pointerEvents: "none",
          transform: `scale(${0.8 + progress * 0.2})`,
        })}
        className={slots.root({ className: cn("flex flex-col", className) })}
      >
        <View className={slots.pill()}>
          {typeof children === "string" || typeof children === "number" ? (
            <Text className={slots.label({ className: labelClassName })}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      </View>
    );
  }
);
export const StackCardAction = forwardRef<
  ComponentRef<typeof View>,
  StackCardActionProps
>(
  (
    {
      className,
      action,
      icon,
      label,
      color = "default",
      size = "md",
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const ctx = useStackCardContext();
    const slots = actionVariants({ color, size });
    const foreground = useThemeToken("foreground");
    const primary = useThemeToken("primary-foreground");
    let tint = "#ffffff";
    if (color === "default") {
      tint = foreground;
    }
    if (color === "primary") {
      tint = primary;
    }
    const undo = action === "undo";
    const disabled =
      ctx.disabled || (undo ? !ctx.canUndo : ctx.index >= ctx.count);
    const glyph =
      isValidElement<{
        size?: number;
      }>(icon) && icon.props.size === undefined
        ? cloneElement(icon, { size: ACTION_ICON_SIZE[size] })
        : icon;
    return (
      <AnimatedPressable
        {...props}
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={label ?? (undo ? "Undo" : DIRECTION_LABELS[action])}
        disabled={disabled}
        className={slots.root({
          className: cn("flex", disabled && "opacity-40", className),
        })}
        onPress={(event) => {
          if (undo) {
            ctx.undo();
          } else {
            ctx.send(action);
          }
          onPress?.();
          onClick?.(event);
        }}
      >
        <IconColorProvider color={tint}>{glyph}</IconColorProvider>
      </AnimatedPressable>
    );
  }
);
StackCardCard.displayName = "StackCard.Card";
StackCardStamp.displayName = "StackCard.Stamp";
StackCardEmpty.displayName = "StackCard.Empty";
StackCardActions.displayName = "StackCard.Actions";
StackCardAction.displayName = "StackCard.Action";
