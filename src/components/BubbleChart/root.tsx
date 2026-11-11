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
import { useSeriesColor } from "../../theme/use-series-color";
import { BubbleChartContext, BubbleOrderContext, useChart } from "./context";
import { bubbleExtents, bubbleSizeExtent, resolveBubbles } from "./math";
import type {
  BubbleChartHandle,
  BubbleChartPoint,
  BubbleChartProps,
} from "./types";

const DEFAULT_RANGE: [number, number] = [10, 28];
const GraphicLayer = () => {
  const { graphics, width, height } = useChart("BubbleChart graphics");
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
export const BubbleChartRoot = forwardRef<BubbleChartHandle, BubbleChartProps>(
  (
    {
      className,
      data,
      xDataKey = "x",
      yDataKey = "y",
      sizeKey,
      labelKey,
      colorKey,
      sizeRange = DEFAULT_RANGE,
      status = "ready",
      aspectRatio = 1,
      animationDuration = 800,
      domainDuration = 500,
      xDomain,
      yDomain,
      onActivePointChange,
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
    const yAxis = parts.filter((part) => part.metadata.axis === "y");
    const yTitle = yAxis.some((part) =>
      Boolean((part.child.props as { label?: string }).label)
    );
    const xTitle = parts.some(
      (part) =>
        part.metadata.axis === "x" &&
        Boolean((part.child.props as { label?: string }).label)
    );
    const [minimumRadius, reach] = sizeRange;
    const plot = useMemo(() => {
      const pad = {
        bottom: Math.max(22, reach) + (xTitle ? 18 : 0),
        left: Math.max(yAxis.length ? 44 + (yTitle ? 18 : 0) : 18, reach),
        right: Math.max(18, reach),
        top: Math.max(18, reach),
      };
      return {
        height: Math.max(height - pad.top - pad.bottom, 0),
        left: pad.left,
        top: pad.top,
        width: Math.max(width - pad.left - pad.right, 0),
      };
    }, [width, height, reach, xTitle, yAxis.length, yTitle]);
    const c1 = useSeriesColor(undefined, 1);
    const c2 = useSeriesColor(undefined, 2);
    const c3 = useSeriesColor(undefined, 3);
    const c4 = useSeriesColor(undefined, 4);
    const c5 = useSeriesColor(undefined, 5);
    const palette = useMemo(() => [c1, c2, c3, c4, c5], [c1, c2, c3, c4, c5]);
    const extents = useMemo(
      () => bubbleExtents(data, xDataKey, yDataKey, xDomain, yDomain),
      [data, xDataKey, yDataKey, xDomain, yDomain]
    );
    const sizeExtent = useMemo(
      () => bubbleSizeExtent(data, sizeKey),
      [data, sizeKey]
    );
    const bubbles = useMemo(
      () =>
        resolveBubbles(
          data,
          xDataKey,
          yDataKey,
          sizeKey,
          labelKey,
          colorKey,
          sizeExtent,
          [minimumRadius, reach],
          palette
        ),
      [
        data,
        xDataKey,
        yDataKey,
        sizeKey,
        labelKey,
        colorKey,
        sizeExtent,
        minimumRadius,
        reach,
        palette,
      ]
    );
    const [activeIndexJS, setActive] = useState(-1);
    const activeRef = useRef(-1);
    const setActivePoint = useCallback(
      (point: BubbleChartPoint | null) => {
        const index = point?.index ?? -1;
        if (activeRef.current === index) {
          return;
        }
        activeRef.current = index;
        setActive(index);
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
      if (revealed.current || plot.width <= 0 || !bubbles.length) {
        return;
      }
      revealed.current = true;
      replay();
    }, [loading, plot.width, bubbles.length, replay, reveal.setImmediate]);
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
      activeIndexJS,
      bubbles,
      data,
      domains,
      graphics,
      height,
      labelKey,
      plot,
      reveal: reveal.signal,
      setActivePoint,
      sizeExtent,
      sizeRange,
      status,
      width,
      xDataKey,
      xExtent: extents.x,
      yDataKey,
      yExtent: extents.y,
    };
    const render = (layer: string) =>
      parts
        .filter((part) => (part.metadata.layer ?? "svg") === layer)
        .map(({ child, order }) => (
          <BubbleOrderContext.Provider key={child.key ?? order} value={order}>
            {child}
          </BubbleOrderContext.Provider>
        ));
    return (
      <BubbleChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          {render("header")}
          <ChartAccessibilityData
            chart="Bubble chart"
            data={data}
            disabled={accessible === false || loading}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityLabelForDatum={accessibilityLabelForDatum}
            onAccessibilityDatumPress={onAccessibilityDatumPress}
            valueOf={(datum) => {
              const values: [string, unknown][] = [
                [xDataKey, datum[xDataKey]],
                [yDataKey, datum[yDataKey]],
              ];
              if (labelKey) {
                values.unshift([labelKey, datum[labelKey]]);
              }
              if (sizeKey) {
                values.push([sizeKey, datum[sizeKey]]);
              }
              return values;
            }}
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
          {render("footer")}
        </View>
      </BubbleChartContext.Provider>
    );
  }
);
BubbleChartRoot.displayName = "BubbleChart";
