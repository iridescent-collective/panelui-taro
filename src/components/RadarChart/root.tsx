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
import { isStaticSvgNode } from "../../primitives/static-svg";
import { RadarChartContext, RadarOrderContext } from "./context";
import { RadarGraphicLayer } from "./layers";
import { radarExtent } from "./math";
import type { RadarChartHandle, RadarChartProps } from "./types";
import { RadarReferenceGraphic } from "./use-graphic";

const LABEL_ROOM = { x: 62, y: 26 };
const BARE_ROOM = { x: 6, y: 6 };
const DEFAULT_SIZE = 180;
const REVEAL_DURATION = 620;
export const RadarChartRoot = forwardRef<RadarChartHandle, RadarChartProps>(
  (
    {
      className,
      data,
      axisKey = "axis",
      status = "ready",
      size: fixedSize = DEFAULT_SIZE,
      aspectRatio = 1,
      domain,
      animationDuration = REVEAL_DURATION,
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
    const [series, setSeries] = useState<[string, string][]>([]);
    const [graphics] = useState(createChartGraphicsStore);
    const [domainMin] = useState(() => createObservableNumber(0));
    const [domainMax] = useState(() => createObservableNumber(0));
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartCubicOut);
    const measurement = useElementLayout(
      true,
      [fixedSize, aspectRatio, compact, className, props.style],
      undefined,
      false
    );
    const width = measurement.layout?.width ?? 0;
    const height = measurement.layout?.height ?? 0;
    const room = compact ? BARE_ROOM : LABEL_ROOM;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(Math.min(cx - room.x, cy - room.y), 0);
    const registerSeries = useCallback(
      (key: string, color: string) =>
        setSeries((current) =>
          current.find(([k]) => k === key)?.[1] === color
            ? current
            : [...current.filter(([k]) => k !== key), [key, color]]
        ),
      []
    );
    const unregisterSeries = useCallback(
      (key: string) =>
        setSeries((current) => current.filter(([k]) => k !== key)),
      []
    );
    const seriesKeys = series.map(([key]) => key).join("|");
    const extent = useMemo(
      () => radarExtent(data, seriesKeys ? seriesKeys.split("|") : [], domain),
      [data, domain, seriesKeys]
    );
    const loading = status === "loading";
    useEffect(() => {
      if (!loading) {
        const [min, max] = extent;
        domainMin.value = min;
        domainMax.value = max;
      }
    }, [extent, loading, domainMin, domainMax]);
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
      if (revealed.current || radius <= 0 || !data.length) {
        return;
      }
      revealed.current = true;
      playReveal();
    }, [loading, radius, data.length, playReveal, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay: playReveal }), [playReveal]);
    useEffect(() => {
      if (measurement.layout) {
        onLayout?.({
          nativeEvent: {
            layout: {
              height,
              width,
              x: measurement.layout.left,
              y: measurement.layout.top,
            },
          },
        });
      }
    }, [measurement.layout, width, height, onLayout]);
    const context = useMemo(
      () => ({
        axisKey,
        cx,
        cy,
        data,
        domainMax,
        domainMin,
        graphics,
        height,
        radius,
        registerSeries,
        reveal: reveal.signal,
        series,
        status,
        unregisterSeries,
        width,
      }),
      [
        data,
        axisKey,
        cx,
        cy,
        radius,
        width,
        height,
        status,
        domainMin,
        domainMax,
        reveal.signal,
        series,
        registerSeries,
        unregisterSeries,
        graphics,
      ]
    );
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => {
        const { layer } = child.type as { layer?: string };
        return {
          child,
          layer: layer === "header" || layer === "overlay" ? layer : "svg",
          order,
        };
      });
    const explicit = Boolean(fixedSize);
    const ratio =
      Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
    return (
      <RadarChartContext.Provider value={context}>
        <View {...props} className={cn("flex w-full flex-col", className)}>
          {parts
            .filter((part) => part.layer === "header")
            .map(({ child, order }) => (
              <RadarOrderContext.Provider
                key={child.key ?? order}
                value={order}
              >
                {child}
              </RadarOrderContext.Provider>
            ))}
          <ChartAccessibilityData
            chart="Radar chart"
            data={data}
            disabled={accessible === false || loading}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityLabelForDatum={accessibilityLabelForDatum}
            onAccessibilityDatumPress={onAccessibilityDatumPress}
            valueOf={(datum) => [
              [axisKey, datum[axisKey]],
              ...series.map(([key]) => [key, datum[key]] as [string, unknown]),
            ]}
          />
          <View
            id={measurement.id}
            className={cn(
              "panel-radar-measure relative",
              explicit ? "self-center" : "w-full"
            )}
            aria-hidden
            style={
              explicit
                ? {
                    height: `${(fixedSize + room.y * 2) * 2}rpx`,
                    maxWidth: "100%",
                    width: `${(fixedSize + room.x * 2) * 2}rpx`,
                  }
                : {
                    aspectRatio: ratio,
                    ...(width > 0
                      ? { height: `${(width / ratio) * 2}rpx` }
                      : {}),
                  }
            }
          >
            {radius > 0 ? (
              <>
                <RadarGraphicLayer />
                {parts
                  .filter((part) => part.layer === "svg")
                  .map(({ child, order }) => (
                    <RadarOrderContext.Provider
                      key={child.key ?? order}
                      value={order}
                    >
                      {isStaticSvgNode(child) ? (
                        <RadarReferenceGraphic>{child}</RadarReferenceGraphic>
                      ) : (
                        child
                      )}
                    </RadarOrderContext.Provider>
                  ))}
                {parts
                  .filter((part) => part.layer === "overlay")
                  .map(({ child, order }) => (
                    <RadarOrderContext.Provider
                      key={child.key ?? order}
                      value={order}
                    >
                      {child}
                    </RadarOrderContext.Provider>
                  ))}
              </>
            ) : null}
          </View>
        </View>
      </RadarChartContext.Provider>
    );
  }
);
RadarChartRoot.displayName = "RadarChart";
