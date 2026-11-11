import { useCallback, useMemo, useState } from "react";

import { Popover } from "../Popover";
import { MenuCheckboxItem, MenuRadioGroup, MenuRadioItem } from "./choices";
import { MenuContext } from "./context";
import { MenuItem } from "./item";
import {
  MenuTrigger,
  MenuContent,
  MenuBackground,
  MenuLabel,
  MenuSeparator,
} from "./parts";
import { MenuSub, MenuSubTrigger, MenuSubContent } from "./sub";
import type { MenuProps } from "./types";

export type {
  MenuProps,
  MenuItemVariant,
  MenuTriggerProps,
  MenuContentProps,
  MenuBackgroundProps,
  MenuLabelProps,
  MenuSeparatorProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuRadioIndicator,
  MenuSubProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
} from "./types";
export { MenuCheckboxItem, MenuRadioGroup, MenuRadioItem } from "./choices";
export { MenuItem } from "./item";
export {
  MenuTrigger,
  MenuContent,
  MenuBackground,
  MenuLabel,
  MenuSeparator,
} from "./parts";
export { MenuSub, MenuSubTrigger, MenuSubContent } from "./sub";
const MenuRoot = ({
  children,
  open,
  onOpenChange,
  defaultOpen,
  haptics = false,
  ...props
}: MenuProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  const context = useMemo(
    () => ({ close: () => setOpen(false), haptics }),
    [setOpen, haptics]
  );
  return (
    <MenuContext.Provider value={context}>
      <Popover {...props} open={open ?? internalOpen} onOpenChange={setOpen}>
        {children}
      </Popover>
    </MenuContext.Provider>
  );
};
MenuRoot.displayName = "Menu";
export const Menu = Object.assign(MenuRoot, {
  Background: MenuBackground,
  CheckboxItem: MenuCheckboxItem,
  Content: MenuContent,
  Item: MenuItem,
  Label: MenuLabel,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Separator: MenuSeparator,
  Sub: MenuSub,
  SubContent: MenuSubContent,
  SubTrigger: MenuSubTrigger,
  Trigger: MenuTrigger,
});
