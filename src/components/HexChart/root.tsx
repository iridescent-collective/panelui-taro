import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
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
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { Defs, ClipPath, Rect } from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { HexChartContext, HexOrderContext, useChart } from "./context";
import { hexMetrics, hexRadiusFor, hexRowsFor, hexPlan } from "./math";
import type { HexChartProps, HexChartHandle } from "./types";

const Ellipse = "ellipse" as const;
const GraphicLayer = () => {
  const {
    graphics,
    width,
    height,
    left,
    top,
    fieldWidth,
    fieldHeight,
    shape,
    reveal,
    clipId,
  } = useChart("HexChart graphics");
  const parts = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  const grow = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  return (
    <CanvasGraphics
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <Defs>
        <ClipPath id={clipId}>
          {shape === "blob" ? (
            <Ellipse
              cx={left + fieldWidth / 2}
              cy={top + fieldHeight / 2}
              rx={(fieldWidth / 2) * Math.SQRT2 * grow}
              ry={(fieldHeight / 2) * Math.SQRT2 * grow}
            />
          ) : (
            <Rect x={0} y={0} width={width * grow} height={height} />
          )}
        </ClipPath>
      </Defs>
      {parts.map((part) => part.node)}
    </CanvasGraphics>
  );
};
export const HexChartRoot = forwardRef<HexChartHandle, HexChartProps>(
  (
    {
      className,
      data,
      columns = 21,
      aspectRatio = 1.6,
      density = 0.55,
      shape = "blob",
      cellGap = 0.14,
      animationDuration = 620,
      status = "ready",
      activeIndex: activeProp,
      onActiveIndexChange,
      children,
      onLayout,
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
    const height = aspectRatio > 0 ? width / aspectRatio : 0;
    const columnCount = Math.max(1, Math.round(columns));
    const metrics = useMemo(
      () => hexMetrics(hexRadiusFor(width, columnCount)),
      [width, columnCount]
    );
    const rows = useMemo(() => hexRowsFor(height, metrics), [height, metrics]);
    const fieldWidth = metrics.stepX * (columnCount + 0.5);
    const fieldHeight = (rows - 1) * metrics.stepY + metrics.height;
    const left = (width - fieldWidth) / 2;
    const top = (height - fieldHeight) / 2;
    const loading = status === "loading";
    const plan = useMemo(
      () =>
        hexPlan(
          data,
          metrics,
          rows,
          columnCount,
          shape,
          density,
          cellGap,
          left,
          top,
          fieldWidth,
          loading
        ),
      [
        data,
        metrics,
        rows,
        columnCount,
        shape,
        density,
        cellGap,
        left,
        top,
        fieldWidth,
        loading,
      ]
    );
    const total = useMemo(
      () => data.reduce((sum, series) => sum + Math.max(0, series.value), 0),
      [data]
    );
    const [internal, setInternal] = useState(-1);
    const controlled = activeProp !== undefined;
    const activeIndex = controlled ? activeProp : internal;
    const setActiveIndex = useCallback(
      (index: number) => {
        if (!controlled) {
          setInternal(index);
        }
        onActiveIndexChange?.(index);
      },
      [controlled, onActiveIndexChange]
    );
    const c1 = useSeriesColor(undefined, 1);
    const c2 = useSeriesColor(undefined, 2);
    const c3 = useSeriesColor(undefined, 3);
    const c4 = useSeriesColor(undefined, 4);
    const c5 = useSeriesColor(undefined, 5);
    const palette = useMemo(() => [c1, c2, c3, c4, c5], [c1, c2, c3, c4, c5]);
    const colors = useMemo(
      () =>
        data.map(
          (series, index) => series.color ?? palette[index % palette.length]
        ),
      [data, palette]
    );
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartCubicOut);
    const replay = useCallback(() => {
      reveal.setImmediate(reduced ? 1 : 0);
      if (!reduced) {
        reveal.timingTo(1, animationDuration);
      }
    }, [reduced, animationDuration, reveal.setImmediate, reveal.timingTo]);
    const revealed = useRef(false);
    useEffect(() => {
      if (loading) {
        revealed.current = false;
        reveal.setImmediate(0);
        return;
      }
      if (revealed.current || width <= 0 || !data.length) {
        return;
      }
      revealed.current = true;
      replay();
    }, [loading, width, data.length, replay, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay }), [replay]);
    const clipId = `panelui-hex-${useId().replaceAll(/[^a-zA-Z0-9]/gu, "")}`;
    const [graphics] = useState(createChartGraphicsStore);
    useEffect(() => {
      if (measure.layout) {
        onLayout?.({
          nativeEvent: {
            layout: {
              height,
              width,
              x: measure.layout.left,
              y: measure.layout.top,
            },
          },
        });
      }
    }, [measure.layout, width, height, onLayout]);
    const context = {
      activeIndex,
      clipId,
      colors,
      columns: columnCount,
      data,
      fieldHeight,
      fieldWidth,
      graphics,
      height,
      left,
      metrics,
      plan,
      reveal: reveal.signal,
      rows,
      setActiveIndex,
      shape,
      status,
      top,
      total,
      width,
    };
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => ({
        child,
        order,
        slot: (child.type as { slot?: string }).slot ?? "overlay",
      }));
    const render = (slot: string) =>
      parts
        .filter((part) => part.slot === slot)
        .map(({ child, order }) => (
          <HexOrderContext.Provider key={child.key ?? order} value={order}>
            {child}
          </HexOrderContext.Provider>
        ));
    return (
      <HexChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          {render("header")}
          <View
            id={measure.id}
            className="relative w-full"
            style={{
              aspectRatio,
              height: width > 0 ? `${height * 2}rpx` : undefined,
            }}
          >
            {width > 0 && height > 0 ? (
              <>
                <GraphicLayer />
                {render("svg")}
                {render("overlay")}
              </>
            ) : null}
          </View>
          {render("footer")}
        </View>
      </HexChartContext.Provider>
    );
  }
);
HexChartRoot.displayName = "HexChart";
