import { View } from "@tarojs/components";
import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Popover } from "../Popover";
import { textChildren, Text } from "../primitives/Text";
import { MenuContext, useMenu } from "./context";
import type {
  MenuBackgroundProps,
  MenuContentProps,
  MenuLabelProps,
  MenuSeparatorProps,
  MenuTriggerProps,
} from "./types";
import { menuVariants } from "./variants";

export const MenuTrigger = ({ children }: MenuTriggerProps) => (
  <Popover.Trigger>{children}</Popover.Trigger>
);
export const MenuBackground = ({
  className,
  children,
  ...props
}: MenuBackgroundProps) => {
  const slots = menuVariants();
  return (
    <View
      {...props}
      aria-hidden
      className={cn(slots.background(), className)}
      style={mergeStyle({ pointerEvents: "none" }, props.style)}
    >
      {children}
    </View>
  );
};
export const MenuContent = ({
  className,
  children,
  scrollable = true,
  ...props
}: MenuContentProps) => {
  const slots = menuVariants();
  const context = useMenu("Menu.Content");
  const items: ReactNode[] = [];
  let background: ReactNode = null;
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === MenuBackground) {
      background = child;
    } else {
      items.push(child);
    }
  }
  return (
    <Popover.Content
      {...props}
      role="menu"
      aria-role="menu"
      scrollable={scrollable}
      unstyled
      background={background ?? <MenuBackground />}
      className={cn("flex flex-col", slots.content(), "shadow-lg", className)}
    >
      <MenuContext.Provider value={context}>
        {textChildren(items)}
      </MenuContext.Provider>
    </Popover.Content>
  );
};
export const MenuLabel = ({
  className,
  inset,
  children,
  ...props
}: MenuLabelProps) => {
  const slots = menuVariants({ inset });
  return (
    <View
      {...props}
      aria-role="heading"
      className={cn("relative", slots.label(), className)}
    >
      {textChildren(children, (text) => (
        <Text
          size="xs"
          weight="medium"
          muted
          className="tracking-wide uppercase"
        >
          {text}
        </Text>
      ))}
    </View>
  );
};
export const MenuSeparator = ({ className, ...props }: MenuSeparatorProps) => {
  const slots = menuVariants();
  return (
    <View
      {...props}
      aria-hidden
      className={cn("relative", slots.separator(), className)}
    />
  );
};
MenuTrigger.displayName = "Menu.Trigger";
MenuContent.displayName = "Menu.Content";
MenuBackground.displayName = "Menu.Background";
MenuLabel.displayName = "Menu.Label";
MenuSeparator.displayName = "Menu.Separator";
