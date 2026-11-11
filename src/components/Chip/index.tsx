import { View } from "@tarojs/components";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { IconColorProvider, XIcon } from "../../icons";
import { selectionTick } from "../../lib/haptics";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { chipVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type ChipVariantProps = VariantProps<typeof chipVariants>;
export type ChipVariant = NonNullable<ChipVariantProps["variant"]>;
export type ChipSize = NonNullable<ChipVariantProps["size"]>;
const TINT_VAR: Record<ChipVariant, ThemeToken> = {
  default: "secondary-foreground",
  destructive: "destructive-foreground",
  info: "info-foreground",
  outline: "foreground",
  primary: "primary-foreground",
  success: "success-foreground",
  warning: "warning-foreground",
};
const CLOSE_TARGET = { lg: 24, md: 20, sm: 16, xl: 28, xs: 14 } as const;
const CLOSE_ICON: Record<ChipSize, number> = {
  lg: 15,
  md: 13,
  sm: 11,
  xl: 17,
  xs: 9,
};
interface ChipStateValue {
  selected: boolean;
  disabled: boolean;
}
interface ChipContextValue extends ChipStateValue {
  labelClasses: string;
}
const ChipContext = createContext<ChipContextValue | null>(null);
export const useChip = (): ChipStateValue => {
  const ctx = useContext(ChipContext);
  if (!ctx) {
    throw new Error("useChip must be used within a <Chip>");
  }
  return { disabled: ctx.disabled, selected: ctx.selected };
};
export interface ChipProps
  extends
    Omit<AnimatedPressableProps, "children" | "disabled">,
    Omit<ChipVariantProps, "selected" | "disabled" | "closable"> {
  children?: ReactNode;
  className?: string;
  labelClassName?: string;
  selected?: boolean;
  disabled?: boolean;
  start?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  haptics?: boolean;
}
const ChipRoot = forwardRef<ComponentRef<typeof View>, ChipProps>(
  (
    {
      children,
      className,
      labelClassName,
      variant = "default",
      size = "md",
      selected,
      disabled = false,
      start,
      onClose,
      closeLabel = "Remove",
      haptics = false,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const isToggle = selected !== undefined;
    const isSelected = selected ?? false;
    const closable = onClose !== undefined;
    const activate = onClick ?? onPress;
    const pressable = activate !== undefined || isToggle;
    const slots = chipVariants({
      closable,
      disabled,
      selected: isSelected,
      size,
      variant,
    });
    const tint = useThemeToken(
      isSelected ? "accent-foreground" : TINT_VAR[variant]
    );
    const handlePress = useCallback<
      NonNullable<AnimatedPressableProps["onPress"]>
    >(
      async (event) => {
        activate?.(event);
        if (haptics) {
          await selectionTick();
        }
      },
      [activate, haptics]
    );
    const handleClose = useCallback<
      NonNullable<AnimatedPressableProps["onPress"]>
    >(
      async (event) => {
        event.stopPropagation();
        if (disabled) {
          return;
        }
        onClose?.();
        if (haptics) {
          await selectionTick();
        }
      },
      [disabled, haptics, onClose]
    );
    const labelClasses = slots.label();
    const state = useMemo(
      () => ({ disabled, labelClasses, selected: isSelected }),
      [isSelected, disabled, labelClasses]
    );
    const body = (
      <>
        {start}
        {textChildren(children, (text) => (
          <Text className={slots.label({ className: labelClassName })}>
            {text}
          </Text>
        ))}
        {closable ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            hitSlop={8}
            disabled={disabled}
            onPress={handleClose}
            pressScale={1}
            pressOpacity={1}
            className={slots.close({ className: "flex" })}
            style={{ width: `${CLOSE_TARGET[size] * 2}rpx` }}
          >
            <XIcon size={CLOSE_ICON[size]} />
          </AnimatedPressable>
        ) : null}
      </>
    );
    const sharedProps = {
      accessibilityRole: "button" as const,
      accessibilityState: {
        disabled,
        ...(isToggle ? { selected: isSelected } : {}),
      },
      "aria-pressed": isToggle ? isSelected : undefined,
      className: slots.root({ className }),
      disabled,
    };
    return (
      <ChipContext.Provider value={state}>
        <IconColorProvider color={typeof tint === "string" ? tint : undefined}>
          {pressable ? (
            <AnimatedPressable
              ref={ref}
              {...props}
              {...sharedProps}
              onPress={handlePress}
            >
              {body}
            </AnimatedPressable>
          ) : (
            <View
              ref={ref}
              className={slots.root({ className })}
              {...(props as ViewProps)}
            >
              {body}
            </View>
          )}
        </IconColorProvider>
      </ChipContext.Provider>
    );
  }
);
ChipRoot.displayName = "Chip";
export interface ChipLabelProps {
  className?: string;
  children: ReactNode;
}
const ChipLabel = ({ className, children }: ChipLabelProps) => {
  const ctx = useContext(ChipContext);
  if (!ctx) {
    throw new Error("Chip.Label must be used within a <Chip>");
  }
  return <Text className={cn(ctx.labelClasses, className)}>{children}</Text>;
};
ChipLabel.displayName = "Chip.Label";
export const Chip = Object.assign(ChipRoot, {
  Label: ChipLabel,
});
