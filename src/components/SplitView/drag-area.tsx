import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useEffect, useMemo, useRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { useSplitViewContext } from "./context";
import { clamp } from "./split-view-math";
import type { SplitViewDragAreaProps } from "./types";
import { useSplitDrag } from "./use-drag";
import { splitViewVariants } from "./variants";

export const SplitViewDragArea = ({
  className,
  accessibilityLabel = "Resize panes",
  children,
  onLayout,
  id,
  style,
  ...props
}: SplitViewDragAreaProps) => {
  const context = useSplitViewContext("SplitView.DragArea");
  const input = useMemo(
    () => ({ children, className, style, variant: context.variant }),
    [children, className, style, context.variant]
  );
  const measured = useElementLayout(true, input, id, false);
  const { measureDragArea } = context;
  useEffect(() => {
    if (measured.layout) {
      measureDragArea(measured.layout.height);
      onLayout?.(measured.layout);
    }
  }, [measured.layout, measureDragArea, onLayout]);
  const drag = useSplitDrag(context);
  const latest = useRef(context);
  latest.current = context;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const adjust = async () => {
    const requested = latest.current;
    if (requested.disabled || requested.points.length === 0) {
      return;
    }
    drag.onTouchCancel();
    try {
      const { tapIndex } = await showActionSheet({
        itemList: ["Next snap point", "Previous snap point"],
      });
      const owner = latest.current;
      if (
        !mounted.current ||
        owner.disabled ||
        owner.points !== requested.points
      ) {
        return;
      }
      if (tapIndex !== 0 && tapIndex !== 1) {
        return;
      }
      const index = clamp(
        owner.snapIndex + (tapIndex === 0 ? 1 : -1),
        0,
        owner.points.length - 1
      );
      if (index !== owner.snapIndex) {
        owner.snapTo(index);
      }
    } catch {
      return false;
    }
  };
  return (
    <View
      {...props}
      id={measured.id}
      style={style}
      catchMove={!context.disabled && context.points.length > 0}
      role="separator"
      aria-role="adjustable"
      aria-label={accessibilityLabel}
      aria-description="Touch and hold for snap point actions."
      aria-disabled={context.disabled}
      aria-valuemin={0}
      aria-valuemax={Math.max(context.points.length - 1, 0)}
      aria-valuenow={context.snapIndex}
      className={cn(
        "flex shrink-0",
        splitViewVariants({ variant: context.variant }).dragArea({ className })
      )}
      onTouchStart={(event) => {
        props.onTouchStart?.(event);
        drag.onTouchStart(event);
      }}
      onTouchMove={async (event) => {
        props.onTouchMove?.(event);
        await drag.onTouchMove(event);
      }}
      onTouchEnd={(event) => {
        props.onTouchEnd?.(event);
        drag.onTouchEnd(event);
      }}
      onTouchCancel={(event) => {
        props.onTouchCancel?.(event);
        drag.onTouchCancel();
      }}
      onLongPress={async (event) => {
        props.onLongPress?.(event);
        await adjust();
      }}
    >
      {children}
    </View>
  );
};
