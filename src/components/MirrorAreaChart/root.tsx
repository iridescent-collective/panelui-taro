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
import { sortCopy } from "../../lib/sort-copy";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { createObservableValue } from "../../primitives/observable-value";
import {
  MirrorAreaChartContext,
  MirrorOrderContext,
  useChart,
} from "./context";
import { sideExtent } from "./math";
import type {
  MirrorAreaChartProps,
  MirrorAreaChartHandle,
  MirrorSeries,
} from "./types";

const GraphicLayer = () => {
  const { graphics, width, height } = useChart("MirrorAreaChart graphics");
  const parts = useSyncExternalStore(
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
      {parts.filter((part) => part.layer === "grid").map((part) => part.node)}
      {parts.filter((part) => part.layer === "series").map((part) => part.node)}
    </CanvasGraphics>
  );
};
const safeRatio = (ratio: number) =>
  Number.isFinite(ratio) && ratio > 0 ? ratio : 1.6;
const finiteDomain = (
  domain: readonly [number, number] | undefined
): [number, number] | undefined =>
  domain?.every(Number.isFinite) ? [domain[0], domain[1]] : undefined;
export const MirrorAreaChartRoot = forwardRef<
  MirrorAreaChartHandle,
  MirrorAreaChartProps
>(
  (
    {
      data,
      xDataKey = "date",
      split = 0.55,
      topDomain,
      bottomDomain,
      curve = "monotone",
      status = "ready",
      aspectRatio = 1.6,
      animationDuration = 700,
      domainDuration = 500,
      onActiveIndexChange,
      compact = false,
      className,
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
    const ratio = safeRatio(aspectRatio);
    const height = width / ratio;
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => ({
        child,
        metadata: child.type as {
          layer?: string;
          axis?: string;

          area?: boolean;
        },
        order,
      }));
    const hasY = parts.some((part) => part.metadata.axis === "y");
    const pad = useMemo(
      () =>
        compact
          ? { bottom: 2, left: 1, right: 1, top: 2 }
          : { bottom: 30, left: hasY ? 40 : 10, right: 10, top: 12 },
      [compact, hasY]
    );
    const plot = useMemo(
      () => ({
        height: Math.max(0, height - pad.top - pad.bottom),
        left: pad.left,
        top: pad.top,
        width: Math.max(0, width - pad.left - pad.right),
      }),
      [pad, width, height]
    );
    const [registered, setSeries] = useState<MirrorSeries[]>([]);
    const registerSeries = useCallback((series: MirrorSeries) => {
      setSeries((current) => {
        const old = current.find((item) => item.key === series.key);
        if (
          old &&
          old.color === series.color &&
          old.label === series.label &&
          old.side === series.side
        ) {
          return current;
        }
        return [...current.filter((item) => item.key !== series.key), series];
      });
    }, []);
    const unregisterSeries = useCallback(
      (key: string) =>
        setSeries((current) => current.filter((item) => item.key !== key)),
      []
    );
    const declaration = parts
      .filter((part) => part.metadata.area)
      .map((part) => (part.child.props as { dataKey: string }).dataKey)
      .join("\0");
    const series = useMemo(() => {
      const keys = declaration.split("\0");
      const position = (key: string) => {
        const index = keys.indexOf(key);
        return index === -1 ? keys.length : index;
      };
      return sortCopy(registered, (a, b) => position(a.key) - position(b.key));
    }, [registered, declaration]);
    const baseline =
      plot.top +
      plot.height *
        Math.min(Math.max(Number.isFinite(split) ? split : 0.55, 0.1), 0.9);
    const topKeys = series
      .filter((item) => item.side === "top")
      .map((item) => item.key)
      .join("\0");
    const bottomKeys = series
      .filter((item) => item.side === "bottom")
      .map((item) => item.key)
      .join("\0");
    const safeTop = finiteDomain(topDomain);
    const safeBottom = finiteDomain(bottomDomain);
    const topExtent = useMemo(
      () => sideExtent(data, topKeys ? topKeys.split("\0") : [], safeTop),
      [data, topKeys, safeTop?.[0], safeTop?.[1]]
    );
    const bottomExtent = useMemo(
      () =>
        sideExtent(data, bottomKeys ? bottomKeys.split("\0") : [], safeBottom),
      [data, bottomKeys, safeBottom?.[0], safeBottom?.[1]]
    );
    const reduced = usePanelReducedMotion();
    const [domains] = useState(() =>
      createObservableValue<readonly number[]>([0, 0])
    );
    const from = useRef(domains.value);
    const to = useRef(domains.value);
    const domain = useChartTween(0, undefined, (value) => {
      domains.value = from.current.map(
        (start, index) => start + (to.current[index] - start) * value
      );
    });
    useEffect(() => {
      if (status === "loading") {
        return;
      }
      const first = domains.value.every((value) => value === 0);
      from.current = domains.value;
      to.current = [topExtent, bottomExtent];
      domain.setImmediate(0);
      if (first || reduced) {
        domain.setImmediate(1);
      } else {
        domain.timingTo(1, domainDuration);
      }
    }, [
      status,
      domains,
      topExtent,
      bottomExtent,
      reduced,
      domainDuration,
      domain.setImmediate,
      domain.timingTo,
    ]);
    const reveal = useChartTween(0, chartCubicOut);
    const replay = useCallback(() => {
      reveal.setImmediate(reduced ? 1 : 0);
      if (!reduced) {
        reveal.timingTo(1, animationDuration);
      }
    }, [reduced, animationDuration, reveal.setImmediate, reveal.timingTo]);
    const revealed = useRef(false);
    useEffect(() => {
      if (status === "loading") {
        revealed.current = false;
        reveal.setImmediate(0);
      } else if (!revealed.current && plot.width > 0 && data.length) {
        revealed.current = true;
        replay();
      }
    }, [status, plot.width, data.length, replay, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay }), [replay]);
    const [activeIndexJS, setActive] = useState(-1);
    const activeRef = useRef(-1);
    const setActiveIndexJS = useCallback(
      (index: number) => {
        if (activeRef.current === index) {
          return;
        }
        activeRef.current = index;
        setActive(index);
        onActiveIndexChange?.(index, index < 0 ? null : (data[index] ?? null));
      },
      [data, onActiveIndexChange]
    );
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
    }, [measure.layout, onLayout, width, height]);
    const context = {
      activeIndexJS,
      baseline,
      bottomExtent,
      curve,
      data,
      domains,
      graphics,
      grow: reveal.signal,
      height,
      pad,
      plot,
      registerSeries,
      series,
      setActiveIndexJS,
      status,
      topExtent,
      unregisterSeries,
      width,
      xDataKey,
    };
    const render = (layer: string) =>
      parts
        .filter((part) => (part.metadata.layer ?? "svg") === layer)
        .map(({ child, order }) => (
          <MirrorOrderContext.Provider key={child.key ?? order} value={order}>
            {child}
          </MirrorOrderContext.Provider>
        ));
    return (
      <MirrorAreaChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          {render("header")}
          <ChartAccessibilityData
            chart="Mirror area chart"
            data={data}
            disabled={accessible === false || status === "loading"}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityLabelForDatum={accessibilityLabelForDatum}
            onAccessibilityDatumPress={onAccessibilityDatumPress}
            valueOf={(datum) => [
              [xDataKey, datum[xDataKey]],
              ...series.map(
                (item) => [item.label, datum[item.key]] as [string, unknown]
              ),
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
                {render("series")}

                {render("overlay")}
              </>
            ) : null}
          </View>
        </View>
      </MirrorAreaChartContext.Provider>
    );
  }
);
MirrorAreaChartRoot.displayName = "MirrorAreaChart";
