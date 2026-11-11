import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useDirection } from "../../hooks/use-direction";
import { usePresence } from "../../hooks/use-presence";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import { Collapse } from "../../primitives/collapse";
import { useTree, useTreeItem } from "./context";
import type { TreeGroupProps } from "./types";
import { treeVariants } from "./variants";

export const TreeGroup = forwardRef<ComponentRef<typeof View>, TreeGroupProps>(
  ({ className, children, style, ...props }, ref) => {
    const { showLines, indent } = useTree("Tree.Group");
    const { isExpanded } = useTreeItem("Tree.Group");
    const direction = useDirection();
    const reduced = usePanelReducedMotion();
    const present = usePresence(isExpanded, reduced ? 0 : 200);
    const margin = `${(showLines ? indent / 2 : 0) * 2}rpx`;
    const padding = `${(showLines ? indent / 2 : indent) * 2}rpx`;
    return (
      <Collapse open={isExpanded} duration={200}>
        {present ? (
          <View
            {...props}
            ref={ref}
            aria-hidden={!isExpanded}
            className={treeVariants().group({ className })}
            style={mergeStyle(
              {
                borderLeftWidth: direction === "ltr" && showLines ? "2rpx" : 0,
                borderRightWidth: direction === "rtl" && showLines ? "2rpx" : 0,
                borderStyle: "solid",
                marginLeft: direction === "ltr" ? margin : undefined,
                marginRight: direction === "rtl" ? margin : undefined,
                paddingLeft: direction === "ltr" ? padding : undefined,
                paddingRight: direction === "rtl" ? padding : undefined,
                pointerEvents: isExpanded ? "auto" : "none",
              },
              style
            )}
          >
            {children}
          </View>
        ) : null}
      </Collapse>
    );
  }
);
