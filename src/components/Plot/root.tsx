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
import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { createObservableNumber } from "../../primitives/observable-number";
import { createObservableValue } from "../../primitives/observable-value";
import { isStaticSvgNode } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { domainNumber, ChartGraphicOrderContext, PlotContext } from "./context";
import { PlotLayers } from "./layers";
import { plotExtent, plotForSize } from "./math";
import {
  registerPlotSeries,
  unregisterPlotSeries,
  visiblePlotSeries,
} from "./registry";
import type { PlotSeriesRegistration } from "./registry";
import type { PlotHandle, PlotProps } from "./types";
import { PlotReferenceGraphic } from "./use-graphic";

export const PlotRoot = forwardRef<PlotHandle, PlotProps>(
  (
    {
      className,
      data,
      xDataKey = "label",
      status = "ready",
      aspectRatio = 2,
      animationDuration = 700,
      domainDuration = 500,
      yDomain,
      nice = false,
      xScale,
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
    const [registrations, setRegistrations] = useState<
      PlotSeriesRegistration[]
    >([]);
    const series = useMemo(
      () => visiblePlotSeries(registrations),
      [registrations]
    );
    const [activeIndex] = useState(() => createObservableNumber(-1));
    const c1 = useThemeToken("chart-1");
    const c2 = useThemeToken("chart-2");
    const c3 = useThemeToken("chart-3");
    const c4 = useThemeToken("chart-4");
    const c5 = useThemeToken("chart-5");
    const palette = useMemo(() => [c1, c2, c3, c4, c5], [c1, c2, c3, c4, c5]);
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
      setRegistrations((current) => registerPlotSeries(current, key, color));
    }, []);
    const unregisterSeries = useCallback((key: string, color?: string) => {
      setRegistrations((current) => unregisterPlotSeries(current, key, color));
    }, []);
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => ({
        child,
        metadata: child.type as {
          layer?: string;
          axis?: string;
          mark?: string;
        },
        order,
      }));
    const hasYAxis = parts.some(({ metadata }) => metadata.axis === "y");
    const hasBars = parts.some(({ metadata }) => metadata.mark === "band");
    const resolvedScale = xScale ?? (hasBars ? "band" : "point");
    const plot = useMemo(
      () => plotForSize(width, height, compact, hasYAxis),
      [width, height, compact, hasYAxis]
    );
    const nextExtent = useMemo(
      () =>
        plotExtent(
          data,
          series.map(([key]) => key),
          yDomain,
          hasBars,
          nice
        ),
      [data, series, yDomain, hasBars, nice]
    );
    const [extentMin, extentMax] = nextExtent;
    const extent = useMemo<[number, number]>(
      () => [extentMin, extentMax],
      [extentMin, extentMax]
    );
    const loading = status === "loading";
    useEffect(() => {
      if (loading || (!series.length && yDomain === undefined)) {
        domainFrom.current = domain.value;
        domainTo.current = domain.value;
        domainTween.setImmediate(0);
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
      series.length,
      yDomain,
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
        activeIndex.value = index;
        setActiveIndex(index);
        onActiveIndexChange?.(index, index >= 0 ? (data[index] ?? null) : null);
      },
      [data, onActiveIndexChange, activeIndex]
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
        activeIndex,
        activeIndexJS,
        curve,
        data,
        domain,
        domainMax: domainNumber(domain, 1),
        domainMin: domainNumber(domain, 0),
        extent,
        graphics,
        height,
        palette,
        plot,
        registerSeries,
        reveal: reveal.signal,
        series,
        setActiveIndexJS: handleActiveIndex,
        status,
        unregisterSeries,
        width,
        xDataKey,
        xScale: resolvedScale,
      }),
      [
        activeIndex,
        palette,
        resolvedScale,
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
      <PlotContext.Provider value={context}>
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
            chart="Plot"
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
                <PlotLayers reveal={reveal.signal} />
                {parts
                  .filter(({ metadata }) => metadata.layer !== "header")
                  .map(({ child, order }) => (
                    <ChartGraphicOrderContext.Provider
                      key={child.key ?? order}
                      value={order}
                    >
                      {isStaticSvgNode(child) ? (
                        <PlotReferenceGraphic>{child}</PlotReferenceGraphic>
                      ) : (
                        child
                      )}
                    </ChartGraphicOrderContext.Provider>
                  ))}
              </>
            ) : null}
          </View>
        </View>
      </PlotContext.Provider>
    );
  }
);
PlotRoot.displayName = "Plot";
