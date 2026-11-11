import { View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";

import { cn } from "../../lib/utils";
import { PANEL_FILL } from "./constants";
import { SwipeContext } from "./context";
import { SwipeMovingRow, SwipePanelLayer } from "./layers";
import type { SwipeHandle, SwipeProps } from "./types";
import { useSwipeModel } from "./use-swipe";

export const SwipeRoot = forwardRef<SwipeHandle, SwipeProps>(
  (
    {
      className,
      contentClassName,
      children,
      disabled,
      fullSwipe,
      haptics,
      onOpenChange,
      onLongPress,
      ...props
    },
    ref
  ) => {
    const model = useSwipeModel(
      { children, disabled, fullSwipe, haptics, onOpenChange },
      ref
    );
    const context = useMemo(() => ({ close: model.close }), [model.close]);
    return (
      <SwipeContext.Provider value={context}>
        <View
          {...props}
          className={cn("relative w-full overflow-hidden", className)}
          onLongPress={(event) => {
            void model.accessibilityMenu();
            onLongPress?.(event);
          }}
        >
          {model.hasStart ? (
            <SwipePanelLayer
              signal={model.signal}
              side="start"
              fill={PANEL_FILL[model.startActions[0]?.color ?? "default"]}
              id={model.startLayout.id}
            >
              {model.startNode}
            </SwipePanelLayer>
          ) : null}
          {model.hasEnd ? (
            <SwipePanelLayer
              signal={model.signal}
              side="end"
              fill={PANEL_FILL[model.endActions.at(-1)?.color ?? "default"]}
              id={model.endLayout.id}
            >
              {model.endNode}
            </SwipePanelLayer>
          ) : null}
          <SwipeMovingRow
            signal={model.signal}
            sign={model.sign}
            pan={model.pan}
            className={contentClassName}
          >
            {model.row}
          </SwipeMovingRow>
        </View>
      </SwipeContext.Provider>
    );
  }
);
SwipeRoot.displayName = "Swipe";
