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
import { RingChartContext, RingOrderContext } from "./context";
import type { RingHitTarget } from "./context";
import { RingGraphicLayer } from "./layers";
import { ringRadius } from "./math";
import { RingChartPointer } from "./pointer";
import type { RingChartHandle, RingChartProps } from "./types";

export const RingChartRoot = forwardRef<RingChartHandle, RingChartProps>(
  (
    {
      className,
      data,
      size,
      strokeWidth = 12,
      ringGap = 6,
      startAngle = 0,
      endAngle = 360,
      animationDuration = 700,
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
    const measured = Math.round(measurement.layout?.width ?? 0);
    const box = size ?? measured;
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
    const [graphics] = useState(createChartGraphicsStore);
    const [targets] = useState(() => new Map<string, RingHitTarget>());
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartCubicOut);
    const arc = Math.min(Math.max(endAngle - startAngle, 0), 360) / 360;
    const radiusOf = useCallback(
      (index: number) => ringRadius(box, strokeWidth, ringGap, index),
      [box, strokeWidth, ringGap]
    );
    const playReveal = useCallback(() => {
      reveal.setImmediate(reduced ? 1 : 0);
      if (!reduced) {
        reveal.timingTo(1, animationDuration);
      }
    }, [reduced, animationDuration, reveal.setImmediate, reveal.timingTo]);
    const revealed = useRef(false);
    useEffect(() => {
      if (revealed.current || box <= 0 || !data.length) {
        return;
      }
      revealed.current = true;
      playReveal();
    }, [box, data.length, playReveal]);
    useImperativeHandle(ref, () => ({ replay: playReveal }), [playReveal]);
    const colors = useChartPalette(data);
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
        arc,
        colors,
        data,
        graphics,
        radiusOf,
        reveal: reveal.signal,
        ringGap,
        setActiveIndex,
        size: box,
        startAngle,
        strokeWidth,
        targets,
      }),
      [
        data,
        box,
        strokeWidth,
        ringGap,
        colors,
        reveal.signal,
        activeIndex,
        setActiveIndex,
        radiusOf,
        startAngle,
        arc,
        graphics,
        targets,
      ]
    );
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => {
        const { slot } = child.type as { slot?: string };
        return {
          child,
          order,
          slot: slot === "ring" || slot === "header" ? slot : "overlay",
        };
      });
    return (
      <RingChartContext.Provider value={context}>
        <View {...props} className={cn("flex w-full flex-col", className)}>
          {parts
            .filter((part) => part.slot === "header")
            .map(({ child, order }) => (
              <RingOrderContext.Provider key={child.key ?? order} value={order}>
                {child}
              </RingOrderContext.Provider>
            ))}
          <View
            id={measurement.id}
            className={cn(
              "relative flex items-center justify-center",
              size ? "self-center" : "w-full"
            )}
            style={
              size
                ? { height: `${size * 2}rpx`, width: `${size * 2}rpx` }
                : {
                    aspectRatio: 1,
                    ...(box > 0 ? { height: `${box * 2}rpx` } : {}),
                  }
            }
          >
            {box > 0 ? (
              <>
                <RingGraphicLayer />
                {parts
                  .filter((part) => part.slot === "ring")
                  .map(({ child, order }) => (
                    <RingOrderContext.Provider
                      key={child.key ?? order}
                      value={order}
                    >
                      {child}
                    </RingOrderContext.Provider>
                  ))}
                <RingChartPointer />
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
        </View>
      </RingChartContext.Provider>
    );
  }
);
RingChartRoot.displayName = "RingChart";
