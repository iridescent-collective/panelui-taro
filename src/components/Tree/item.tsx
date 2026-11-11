import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
} from "react";
import type { ComponentRef } from "react";

import { TreeItemContext, useTree } from "./context";
import { TreeGroup } from "./group";
import type { TreeItemProps } from "./types";
import { treeVariants } from "./variants";

export const TreeItem = forwardRef<ComponentRef<typeof View>, TreeItemProps>(
  (
    { className, value, isDisabled = false, hasChildren, children, ...props },
    ref
  ) => {
    const { expanded, selected } = useTree("Tree.Item");
    const parent = useContext(TreeItemContext);
    const isBranch =
      hasChildren ??
      Children.toArray(children).some(
        (child) => isValidElement(child) && child.type === TreeGroup
      );
    const context = useMemo(
      () => ({
        isBranch,
        isDisabled,
        isExpanded: expanded.includes(value),
        isSelected: selected.includes(value),
        level: parent ? parent.level + 1 : 0,
        value,
      }),
      [value, parent, expanded, selected, isDisabled, isBranch]
    );
    return (
      <TreeItemContext.Provider value={context}>
        <View
          {...props}
          ref={ref}
          className={treeVariants().item({ className })}
        >
          {children}
        </View>
      </TreeItemContext.Provider>
    );
  }
);
