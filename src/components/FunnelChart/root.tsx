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

import { useDirection } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartLinear, useChartTween } from "../../primitives/chart-tween";
import { useSeriesColor } from "../../theme/use-series-color";
import {
  FUNNEL_DEFAULT_HEIGHT,
  FUNNEL_DEFAULT_LAYERS,
  FUNNEL_DEFAULT_GAP,
  FUNNEL_DEFAULT_FLOOR,
  FUNNEL_ANIMATION_DURATION,
  FUNNEL_STAGGER,
  FUNNEL_CURVE,
  FUNNEL_FADE,
} from "./constants";
import { FunnelChartContext, FunnelOrderContext } from "./context";
import type { FunnelChartContextValue } from "./context";
import { FunnelGraphicLayer, FunnelPointer } from "./layers";
import { funnelModel } from "./math";
import type { FunnelChartProps, FunnelChartHandle } from "./types";

const SLOTS = new Set(["svg", "overlay", "header", "footer"]);
export const FunnelChartRoot = forwardRef<FunnelChartHandle, FunnelChartProps>(
  (
    {
      data,
      height = FUNNEL_DEFAULT_HEIGHT,
      stageSize,
      gap = FUNNEL_DEFAULT_GAP,
      layers = FUNNEL_DEFAULT_LAYERS,
      edges = "curved",
      minWidth = FUNNEL_DEFAULT_FLOOR,
      color,
      animationDuration = FUNNEL_ANIMATION_DURATION,
      staggerDelay = FUNNEL_STAGGER,
      status = "ready",
      activeIndex: activeProp,
      onActiveIndexChange,
      children,
      className,
      onLayout,
      ...props
    },
    ref
  ) => {
    const direction = useDirection();
    const measurement = useElementLayout(
      true,
      [className, height],
      undefined,
      false
    );
    const width = Math.round(measurement.layout?.width ?? 0);
    const model = useMemo(
      () =>
        funnelModel(
          data,
          width,
          height,
          stageSize,
          gap,
          minWidth,
          direction === "rtl",
          animationDuration,
          staggerDelay
        ),
      [
        data,
        width,
        height,
        stageSize,
        gap,
        minWidth,
        direction,
        animationDuration,
        staggerDelay,
      ]
    );
    const hue = useSeriesColor(color, 1);
    const colors = useMemo(
      () => data.map((stage) => stage.color ?? hue),
      [data, hue]
    );
    const strengths = useMemo(
      () =>
        data.map((stage, index) =>
          stage.color || data.length < 2
            ? 1
            : 1 - (index / (data.length - 1)) * FUNNEL_FADE
        ),
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
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartLinear);
    const replay = useCallback(() => {
      reveal.setImmediate(reduced ? 1 : 0);
      if (!reduced) {
        reveal.timingTo(1, model.total);
      }
    }, [reduced, model.total, reveal.setImmediate, reveal.timingTo]);
    const revealed = useRef(false);
    const loading = status === "loading";
    useEffect(() => {
      if (loading) {
        revealed.current = false;
        reveal.setImmediate(0);
        return;
      }
      if (revealed.current || !model.bands.length) {
        return;
      }
      revealed.current = true;
      replay();
    }, [loading, model.bands.length, replay, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay }), [replay]);
    const [graphics] = useState(createChartGraphicsStore);
    const [targets] = useState(
      () =>
        new Map<
          string,
          {
            id: string;
            index: number;
            order: number;
            hit: (x: number, y: number) => boolean;
          }
        >()
    );
    const context: FunnelChartContextValue = {
      ...model,
      activeIndex,
      colors,
      curve: edges === "curved" ? FUNNEL_CURVE : 0,
      data,
      graphics,
      height,
      layers: Math.max(1, Math.round(layers)),
      reveal: reveal.signal,
      setActiveIndex,
      status,
      strengths,
      targets,
      width,
    };
    const outer = useElementLayout(
      Boolean(onLayout),
      [height, children],
      props.id,
      false
    );
    useEffect(() => {
      if (outer.layout) {
        onLayout?.({
          nativeEvent: {
            layout: {
              height: outer.layout.height,
              width: outer.layout.width,
              x: outer.layout.left,
              y: outer.layout.top,
            },
          },
        });
      }
    }, [outer.layout, onLayout]);
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
    const render = (slot: string) =>
      parts
        .filter((part) => part.slot === slot)
        .map(({ child, order }) => (
          <FunnelOrderContext.Provider key={child.key ?? order} value={order}>
            {child}
          </FunnelOrderContext.Provider>
        ));
    return (
      <FunnelChartContext.Provider value={context}>
        <View
          {...props}
          id={props.id ?? outer.id}
          className={cn("flex w-full flex-col", className)}
        >
          {render("header")}
          <View
            id={measurement.id}
            className="relative w-full"
            style={{ height: `${height * 2}rpx` }}
          >
            {width > 0 && height > 0 ? (
              <>
                <FunnelGraphicLayer />
                {render("svg")}
                <FunnelPointer />
                <View
                  className="absolute inset-0"
                  style={{ pointerEvents: "none" }}
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
          {render("footer")}
        </View>
      </FunnelChartContext.Provider>
    );
  }
);
FunnelChartRoot.displayName = "FunnelChart";
