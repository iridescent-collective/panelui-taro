import { View } from "@tarojs/components";

import { CheckIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { useComboboxContext } from "./context";
import type { ComboboxGroupProps, ComboboxItemProps } from "./types";
import { comboboxVariants } from "./variants";

export const ComboboxItem = ({
  value,
  label,
  disabled,
  start,
  description,
}: ComboboxItemProps) => {
  const context = useComboboxContext();
  const selected = context.values.includes(value);
  const slots = comboboxVariants({ itemDisabled: Boolean(disabled), selected });
  const tint = useThemeToken("muted-foreground");
  return (
    <AnimatedPressable
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled), selected }}
      disabled={disabled}
      onPress={() => context.onSelect(value, label)}
      hitSlop={{ bottom: 2, top: 2 }}
      pressScale={1}
      className={slots.item()}
    >
      {start}
      <View className="flex flex-1 flex-col">
        <Text className={slots.itemLabel()}>{label}</Text>
        {description ? (
          <Text size="sm" muted className="truncate">
            {description}
          </Text>
        ) : null}
      </View>
      <View className={slots.itemIndicator({ className: "flex" })}>
        {selected ? <CheckIcon size={16} color={tint} /> : null}
      </View>
    </AnimatedPressable>
  );
};
export const ComboboxGroup = ({
  label,
  className,
  labelClassName,
  children,
}: ComboboxGroupProps) => {
  const slots = comboboxVariants();
  return (
    <View
      className={cn(slots.group({ className: "flex flex-col" }), className)}
    >
      {label ? (
        <View
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
ComboboxItem.displayName = "Combobox.Item";
ComboboxGroup.displayName = "Combobox.Group";
