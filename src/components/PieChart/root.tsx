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
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { useChartPalette } from "../../theme/use-chart-palette";
import { PieChartContext, PieOrderContext } from "./context";
import type { PieHitTarget } from "./context";
import { PieGraphicLayer } from "./layers";
import { pieSlices, pieTotal } from "./math";
import { PieChartPointer } from "./pointer";
import type { PieChartHandle, PieChartProps } from "./types";

const LIFT = 8;
const MAX_CHART_SIZE = 8192;
const SLOTS = new Set(["svg", "overlay", "header", "footer"]);
export const PieChartRoot = forwardRef<PieChartHandle, PieChartProps>(
  (
    {
      className,
      data,
      size,
      innerRadius = 0,
      startAngle = 0,
      endAngle = 360,
      padAngle = 0,
      minAngle = 0,
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
    const measurement = useElementLayout(
      true,
      [size, className],
      undefined,
      false
    );
    const requestedSize = size ?? Math.round(measurement.layout?.width ?? 0);
    const box =
      Number.isFinite(requestedSize) &&
      requestedSize > 0 &&
      requestedSize <= MAX_CHART_SIZE
        ? requestedSize
        : 0;
    const radius = Math.max(box / 2 - LIFT, 0);
    const hole = radius * Math.max(0, Math.min(innerRadius, 0.95));
    const origin = startAngle / 360;
    const span = Math.min(Math.max(endAngle - startAngle, 0), 360) / 360;
    const total = useMemo(() => pieTotal(data), [data]);
    const slices = useMemo(
      () => pieSlices(data, total, origin, span, padAngle, minAngle),
      [data, total, origin, span, padAngle, minAngle]
    );
    const [internalActive, setInternalActive] = useState(-1);
    const controlled = activeProp !== undefined;
    const activeIndex = controlled ? activeProp : internalActive;
    const setActiveIndex = useCallback(
      (index: number) => {
        if (!controlled) {
          setInternalActive(index);
        }
        onActiveIndexChange?.(index);
      },
      [controlled, onActiveIndexChange]
    );
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartCubicOut);
    const playReveal = useCallback(() => {
      reveal.setImmediate(reduced ? 1 : 0);
      if (!reduced) {
        reveal.timingTo(1, animationDuration);
      }
    }, [reduced, animationDuration, reveal.setImmediate, reveal.timingTo]);
    const revealed = useRef(false);
    const loading = status === "loading";
    useEffect(() => {
      if (loading) {
        revealed.current = false;
        reveal.setImmediate(0);
        return;
      }
      if (revealed.current || box <= 0 || !slices.length) {
        return;
      }
      revealed.current = true;
      playReveal();
    }, [loading, box, slices.length, playReveal, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay: playReveal }), [playReveal]);
    const colors = useChartPalette(data);
    const [graphics] = useState(createChartGraphicsStore);
    const [targets] = useState(() => new Map<string, PieHitTarget>());
    useEffect(() => {
      if (measurement.layout) {
        onLayout?.({
          nativeEvent: {
            layout: {
              height: box,
              width: box,
              x: measurement.layout.left,
              y: measurement.layout.top,
            },
          },
        });
      }
    }, [measurement.layout, box, onLayout]);
    const context = useMemo(
      () => ({
        activeIndex,
        colors,
        data,
        graphics,
        hole,
        origin,
        radius,
        reveal: reveal.signal,
        setActiveIndex,
        size: box,
        slices,
        span,
        status,
        targets,
        total,
      }),
      [
        data,
        total,
        box,
        radius,
        hole,
        colors,
        slices,
        origin,
        span,
        reveal.signal,
        status,
        activeIndex,
        setActiveIndex,
        graphics,
        targets,
      ]
    );
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => {
        const requested = (child.type as { slot?: string }).slot ?? "overlay";
        return {
          child,
          order,
          slot: SLOTS.has(requested) ? requested : "overlay",
        };
      });
    return (
      <PieChartContext.Provider value={context}>
        <View {...props} className={cn("flex w-full flex-col", className)}>
          {parts
            .filter((part) => part.slot === "header")
            .map(({ child, order }) => (
              <PieOrderContext.Provider key={child.key ?? order} value={order}>
                {child}
              </PieOrderContext.Provider>
            ))}
          <View
            id={measurement.id}
            className={cn(
              "relative flex items-center justify-center",
              size === undefined ? "w-full" : "self-center"
            )}
            style={
              size === undefined
                ? {
                    aspectRatio: 1,
                    ...(box > 0 ? { height: `${box * 2}rpx` } : {}),
                  }
                : { height: `${box * 2}rpx`, width: `${box * 2}rpx` }
            }
          >
            {box > 0 ? (
              <>
                <PieGraphicLayer />
                {parts
                  .filter((part) => part.slot === "svg")
                  .map(({ child, order }) => (
                    <PieOrderContext.Provider
                      key={child.key ?? order}
                      value={order}
                    >
                      {child}
                    </PieOrderContext.Provider>
                  ))}
                <PieChartPointer />
                <View
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    height: `${box * 2}rpx`,
                    pointerEvents: "none",
                    width: `${box * 2}rpx`,
                  }}
                >
                  {parts
                    .filter((part) => part.slot === "overlay")
                    .map(({ child, order }) => (
                      <View
                        key={child.key ?? order}
                        style={{ display: "contents", pointerEvents: "auto" }}
                      >
                        {child}
                      </View>
                    ))}
                </View>
              </>
            ) : null}
          </View>
          {parts
            .filter((part) => part.slot === "footer")
            .map(({ child, order }) => (
              <PieOrderContext.Provider key={child.key ?? order} value={order}>
                {child}
              </PieOrderContext.Provider>
            ))}
        </View>
      </PieChartContext.Provider>
    );
  }
);
PieChartRoot.displayName = "PieChart";
