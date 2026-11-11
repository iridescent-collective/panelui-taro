import { View } from "@tarojs/components";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { IconColorProvider } from "../../icons";
import { selectionTick } from "../../lib/haptics";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { toggleVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;

const XS_HIT_SLOP = 8;
type ToggleVariantProps = VariantProps<typeof toggleVariants>;
export type ToggleButtonSize = NonNullable<ToggleVariantProps["size"]>;
export type ToggleButtonVariant = NonNullable<ToggleVariantProps["variant"]>;
export type ToggleSelectionMode = "single" | "multiple";
interface ToggleGroupContextValue {
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  disabled: boolean;
  variant?: ToggleButtonVariant;
  size?: ToggleButtonSize;
  haptics?: boolean;
}
const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);
export interface ToggleButtonGroupProps extends ViewProps {
  className?: string;
  selectionMode?: ToggleSelectionMode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  variant?: ToggleButtonVariant;
  size?: ToggleButtonSize;
  haptics?: boolean;
  children: ReactNode;
}
const ToggleButtonGroup = forwardRef<
  ComponentRef<typeof View>,
  ToggleButtonGroupProps
>(
  (
    {
      className,
      selectionMode = "multiple",
      value,
      defaultValue = [],
      onValueChange,
      disabled = false,
      variant,
      size,
      haptics,
      children,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string[]>(defaultValue);
    const selection = isControlled ? value : internal;
    const toggle = useCallback(
      (id: string) => {
        const has = selection.includes(id);
        let next = has
          ? selection.filter((item) => item !== id)
          : [...selection, id];
        if (selectionMode === "single") {
          next = has ? [] : [id];
        }
        if (!isControlled) {
          setInternal(next);
        }
        onValueChange?.(next);
      },
      [selection, selectionMode, isControlled, onValueChange]
    );
    const context = useMemo<ToggleGroupContextValue>(
      () => ({
        disabled,
        haptics,
        isSelected: (id) => selection.includes(id),
        size,
        toggle,
        variant,
      }),
      [selection, toggle, disabled, variant, size, haptics]
    );
    return (
      <ToggleGroupContext.Provider value={context}>
        <View
          ref={ref}
          role={selectionMode === "single" ? "radiogroup" : "toolbar"}
          aria-role={selectionMode === "single" ? "radiogroup" : "toolbar"}
          className={cn("flex flex-row items-center gap-[12px]", className)}
          {...props}
        >
          {textChildren(children)}
        </View>
      </ToggleGroupContext.Provider>
    );
  }
);
ToggleButtonGroup.displayName = "ToggleButtonGroup";
interface ToggleStateValue {
  selected: boolean;
  disabled: boolean;
}
const ToggleStateContext = createContext<ToggleStateValue | null>(null);
export const useToggleButton = (): ToggleStateValue => {
  const state = useContext(ToggleStateContext);
  if (!state) {
    throw new Error("useToggleButton must be used within a <ToggleButton>");
  }
  return state;
};
export interface ToggleButtonProps
  extends
    Omit<AnimatedPressableProps, "children" | "disabled">,
    Omit<ToggleVariantProps, "selected" | "disabled" | "iconOnly"> {
  children?: ReactNode;
  className?: string;
  labelClassName?: string;
  id?: string;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  disabled?: boolean;
  haptics?: boolean;
  iconOnly?: boolean;
  selectedClassName?: string;
  unselectedClassName?: string;
}
const resolveToggleHaptics = (
  haptics: boolean | undefined,
  group: ToggleGroupContextValue | null
) => haptics ?? group?.haptics ?? false;
const resolveToggleSize = (
  size: ToggleButtonSize | undefined | null,
  group: ToggleGroupContextValue | null
) => size ?? group?.size;

const ToggleButtonRoot = forwardRef<
  ComponentRef<typeof View>,
  ToggleButtonProps
>(
  (
    {
      children,
      className,
      labelClassName,
      id,
      selected: selectedProp,
      defaultSelected = false,
      onSelectedChange,
      disabled,
      variant,
      size,
      haptics,
      iconOnly = false,
      selectedClassName,
      unselectedClassName,
      onPress,
      hitSlop,
      ...props
    },
    ref
  ) => {
    const group = useContext(ToggleGroupContext);
    const [internal, setInternal] = useState(defaultSelected);
    const selected =
      group && id ? group.isSelected(id) : (selectedProp ?? internal);
    const isDisabled = disabled || (group?.disabled ?? false);
    const enableHaptics = resolveToggleHaptics(haptics, group);
    const resolvedSize = resolveToggleSize(size, group);
    const slots = toggleVariants({
      disabled: isDisabled,
      iconOnly,
      selected,
      size: resolvedSize,
      variant: variant ?? group?.variant,
    });
    const onColor = useThemeToken("accent-foreground");
    const offColor = useThemeToken("muted-foreground");
    const tint = selected ? onColor : offColor;
    const handlePress = useCallback<
      NonNullable<AnimatedPressableProps["onPress"]>
    >(
      (event) => {
        onPress?.(event);
        if (enableHaptics) {
          selectionTick();
        }
        if (group && id) {
          group.toggle(id);
          return;
        }
        const next = !selected;
        if (selectedProp === undefined) {
          setInternal(next);
        }
        onSelectedChange?.(next);
      },
      [
        onPress,
        enableHaptics,
        group,
        id,
        selected,
        selectedProp,
        onSelectedChange,
      ]
    );
    const state = useMemo(
      () => ({ disabled: isDisabled, selected }),
      [selected, isDisabled]
    );
    return (
      <ToggleStateContext.Provider value={state}>
        <IconColorProvider color={tint}>
          <AnimatedPressable
            ref={ref}
            {...props}
            accessibilityRole="button"
            accessibilityState={{
              checked: selected,
              disabled: isDisabled,
              selected,
            }}
            aria-pressed={selected}
            disabled={isDisabled}
            onPress={handlePress}
            hitSlop={
              hitSlop ??
              (!group && resolvedSize === "xs" ? XS_HIT_SLOP : undefined)
            }
            className={cn(
              slots.root({ className }),
              selected ? selectedClassName : unselectedClassName
            )}
          >
            {textChildren(children, (text) => (
              <Text className={slots.label({ className: labelClassName })}>
                {text}
              </Text>
            ))}
          </AnimatedPressable>
        </IconColorProvider>
      </ToggleStateContext.Provider>
    );
  }
);
ToggleButtonRoot.displayName = "ToggleButton";
export interface ToggleButtonLabelProps {
  className?: string;
  children: ReactNode;
}
const ToggleButtonLabel = ({ className, children }: ToggleButtonLabelProps) => {
  const { selected } = useToggleButton();
  return (
    <Text
      className={cn(
        "font-medium",
        selected
          ? "text-[color:var(--panel-accent-foreground)]"
          : "text-[color:var(--panel-muted-foreground)]",
        className
      )}
    >
      {children}
    </Text>
  );
};
ToggleButtonLabel.displayName = "ToggleButton.Label";
export const ToggleButton = Object.assign(ToggleButtonRoot, {
  Label: ToggleButtonLabel,
});
export { ToggleButtonGroup };
