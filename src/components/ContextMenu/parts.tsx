import { cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Menu } from "../Menu";
import type { MenuCheckboxItemProps } from "../Menu";
import { CONTEXT_MENU_MIN_WIDTH, CONTEXT_MENU_ROW } from "./constants";
import { ContextMenuContext, useContextMenu } from "./context";
import type { ContextMenuContentProps, ContextMenuItemProps } from "./types";

const useGlyph = (variant: ContextMenuItemProps["variant"]) => {
  const foreground = useThemeToken("overlay-foreground");
  const destructive = useThemeToken("destructive");
  const tint = variant === "destructive" ? destructive : foreground;
  return (icon: ReactNode) => {
    if (!isValidElement(icon)) {
      return icon;
    }
    const element = icon as ReactElement<{ color?: string }>;
    return element.props.color === undefined
      ? cloneElement(element, { color: tint })
      : element;
  };
};
export const ContextMenuItem = ({
  className,
  icon,
  variant,
  ...props
}: ContextMenuItemProps) => {
  const glyph = useGlyph(variant);
  return (
    <Menu.Item
      variant={variant}
      className={cn(CONTEXT_MENU_ROW, className)}
      trailing={icon ? glyph(icon) : undefined}
      {...props}
    />
  );
};
ContextMenuItem.displayName = "ContextMenu.Item";
export const ContextMenuCheckboxItem = ({
  className,
  ...props
}: MenuCheckboxItemProps) => (
  <Menu.CheckboxItem className={cn(CONTEXT_MENU_ROW, className)} {...props} />
);
ContextMenuCheckboxItem.displayName = "ContextMenu.CheckboxItem";
export const ContextMenuContent = ({
  placement = "bottom",
  align = "start",
  offset = 8,
  minWidth = CONTEXT_MENU_MIN_WIDTH,
  scrim = true,
  children,
  ...props
}: ContextMenuContentProps) => {
  const context = useContextMenu("ContextMenu.Content");
  return (
    <Menu.Content
      placement={placement}
      align={align}
      offset={offset}
      minWidth={minWidth}
      scrim={scrim}
      {...props}
    >
      <ContextMenuContext.Provider value={context}>
        {children}
      </ContextMenuContext.Provider>
    </Menu.Content>
  );
};
ContextMenuContent.displayName = "ContextMenu.Content";
