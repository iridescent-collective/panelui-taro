import { View } from "@tarojs/components";
import { createContext, forwardRef, useContext, useMemo } from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text, textChildren } from "../primitives/Text";
import { requestRadioValueChange } from "./radio-group-value";
import { itemVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type RadioVariant = "dot" | "card";
type RadioOrientation = "vertical" | "horizontal";
type RadioSize = NonNullable<VariantProps<typeof itemVariants>["size"]>;
interface RadioGroupContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  variant: RadioVariant;
  size: RadioSize;
  orientation: RadioOrientation;
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
export interface RadioGroupProps extends ViewProps {
  className?: string;
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  variant?: RadioVariant;
  size?: RadioSize;
  orientation?: RadioOrientation;
  children: ReactNode;
}
const RadioGroupRoot = forwardRef<ComponentRef<typeof View>, RadioGroupProps>(
  (
    {
      className,
      value,
      onValueChange,
      disabled,
      variant = "dot",
      size = "md",
      orientation = "vertical",
      children,
      ...props
    },
    ref
  ) => {
    const context = useMemo(
      () => ({ disabled, onValueChange, orientation, size, value, variant }),
      [value, onValueChange, disabled, variant, size, orientation]
    );
    return (
      <RadioGroupContext.Provider value={context}>
        <View
          ref={ref}
          role="radiogroup"
          aria-role="radiogroup"
          className={cn(
            orientation === "horizontal"
              ? "flex flex-row flex-wrap items-stretch gap-x-[40px] gap-y-[24px]"
              : "flex flex-col gap-[24px]",
            className
          )}
          {...props}
        >
          {textChildren(children)}
        </View>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroupRoot.displayName = "RadioGroup";
export interface RadioGroupItemProps {
  className?: string;
  value: string;
  label?: string;
  labelClassName?: string;
  description?: string;
  descriptionClassName?: string;
  disabled?: boolean;
  hideIndicator?: boolean;
  children?: ReactNode;
}
const RadioGroupItem = forwardRef<
  ComponentRef<typeof View>,
  RadioGroupItemProps
>(
  (
    {
      className,
      value,
      label,
      labelClassName,
      description,
      descriptionClassName,
      disabled: itemDisabled,
      hideIndicator,
      children,
    },
    ref
  ) => {
    const context = useContext(RadioGroupContext);
    if (!context) {
      throw new Error("RadioGroup.Item must be used within a <RadioGroup>");
    }
    const selected = context.value === value;
    const disabled = itemDisabled || context.disabled;
    const { variant } = context;
    const reducedMotion = usePanelReducedMotion();
    const dotStyle = {
      opacity: selected ? 1 : 0,
      transform: `scale(${selected ? 1 : 0})`,
      transition: reducedMotion
        ? "none"
        : "opacity 120ms ease, transform 220ms cubic-bezier(0.22,1,0.36,1)",
    };
    const slots = itemVariants({
      disabled: !!disabled,
      horizontal: context.orientation === "horizontal",
      selected,
      size: context.size,
      variant,
    });
    const indicator = hideIndicator ? null : (
      <View className={slots.indicator({ className: "flex shrink-0" })}>
        <View style={dotStyle} className={slots.dot()} />
      </View>
    );
    const labelled = label ? (
      <Text className={slots.label({ className: labelClassName })}>
        {label}
      </Text>
    ) : (
      textChildren(children, (text) => (
        <Text className={slots.label({ className: labelClassName })}>
          {text}
        </Text>
      ))
    );
    const body =
      variant === "card" ? (
        <>
          <View className="flex flex-1 flex-col gap-[8px]">
            {labelled}
            {description ? (
              <Text
                className={slots.description({
                  className: descriptionClassName,
                })}
              >
                {description}
              </Text>
            ) : null}
          </View>
          {indicator}
        </>
      ) : (
        <>
          {indicator}
          {labelled}
        </>
      );
    return (
      <AnimatedPressable
        pressScale={1}
        ref={ref}
        accessibilityRole="radio"
        accessibilityState={{
          checked: selected,
          disabled: !!disabled,
          selected,
        }}
        accessibilityLabel={label}
        disabled={disabled}
        onPress={() =>
          requestRadioValueChange(context.value, value, context.onValueChange)
        }
        className={slots.row({ className })}
      >
        {body}
      </AnimatedPressable>
    );
  }
);
RadioGroupItem.displayName = "RadioGroup.Item";
export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: RadioGroupItem,
});
export type { RadioVariant, RadioSize };
