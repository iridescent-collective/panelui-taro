import { View } from "@tarojs/components";
import { Children, useCallback } from "react";

import { useDirection } from "../../hooks/use-direction";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { Switch } from "../Switch";
import { useAIInputSheet } from "./context";
import { useAIInputToken } from "./surface";
import type {
  AIInputSheetGroupProps,
  AIInputSheetRowProps,
  AIInputSheetToggleProps,
  AIInputSheetChoiceProps,
} from "./types";

export const AIInputSheetGroup = ({
  className,
  footnote,
  children,
  ...props
}: AIInputSheetGroupProps) => {
  const rows = Children.toArray(children);
  return (
    <View className="flex flex-col gap-[16px]">
      <View
        {...props}
        className={cn(
          "overflow-hidden rounded-[40px] bg-[var(--panel-muted-opacity-50)]",
          className
        )}
      >
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 ? (
              <View className="ms-[32px] h-[2px] bg-[var(--panel-border)]" />
            ) : null}
            {row}
          </View>
        ))}
      </View>
      {typeof footnote === "string" ? (
        <Text size="sm" muted className="px-[16px]">
          {footnote}
        </Text>
      ) : (
        footnote
      )}
    </View>
  );
};
export const AIInputSheetRow = ({
  className,
  label,
  description,
  icon,
  value,
  to,
  onPress,
  disabled = false,
  ...props
}: AIInputSheetRowProps) => {
  const { push } = useAIInputSheet("AIInput.Sheet.Row");
  const rtl = useDirection() === "rtl";
  const Chevron = rtl ? ChevronLeftIcon : ChevronRightIcon;
  const handlePress = useCallback(() => {
    onPress?.();
    if (to) {
      push(to);
    }
  }, [onPress, push, to]);
  const body = (
    <>
      {icon}
      <View className="flex flex-1 flex-col gap-[4px]">
        {typeof label === "string" ? <Text size="base">{label}</Text> : label}
        {typeof description === "string" ? (
          <Text size="sm" muted>
            {description}
          </Text>
        ) : (
          description
        )}
      </View>
      {typeof value === "string" ? (
        <Text size="base" muted>
          {value}
        </Text>
      ) : (
        value
      )}
      {to ? <Chevron size={18} /> : null}
    </>
  );
  const interactive = Boolean(to || onPress);
  if (!interactive) {
    return (
      <View
        {...props}
        className={cn(
          "flex flex-row items-center gap-[24px] px-[32px] py-[32px]",
          className
        )}
      >
        {body}
      </View>
    );
  }
  return (
    <AnimatedPressable
      pressScale={1}
      pressOpacity={0.6}
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      className={cn(
        "flex flex-row items-center gap-[24px] px-[32px] py-[32px]",
        disabled && "opacity-40",
        className
      )}
    >
      {body}
    </AnimatedPressable>
  );
};
export const AIInputSheetToggle = ({
  className,
  label,
  description,
  icon,
  value,
  onValueChange,
  disabled = false,
  ...props
}: AIInputSheetToggleProps) => (
  <View
    {...props}
    className={cn(
      "flex flex-row items-center gap-[24px] px-[32px] py-[20px]",
      className
    )}
  >
    {icon}
    <View className="flex flex-1 flex-col gap-[4px]">
      {typeof label === "string" ? <Text size="base">{label}</Text> : label}
      {typeof description === "string" ? (
        <Text size="sm" muted>
          {description}
        </Text>
      ) : (
        description
      )}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      label={typeof label === "string" ? label : undefined}
    />
  </View>
);
export const AIInputSheetChoice = ({
  className,
  label,
  description,
  badge,
  selected = false,
  onPress,
  disabled = false,
  ...props
}: AIInputSheetChoiceProps) => {
  const tint = useAIInputToken("--color-primary");
  return (
    <AnimatedPressable
      pressScale={1}
      pressOpacity={0.6}
      {...props}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "flex flex-row items-start gap-[24px] px-[32px] py-[32px]",
        disabled && "opacity-40",
        className
      )}
    >
      <View className="flex flex-1 flex-col gap-[4px]">
        <View className="flex flex-row items-center gap-[16px]">
          {typeof label === "string" ? (
            <Text size="lg" weight="medium">
              {label}
            </Text>
          ) : (
            label
          )}
          {badge}
        </View>
        {typeof description === "string" ? (
          <Text size="sm" muted>
            {description}
          </Text>
        ) : (
          description
        )}
      </View>
      {selected ? (
        <CheckIcon
          size={20}
          color={typeof tint === "string" ? tint : undefined}
        />
      ) : null}
    </AnimatedPressable>
  );
};
