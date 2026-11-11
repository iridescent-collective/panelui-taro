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
import type { Plot } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { createObservableValue } from "../../primitives/observable-value";
import { isStaticSvgNode } from "../../primitives/static-svg";
import { ChartGraphicOrderContext, LineChartContext } from "./context";
import { LineChartLayers } from "./layers";
import { lineChartExtent, lineChartPlot } from "./math";
import type { LineChartDatum, LineChartHandle, LineChartProps } from "./types";
import { LineChartReferenceGraphic } from "./use-graphic";

interface CartesianChartRootProps extends LineChartProps {
  chartLabel: string;
  plotForSize?: (
    width: number,
    height: number,
    compact: boolean,
    hasYAxis: boolean
  ) => Plot;
  extentForData?: (
    data: LineChartDatum[],
    keys: string[],
    yDomain?: [number, number]
  ) => [number, number];
}
export const CartesianChartRoot = forwardRef<
  LineChartHandle,
  CartesianChartRootProps
>(
  (
    {
      className,
      chartLabel,
      plotForSize = lineChartPlot,
      extentForData = lineChartExtent,
      data,
      xDataKey = "date",
      status = "ready",
      aspectRatio = 2,
      animationDuration = 700,
      domainDuration = 500,
      yDomain,
      curve = "monotone",
      onActiveIndexChange,
      accessible,
      accessibilityLabel,
      accessibilityHint,
      accessibilityLabelForDatum,
      onAccessibilityDatumPress,
      compact = false,
      children,
      onLayout,
      ...props
    },
    ref
  ) => {
    const [series, setSeries] = useState<[string, string][]>([]);
    const [activeIndexJS, setActiveIndex] = useState(-1);
    const activeIndexRef = useRef(-1);
    const measurementInputs = useMemo(
      () => [children, className, props.style, aspectRatio],
      [children, className, props.style, aspectRatio]
    );
    const measured = useElementLayout(
      true,
      measurementInputs,
      undefined,
      false
    );
    const width = measured.layout?.width ?? 0;
    const ratio =
      Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 2;
    const height = width / ratio;
    const reduced = usePanelReducedMotion();
    const [graphics] = useState(createChartGraphicsStore);
    const domain = useMemo(
      () => createObservableValue<readonly [number, number]>([0, 0]),
      []
    );
    const domainFrom = useRef<readonly [number, number]>([0, 0]);
    const domainTo = useRef<readonly [number, number]>([0, 0]);
    const domainTween = useChartTween(0, undefined, (value) => {
      domain.value = [
        domainFrom.current[0] +
          (domainTo.current[0] - domainFrom.current[0]) * value,
        domainFrom.current[1] +
          (domainTo.current[1] - domainFrom.current[1]) * value,
      ];
    });
    const reveal = useChartTween(0, chartCubicOut);
    const registerSeries = useCallback((key: string, color: string) => {
      setSeries((current) => {
        const existing = current.find(([name]) => name === key);
        return existing?.[1] === color
          ? current
          : [...current.filter(([name]) => name !== key), [key, color]];
      });
    }, []);
    const unregisterSeries = useCallback(
      (key: string) =>
        setSeries((current) => current.filter(([name]) => name !== key)),
      []
    );
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => ({
        child,
        metadata: child.type as { layer?: string; axis?: string },
        order,
      }));
    const hasYAxis = parts.some(({ metadata }) => metadata.axis === "y");
    const plot = useMemo(
      () => plotForSize(width, height, compact, hasYAxis),
      [width, height, compact, hasYAxis, plotForSize]
    );
    const nextExtent = useMemo(
      () =>
        extentForData(
          data,
          series.map(([key]) => key),
          yDomain
        ),
      [data, series, yDomain, extentForData]
    );
    const [extentMin, extentMax] = nextExtent;
    const extent = useMemo<[number, number]>(
      () => [extentMin, extentMax],
      [extentMin, extentMax]
    );
    const loading = status === "loading";
    useEffect(() => {
      if (loading) {
        return;
      }
      const first = domain.value[0] === 0 && domain.value[1] === 0;
      domainFrom.current = domain.value;
      domainTo.current = extent;
      domainTween.setImmediate(0);
      if (first || reduced) {
        domainTween.setImmediate(1);
      } else {
        domainTween.timingTo(1, domainDuration);
      }
    }, [
      extent,
      loading,
      reduced,
      domainDuration,
      domain,
      domainTween.setImmediate,
      domainTween.timingTo,
    ]);
    const playReveal = useCallback(() => {
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
      playReveal();
    }, [loading, plot.width, data.length, playReveal, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay: playReveal }), [playReveal]);
    const mounted = useRef(false);
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);
    const handleActiveIndex = useCallback(
      (index: number) => {
        if (!mounted.current || activeIndexRef.current === index) {
          return;
        }
        activeIndexRef.current = index;
        setActiveIndex(index);
        onActiveIndexChange?.(index, index >= 0 ? (data[index] ?? null) : null);
      },
      [data, onActiveIndexChange]
    );
    useEffect(() => {
      if (activeIndexJS !== -1 && (activeIndexJS >= data.length || loading)) {
        handleActiveIndex(-1);
      }
    }, [activeIndexJS, data.length, loading, handleActiveIndex]);
    useEffect(() => {
      if (measured.layout) {
        onLayout?.({
          nativeEvent: {
            layout: {
              height,
              width,
              x: measured.layout.left,
              y: measured.layout.top,
            },
          },
        });
      }
    }, [measured.layout, width, height, onLayout]);
    const context = useMemo(
      () => ({
        activeIndexJS,
        curve,
        data,
        domain,
        extent,
        graphics,
        height,
        plot,
        registerSeries,
        reveal: reveal.signal,
        series,
        setActiveIndexJS: handleActiveIndex,
        status,
        unregisterSeries,
        width,
        xDataKey,
      }),
      [
        data,
        xDataKey,
        plot,
        width,
        height,
        status,
        curve,
        series,
        registerSeries,
        unregisterSeries,
        domain,
        extent,
        activeIndexJS,
        handleActiveIndex,
        graphics,
        reveal.signal,
      ]
    );
    return (
      <LineChartContext.Provider value={context}>
        <View {...props} className={cn("relative w-full", className)}>
          {parts
            .filter(({ metadata }) => metadata.layer === "header")
            .map(({ child, order }) => (
              <ChartGraphicOrderContext.Provider
                key={child.key ?? order}
                value={order}
              >
                {child}
              </ChartGraphicOrderContext.Provider>
            ))}
          <ChartAccessibilityData
            chart={chartLabel}
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
            id={measured.id}
            aria-hidden
            className="relative w-full"
            style={{
              aspectRatio: ratio,
              height: width > 0 ? `${height * 2}rpx` : undefined,
            }}
          >
            {plot.width > 0 ? (
              <>
                <LineChartLayers reveal={reveal.signal} />
                {parts
                  .filter(({ metadata }) => metadata.layer !== "header")
                  .map(({ child, order }) => (
                    <ChartGraphicOrderContext.Provider
                      key={child.key ?? order}
                      value={order}
                    >
                      {isStaticSvgNode(child) ? (
                        <LineChartReferenceGraphic>
                          {child}
                        </LineChartReferenceGraphic>
                      ) : (
                        child
                      )}
                    </ChartGraphicOrderContext.Provider>
                  ))}
              </>
            ) : null}
          </View>
        </View>
      </LineChartContext.Provider>
    );
  }
);
CartesianChartRoot.displayName = "CartesianChart";
export const LineChartRoot = forwardRef<LineChartHandle, LineChartProps>(
  (props, ref) => (
    <CartesianChartRoot {...props} ref={ref} chartLabel="Line chart" />
  )
);
LineChartRoot.displayName = "LineChart";
