import { View } from "@tarojs/components";
import { useContext, useMemo } from "react";

import { CheckIcon, CircleIcon } from "../../icons";
import { useThemeToken } from "../../theme/use-theme";
import { MenuRadioContext } from "./context";
import { MenuItem } from "./item";
import type {
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
} from "./types";

export const MenuCheckboxItem = ({
  checked = false,
  onCheckedChange,
  onSelect,
  closeOnSelect = false,
  ...props
}: MenuCheckboxItemProps) => {
  const tint = useThemeToken("popover-foreground");
  return (
    <MenuItem
      {...props}
      accessibilityState={{ checked, disabled: props.disabled ?? false }}
      closeOnSelect={closeOnSelect}
      icon={
        checked ? (
          <CheckIcon size={16} strokeWidth={2} color={tint} />
        ) : (
          <View />
        )
      }
      onSelect={() => {
        onCheckedChange?.(!checked);
        onSelect?.();
      }}
    />
  );
};
export const MenuRadioGroup = ({
  value,
  onValueChange,
  className,
  children,
  ...props
}: MenuRadioGroupProps) => {
  const context = useMemo(
    () => ({ select: (next: string) => onValueChange?.(next), value }),
    [value, onValueChange]
  );
  return (
    <MenuRadioContext.Provider value={context}>
      <View {...props} aria-role="radiogroup" className={className}>
        {children}
      </View>
    </MenuRadioContext.Provider>
  );
};
export const MenuRadioItem = ({
  value,
  indicator = "check",
  onSelect,
  closeOnSelect = true,
  ...props
}: MenuRadioItemProps) => {
  const group = useContext(MenuRadioContext);
  const tint = useThemeToken("popover-foreground");
  if (!group) {
    throw new Error("Menu.RadioItem must be used within a <Menu.RadioGroup>");
  }
  const selected = group.value === value;
  let icon = <View />;
  if (selected) {
    icon =
      indicator === "dot" ? (
        <CircleIcon size={8} filled strokeWidth={2} color={tint} />
      ) : (
        <CheckIcon size={16} strokeWidth={2} color={tint} />
      );
  }
  return (
    <MenuItem
      {...props}
      accessibilityState={{ disabled: props.disabled ?? false, selected }}
      closeOnSelect={closeOnSelect}
      icon={icon}
      onSelect={() => {
        group.select(value);
        onSelect?.();
      }}
    />
  );
};
MenuCheckboxItem.displayName = "Menu.CheckboxItem";
MenuRadioGroup.displayName = "Menu.RadioGroup";
MenuRadioItem.displayName = "Menu.RadioItem";
