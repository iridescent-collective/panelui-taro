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
import { PolarAreaChartContext, PolarOrderContext } from "./context";
import type { PolarHitTarget } from "./context";
import { PolarGraphicLayer } from "./layers";
import { polarMax, polarRadius, polarWedges } from "./math";
import { PolarAreaChartPointer } from "./pointer";
import type { PolarAreaChartHandle, PolarAreaChartProps } from "./types";

const MAX_CHART_SIZE = 8192;
const SLOTS = new Set(["svg", "overlay", "header", "footer"]);
export const PolarAreaChartRoot = forwardRef<
  PolarAreaChartHandle,
  PolarAreaChartProps
>(
  (
    {
      className,
      data,
      size,
      maxValue: maxValueProp,
      scale = "radius",
      startAngle = 0,
      padAngle = 0,
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
    const radius = Math.max(box / 2, 0);
    const origin = startAngle / 360;
    const maxValue = useMemo(
      () => polarMax(data, maxValueProp),
      [data, maxValueProp]
    );
    const radiusOf = useCallback(
      (value: number) => polarRadius(value, maxValue, radius, scale),
      [maxValue, radius, scale]
    );
    const wedges = useMemo(
      () => polarWedges(data, radius, origin, padAngle, maxValue, scale),
      [data, radius, origin, padAngle, maxValue, scale]
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
      if (revealed.current || box <= 0 || !wedges.length) {
        return;
      }
      revealed.current = true;
      playReveal();
    }, [loading, box, wedges.length, playReveal, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay: playReveal }), [playReveal]);
    const colors = useChartPalette(data, true);
    const [graphics] = useState(createChartGraphicsStore);
    const [targets] = useState(() => new Map<string, PolarHitTarget>());
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
        maxValue,
        origin,
        radius,
        radiusOf,
        reveal: reveal.signal,
        scale,
        setActiveIndex,
        size: box,
        status,
        targets,
        wedges,
      }),
      [
        data,
        maxValue,
        radiusOf,
        scale,
        box,
        radius,
        colors,
        wedges,
        origin,
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
      <PolarAreaChartContext.Provider value={context}>
        <View {...props} className={cn("flex w-full flex-col", className)}>
          {parts
            .filter((part) => part.slot === "header")
            .map(({ child, order }) => (
              <PolarOrderContext.Provider
                key={child.key ?? order}
                value={order}
              >
                {child}
              </PolarOrderContext.Provider>
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
                <PolarGraphicLayer />
                {parts
                  .filter((part) => part.slot === "svg")
                  .map(({ child, order }) => (
                    <PolarOrderContext.Provider
                      key={child.key ?? order}
                      value={order}
                    >
                      {child}
                    </PolarOrderContext.Provider>
                  ))}
                <PolarAreaChartPointer />
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
              <PolarOrderContext.Provider
                key={child.key ?? order}
                value={order}
              >
                {child}
              </PolarOrderContext.Provider>
            ))}
        </View>
      </PolarAreaChartContext.Provider>
    );
  }
);
PolarAreaChartRoot.displayName = "PolarAreaChart";
