import { View } from "@tarojs/components";

import { CheckIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { useSelectContext } from "./context";
import type { SelectItemProps, SelectGroupProps } from "./types";
import { selectVariants } from "./variants";

export const SelectItem = ({
  value,
  label,
  disabled,
  className,
  labelClassName,
}: SelectItemProps) => {
  const context = useSelectContext();
  const selected = context.value === value;
  const iconColor = useThemeToken("muted-foreground");
  const slots = selectVariants({ itemDisabled: Boolean(disabled), selected });
  return (
    <AnimatedPressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: Boolean(disabled), selected }}
      disabled={disabled}
      onPress={() => context.onSelect(value)}
      className={slots.item({ className })}
    >
      <Text className={slots.itemLabel({ className: labelClassName })}>
        {label}
      </Text>
      <View className={slots.itemIndicator({ className: "flex flex-col" })}>
        {selected ? <CheckIcon size={16} color={iconColor} /> : null}
      </View>
    </AnimatedPressable>
  );
};
export const SelectGroup = ({
  label,
  className,
  labelClassName,
  children,
}: SelectGroupProps) => {
  const slots = selectVariants();
  return (
    <View className={cn("flex flex-col", slots.group(), className)}>
      {label ? (
        <View
          role="heading"
          aria-role="heading"
          className={cn(slots.groupLabel(), labelClassName)}
        >
          <Text
            size="xs"
            weight="medium"
            muted
            className="tracking-wide uppercase"
          >
            {label}
          </Text>
        </View>
      ) : null}
      {textChildren(children)}
    </View>
  );
};
