import { View } from "@tarojs/components";
import { useEffect, useMemo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { SplitViewContext } from "./context";
import { SplitViewDragArea } from "./drag-area";
import { SplitViewTop, SplitViewBottom, SplitViewHandle } from "./parts";
import type { SplitViewProps } from "./types";
import { useSplitGeometry } from "./use-geometry";
import { useSplitMotion } from "./use-motion";
import { splitViewVariants } from "./variants";

export { useSplitView } from "./context";
export type {
  SplitViewVariant,
  SplitViewProps,
  SplitViewPaneProps,
  SplitViewDragAreaProps,
  SplitViewHandleProps,
} from "./types";
export {
  DEFAULT_MIN_HEIGHT,
  DEFAULT_SNAP_POINTS,
  nearestSnapIndex,
  normalizeSnapIndex,
  resolveLength,
  resolveSnapPoints,
} from "./split-view-math";
const SplitViewRoot = ({
  className,
  variant = "panes",
  snapPoints,
  minHeight,
  maxHeight,
  defaultSnapIndex,
  snapIndex,
  onSnapIndexChange,
  onSnap,
  disabled = false,
  animateOnMount,
  children,
  onLayout,
  id,
  style,
  ...props
}: SplitViewProps) => {
  const animate = !usePanelReducedMotion();
  const geometry = useSplitGeometry({
    className,
    id,
    maxHeight,
    minHeight,
    snapPoints,
    style,
  });
  const { room, minPx, maxPx, points, dragAreaHeight, measureDragArea } =
    geometry;
  const motion = useSplitMotion(
    { animateOnMount, defaultSnapIndex, onSnap, onSnapIndexChange, snapIndex },
    points,
    animate
  );
  const {
    topHeight,
    dragging,
    snapIndex: currentIndex,
    snapTo,
    writeHeight,
    cancel,
  } = motion;
  const context = useMemo(
    () => ({
      animate,
      cancel,
      disabled,
      dragAreaHeight,
      dragging,
      maxPx,
      measureDragArea,
      measured: room > 0,
      minPx,
      points,
      room,
      snapIndex: currentIndex,
      snapTo,
      topHeight,
      variant,
      writeHeight,
    }),
    [
      variant,
      points,
      minPx,
      maxPx,
      room,
      dragAreaHeight,
      measureDragArea,
      animate,
      disabled,
      topHeight,
      dragging,
      currentIndex,
      snapTo,
      writeHeight,
      cancel,
    ]
  );
  const { layout } = geometry.measured;
  useEffect(() => {
    if (layout) {
      onLayout?.(layout);
    }
  }, [layout, onLayout]);
  return (
    <SplitViewContext.Provider value={context}>
      <View
        {...props}
        id={geometry.measured.id}
        style={style}
        className={cn(
          "flex",
          splitViewVariants({ variant }).root({ className })
        )}
      >
        {children}
      </View>
    </SplitViewContext.Provider>
  );
};
export const SplitView = Object.assign(SplitViewRoot, {
  Bottom: SplitViewBottom,
  DragArea: SplitViewDragArea,
  Handle: SplitViewHandle,
  Top: SplitViewTop,
});
