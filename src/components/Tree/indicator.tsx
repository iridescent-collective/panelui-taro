import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useDirection } from "../../hooks/use-direction";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronRightIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useTree, useTreeItem } from "./context";
import type { TreeIndicatorProps } from "./types";
import { treeVariants } from "./variants";

export const TreeIndicator = forwardRef<
  ComponentRef<typeof View>,
  TreeIndicatorProps
>(({ className, children, onClick, ...props }, ref) => {
  const { toggleExpanded, size } = useTree("Tree.Indicator");
  const { value, isExpanded, isDisabled, isBranch } =
    useTreeItem("Tree.Indicator");
  const direction = useDirection();
  const reduced = usePanelReducedMotion();
  const openRotation = direction === "rtl" ? -90 : 90;
  const rotation = isExpanded ? openRotation : 0;
  const slot = treeVariants({ size }).indicator({ className });
  if (!isBranch) {
    return <View {...props} ref={ref} className={slot} onClick={onClick} />;
  }
  return (
    <AnimatedPressable
      {...props}
      ref={ref}
      pressScale={1}
      pressOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={isExpanded ? "Collapse" : "Expand"}
      accessibilityState={{ disabled: isDisabled, expanded: isExpanded }}
      disabled={isDisabled}
      className={slot}
      onClick={(event) => {
        event.stopPropagation();
        toggleExpanded(value);
        onClick?.(event);
      }}
    >
      <View
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: reduced ? "none" : "transform 200ms ease",
        }}
      >
        {children ?? <ChevronRightIcon size={size === "sm" ? 14 : 16} />}
      </View>
    </AnimatedPressable>
  );
});
