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
import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { createObservableValue } from "../../primitives/observable-value";
import { ScatterChartContext, ScatterOrderContext, useChart } from "./context";
import { scatterExtents } from "./math";
import type {
  ScatterChartHandle,
  ScatterChartPoint,
  ScatterChartProps,
} from "./types";

const GraphicLayer = () => {
  const { graphics, width, height } = useChart("ScatterChart graphics");
  const frame = useSyncExternalStore(
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
      {frame.map((part) => part.node)}
    </CanvasGraphics>
  );
};
export const ScatterChartRoot = forwardRef<
  ScatterChartHandle,
  ScatterChartProps
>(
  (
    {
      className,
      data,
      xDataKey = "x",
      status = "ready",
      aspectRatio = 1,
      animationDuration = 650,
      domainDuration = 500,
      xDomain,
      yDomain,
      onActivePointChange,
      compact = false,
      accessible,
      accessibilityLabel,
      accessibilityHint,
      accessibilityLabelForDatum,
      onAccessibilityDatumPress,
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
    const width = measure.layout?.width ?? 0;
    const ratio =
      Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
    const height = width / ratio;
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => ({
        child,
        metadata: child.type as { layer?: string; axis?: string },
        order,
      }));
    const hasYAxis = parts.some((part) => part.metadata.axis === "y");
    const plot = useMemo(() => {
      const pad = compact
        ? { bottom: 4, left: 4, right: 4, top: 4 }
        : { bottom: 22, left: hasYAxis ? 44 : 14, right: 14, top: 14 };
      return {
        height: Math.max(height - pad.top - pad.bottom, 0),
        left: pad.left,
        top: pad.top,
        width: Math.max(width - pad.left - pad.right, 0),
      };
    }, [width, height, compact, hasYAxis]);
    const [series, setSeries] = useState<[string, string][]>([]);
    const registerSeries = useCallback((key: string, color: string) => {
      setSeries((current) =>
        current.find(([name]) => name === key)?.[1] === color
          ? current
          : [...current.filter(([name]) => name !== key), [key, color]]
      );
    }, []);
    const unregisterSeries = useCallback((key: string) => {
      setSeries((current) => current.filter(([name]) => name !== key));
    }, []);
    const extents = useMemo(
      () =>
        scatterExtents(
          data,
          xDataKey,
          series.map(([key]) => key),
          xDomain,
          yDomain
        ),
      [data, xDataKey, series, xDomain, yDomain]
    );
    const [activePoint, setActive] = useState<ScatterChartPoint | null>(null);
    const activeRef = useRef("");
    const setActivePoint = useCallback(
      (point: ScatterChartPoint | null) => {
        const id = point ? `${point.dataKey}:${point.index}` : "";
        if (activeRef.current === id) {
          return;
        }
        activeRef.current = id;
        setActive(point);
        onActivePointChange?.(point);
      },
      [onActivePointChange]
    );
    const reduced = usePanelReducedMotion();
    const [graphics] = useState(createChartGraphicsStore);
    const [domains] = useState(() =>
      createObservableValue<readonly number[]>([0, 0, 0, 0])
    );
    const from = useRef<readonly number[]>(domains.value);
    const to = useRef<readonly number[]>(domains.value);
    const domain = useChartTween(0, undefined, (value) => {
      domains.value = from.current.map(
        (start, index) => start + (to.current[index] - start) * value
      );
    });
    const reveal = useChartTween(0, chartCubicOut);
    const loading = status === "loading";
    useEffect(() => {
      if (loading) {
        return;
      }
      const first = domains.value.every((value) => value === 0);
      from.current = domains.value;
      to.current = [...extents.x, ...extents.y];
      domain.setImmediate(0);
      if (first || reduced) {
        domain.setImmediate(1);
      } else {
        domain.timingTo(1, domainDuration);
      }
    }, [
      loading,
      extents,
      domains,
      reduced,
      domainDuration,
      domain.setImmediate,
      domain.timingTo,
    ]);
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
      if (revealed.current || plot.width <= 0 || !data.length) {
        return;
      }
      revealed.current = true;
      replay();
    }, [loading, plot.width, data.length, replay, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay }), [replay]);
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
    }, [measure.layout, onLayout, width, height]);
    const context = {
      activePoint,
      data,
      domains,
      graphics,
      height,
      plot,
      registerSeries,
      reveal: reveal.signal,
      series,
      setActivePoint,
      status,
      unregisterSeries,
      width,
      xDataKey,
      xExtent: extents.x,
      yExtent: extents.y,
    };
    const render = (layer: string) =>
      parts
        .filter((part) => (part.metadata.layer ?? "svg") === layer)
        .map(({ child, order }) => (
          <ScatterOrderContext.Provider key={child.key ?? order} value={order}>
            {child}
          </ScatterOrderContext.Provider>
        ));
    return (
      <ScatterChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          {render("header")}
          <ChartAccessibilityData
            chart="Scatter chart"
            data={data}
            disabled={accessible === false || loading}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityLabelForDatum={accessibilityLabelForDatum}
            onAccessibilityDatumPress={onAccessibilityDatumPress}
            valueOf={(datum) => [
              [xDataKey, datum[xDataKey]],
              ...series.map(([key]) => [key, datum[key]] as [string, unknown]),
            ]}
          />
          <View
            id={measure.id}
            aria-hidden
            className="relative w-full"
            style={{
              aspectRatio: ratio,
              height: width ? `${height * 2}rpx` : undefined,
            }}
          >
            {plot.width > 0 ? (
              <>
                <GraphicLayer />
                {render("svg")}
                {render("overlay")}
              </>
            ) : null}
          </View>
        </View>
      </ScatterChartContext.Provider>
    );
  }
);
ScatterChartRoot.displayName = "ScatterChart";
