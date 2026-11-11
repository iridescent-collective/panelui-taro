import type { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { useTree, useTreeItem } from "./context";
import type { TreeTriggerProps } from "./types";
import { treeVariants } from "./variants";

export const TreeTrigger = forwardRef<
  ComponentRef<typeof View>,
  TreeTriggerProps
>(
  (
    { className, onPress, onClick, disabled = false, children, ...props },
    ref
  ) => {
    const { toggleExpanded, select, selectionMode, expandOnPress, size } =
      useTree("Tree.Trigger");
    const { value, level, isExpanded, isSelected, isDisabled, isBranch } =
      useTreeItem("Tree.Trigger");
    const selectedColor = useThemeToken("accent-foreground");
    const triggerDisabled = Boolean(isDisabled || disabled);
    return (
      <AnimatedPressable
        {...props}
        ref={ref}
        pressScale={1}
        pressOpacity={1}
        accessibilityRole="button"
        accessibilityState={{
          disabled: triggerDisabled,
          expanded: isBranch ? isExpanded : undefined,
          selected: selectionMode === "none" ? undefined : isSelected,
        }}
        aria-level={level + 1}
        disabled={triggerDisabled}
        className={treeVariants({
          isDisabled: triggerDisabled,
          isSelected,
          size,
        }).trigger({ className })}
        onClick={(event) => {
          if (isBranch && expandOnPress) {
            toggleExpanded(value);
          }
          select(value);
          (onClick ?? onPress)?.(event);
        }}
      >
        <IconColorProvider color={isSelected ? selectedColor : undefined}>
          {children}
        </IconColorProvider>
      </AnimatedPressable>
    );
  }
);
