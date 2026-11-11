import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { useTree, useTreeItem } from "./context";
import type { TreeIconProps, TreeActionsProps } from "./types";
import { treeVariants } from "./variants";

export const TreeIcon = forwardRef<ComponentRef<typeof View>, TreeIconProps>(
  ({ className, ...props }, ref) => {
    const { size } = useTree("Tree.Icon");
    return (
      <View
        {...props}
        ref={ref}
        className={treeVariants({ size }).icon({ className })}
      />
    );
  }
);
export const TreeLabel = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const { size } = useTree("Tree.Label");
    const { isSelected } = useTreeItem("Tree.Label");
    return (
      <Text
        ref={ref}
        numberOfLines={1}
        className={treeVariants({ isSelected, size }).label({ className })}
        {...props}
      />
    );
  }
);
export const TreeActions = forwardRef<
  ComponentRef<typeof View>,
  TreeActionsProps
>(({ className, onClick, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    onClick={(event) => {
      event.stopPropagation();
      onClick?.(event);
    }}
    className={treeVariants().actions({ className })}
  />
));
