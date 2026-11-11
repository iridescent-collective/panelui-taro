import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartLinear, useChartTween } from "../../primitives/chart-tween";
import { useSeriesColor } from "../../theme/use-series-color";
import { TreemapChartContext, useChart } from "./context";
import { treemapParts, treemapTiles } from "./math";
import type { TreemapChartProps, TreemapChartHandle } from "./types";

const slotOf = (type: unknown) => {
  const { slot } = type as { slot?: string };
  return slot && ["svg", "overlay", "header", "footer"].includes(slot)
    ? slot
    : "overlay";
};
const GraphicLayer = () => {
  const { graphics, width, height } = useChart("TreemapChart graphics");
  const parts = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  return (
    <CanvasGraphics
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {parts.map((part) => part.node)}
    </CanvasGraphics>
  );
};
export const TreemapChartRoot = forwardRef<
  TreemapChartHandle,
  TreemapChartProps
>(
  (
    {
      data,
      aspectRatio = 1.4,
      gap = 3,
      cornerRadius = 6,
      sort = true,
      maxTiles,
      otherLabel = "Other",
      color,
      minLabelSize = 48,
      animationDuration = 520,
      staggerDelay = 26,
      status = "ready",
      activeIndex: controlled,
      onActiveIndexChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const measure = useElementLayout(
      true,
      [className, aspectRatio, children],
      undefined,
      false
    );
    const width = Math.round(measure.layout?.width ?? 0);
    const ratio =
      Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1.4;
    const height = Math.round(width / ratio);
    const [internal, setInternal] = useState(-1);
    const activeIndex = controlled ?? internal;
    const setActiveIndex = useCallback(
      (index: number) => {
        if (controlled === undefined) {
          setInternal(index);
        }
        onActiveIndexChange?.(index);
      },
      [controlled, onActiveIndexChange]
    );
    const parts = useMemo(
      () => treemapParts(data, sort, maxTiles, otherLabel),
      [data, sort, maxTiles, otherLabel]
    );
    const total = useMemo(
      () => parts.reduce((sum, part) => sum + part.value, 0),
      [parts]
    );
    const hue = useSeriesColor(color, 1);
    const tiles = useMemo(
      () => treemapTiles(parts, width, height, gap, total, hue),
      [parts, width, height, gap, total, hue]
    );
    const stagger = Math.max(0, staggerDelay);
    const span = animationDuration + Math.max(tiles.length - 1, 0) * stagger;
    const windows = useMemo(
      () =>
        tiles.map((_, index) => ({
          from: span > 0 ? (index * stagger) / span : 0,
          to: span > 0 ? (index * stagger + animationDuration) / span : 1,
        })),
      [tiles, span, stagger, animationDuration]
    );
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartLinear);
    const replay = useCallback(() => {
      reveal.setImmediate(reduced ? 1 : 0);
      if (!reduced) {
        reveal.timingTo(1, span);
      }
    }, [reduced, span, reveal.setImmediate, reveal.timingTo]);
    const revealed = useRef(false);
    useEffect(() => {
      if (status === "loading") {
        revealed.current = false;
        reveal.setImmediate(0);
        return;
      }
      if (!revealed.current && tiles.length) {
        revealed.current = true;
        replay();
      }
    }, [status, tiles.length, replay, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay }), [replay]);
    const [graphics] = useState(createChartGraphicsStore);
    const slots = Children.toArray(children)
      .filter(isValidElement)
      .map((child) => ({
        child,
        slot: slotOf(child.type),
      }));
    const render = (slot: string) =>
      slots.filter((part) => part.slot === slot).map((part) => part.child);
    const context = {
      activeIndex,
      cornerRadius,
      graphics,
      height,
      minLabelSize,
      reveal: reveal.signal,
      setActiveIndex,
      status,
      tiles,
      total,
      width,
      windows,
    };
    return (
      <TreemapChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          {render("header")}
          <View
            id={measure.id}
            className="relative w-full"
            style={{
              aspectRatio: ratio,
              height: width ? `${height * 2}rpx` : undefined,
            }}
          >
            {width > 0 && height > 0 ? (
              <>
                <GraphicLayer />
                {render("svg")}
                <View
                  className="absolute top-0 left-0"
                  style={{
                    height: `${height * 2}rpx`,
                    pointerEvents: "none",
                    width: `${width * 2}rpx`,
                  }}
                >
                  {render("overlay")}
                </View>
              </>
            ) : null}
          </View>
          {render("footer")}
        </View>
      </TreemapChartContext.Provider>
    );
  }
);
TreemapChartRoot.displayName = "TreemapChart";
