import { View } from "@tarojs/components";
import { Children, isValidElement, useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";

import { useDirection, useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useSplitterConfiguration } from "./configuration";
import {
  BoundaryIndexContext,
  PanelIndexContext,
  SplitterContext,
} from "./context";
import { SplitterHandle } from "./handle";
import { SplitterPanel } from "./panel";
import type { SplitterPanelProps, SplitterProps } from "./types";
import { useSplitterLayoutState } from "./use-layout-state";
import { splitterVariants } from "./variants";

export type {
  SplitterOrientation,
  SplitterProps,
  SplitterPanelProps,
  SplitterHandleProps,
} from "./types";
export {
  DEFAULT_MAX_SIZE,
  DEFAULT_MIN_SIZE,
  isCollapsed,
  layoutOffset,
  normalizeConstraint,
  panelFloor,
  resetLayout,
  resizeLayout,
  resolveLayout,
} from "./splitter-math";
export type {
  SplitterConstraint,
  SplitterConstraintInput,
} from "./splitter-math";
const SplitterRoot = ({
  className,
  orientation = "horizontal",
  layout,
  defaultLayout,
  onLayoutChange,
  disabled = false,
  step = 5,
  children,
  onLayout,
  id,
  style,
  ...props
}: SplitterProps) => {
  const sign = useDirectionSign();
  const direction = useDirection();
  const items = Children.toArray(children);
  const panels = items.filter(
    (child): child is ReactElement<SplitterPanelProps> =>
      isValidElement<SplitterPanelProps>(child) && child.type === SplitterPanel
  );
  const configuration = useSplitterConfiguration(panels, {
    defaultLayout,
    layout,
  });
  const resetOrigin = useRef({
    count: panels.length,
    layout: configuration.initial,
  });
  if (
    resetOrigin.current.count !== panels.length ||
    (layout === undefined &&
      resetOrigin.current.layout !== configuration.initial)
  ) {
    resetOrigin.current = {
      count: panels.length,
      layout: configuration.initial,
    };
  }
  const live = useSplitterLayoutState(
    configuration.initial,
    layout !== undefined,
    onLayoutChange
  );
  const measureInputs = useMemo(
    () => ({ className, orientation, style }),
    [className, style, orientation]
  );
  const measured = useElementLayout(true, measureInputs, id, false);
  const available =
    (orientation === "horizontal"
      ? measured.layout?.width
      : measured.layout?.height) ?? 0;
  useEffect(() => {
    if (measured.layout) {
      onLayout?.(measured.layout);
    }
  }, [measured.layout, onLayout]);
  const context = {
    ...configuration,
    initial: resetOrigin.current.layout,
    ...live,
    available,
    disabled,
    measured: available > 0,
    orientation,
    sign,
    step: Number.isFinite(step) && step > 0 ? step : 5,
  };
  let panelIndex = -1;
  const laidOut = items.map((child, index) => {
    if (isValidElement(child) && child.type === SplitterPanel) {
      panelIndex += 1;
      return (
        <PanelIndexContext.Provider
          key={`panel-${panelIndex}`}
          value={panelIndex}
        >
          {child}
        </PanelIndexContext.Provider>
      );
    }
    if (isValidElement(child) && child.type === SplitterHandle) {
      return (
        <BoundaryIndexContext.Provider
          key={`handle-${index}`}
          value={panelIndex}
        >
          {child}
        </BoundaryIndexContext.Provider>
      );
    }
    return child;
  });
  return (
    <SplitterContext.Provider value={context}>
      <View
        {...props}
        id={measured.id}
        className={cn(
          "flex",
          splitterVariants({ orientation }).root({ className })
        )}
        style={mergeStyle(
          {
            direction: orientation === "horizontal" ? direction : undefined,
          },
          style
        )}
      >
        {laidOut}
      </View>
    </SplitterContext.Provider>
  );
};
export const Splitter = Object.assign(SplitterRoot, {
  Handle: SplitterHandle,
  Panel: SplitterPanel,
});
