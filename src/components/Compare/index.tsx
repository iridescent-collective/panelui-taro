import { View } from "@tarojs/components";
import { Children, isValidElement, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { CompareContext } from "./context";
import { CompareHandle } from "./handle";
import { CompareBefore, CompareAfter, CompareLabel } from "./parts";
import type { CompareProps } from "./types";
import { useCompareDrag } from "./use-drag";
import { useCompareState } from "./use-state";
import { compareVariants } from "./variants";

export type {
  CompareProps,
  CompareOrientation,
  CompareAfterProps,
  CompareBeforeProps,
  CompareHandleProps,
  CompareLabelProps,
} from "./types";
const compareLayer = (type: unknown): "base" | "clip" | "over" => {
  const layer: unknown =
    typeof type === "function" || (typeof type === "object" && type !== null)
      ? Reflect.get(type, "layer")
      : undefined;
  if (layer === "base" || layer === "clip") {
    return layer;
  }
  return "over";
};
const CompareRoot = ({
  className,
  height = 240,
  value,
  defaultValue = 0.5,
  onValueChange,
  onValueCommit,
  orientation = "horizontal",
  disabled = false,
  step = 0.05,
  haptics = true,
  children,
  id,
  style,
  onLayout,
  ...props
}: CompareProps) => {
  const state = useCompareState({
    defaultValue,
    onValueChange,
    onValueCommit,
    value,
  });
  const sign = useDirectionSign();
  const input = useMemo(
    () => ({ className, height, style }),
    [className, height, style]
  );
  const measured = useElementLayout(true, input, id, false);
  const width = Math.round(measured.layout?.width ?? 0);
  const boxHeight = Math.round(measured.layout?.height ?? 0);
  useEffect(() => {
    if (measured.layout) {
      onLayout?.(measured.layout);
    }
  }, [measured.layout, onLayout]);
  const drag = useCompareDrag(state, {
    disabled,
    extent: orientation === "horizontal" ? width : boxHeight,
    haptics,
    orientation,
    sign,
  });
  const layers: { base: ReactNode[]; clip: ReactNode[]; over: ReactNode[] } = {
    base: [],
    clip: [],
    over: [],
  };
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }
    const kind = compareLayer(child.type);
    layers[kind].push(child);
  }
  return (
    <CompareContext.Provider
      value={{
        disabled,
        height: boxHeight,
        mirrored: sign === -1,
        nudge: state.nudge,
        orientation,
        ratio: state.ratio,
        step,
        width,
      }}
    >
      <View
        {...props}
        id={measured.id}
        className={cn(
          "relative",
          compareVariants({ orientation }).root({ className })
        )}
        style={mergeStyle({ height: `${height * 2}rpx` }, style)}
        catchMove={!disabled}
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
      >
        {width > 0 && boxHeight > 0 ? (
          <>
            {layers.base}
            {layers.clip}
            {layers.over}
          </>
        ) : null}
      </View>
    </CompareContext.Provider>
  );
};
export const Compare = Object.assign(CompareRoot, {
  After: CompareAfter,
  Before: CompareBefore,
  Handle: CompareHandle,
  Label: CompareLabel,
  displayName: "Compare",
});
