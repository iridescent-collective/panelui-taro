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
import { useControllableState } from "../../primitives/controllable-state";
import { createObservableValue } from "../../primitives/observable-value";
import { BumpChartContext, BumpOrderContext, useChart } from "./context";
import { BumpLines } from "./graphics";
import { bumpRanks, rankFractions } from "./math";
import type { BumpChartProps, BumpChartHandle, BumpSeries } from "./types";

const cubicInOut = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
const GraphicLayer = () => {
  const { graphics, width, height, plot, reveal, status } =
    useChart("BumpChart graphics");
  const parts = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  const grow = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  return (
    <>
      <CanvasGraphics
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {parts.filter((part) => part.layer === "grid").map((part) => part.node)}
      </CanvasGraphics>
      {status === "ready" ? (
        <View
          className="absolute top-0 overflow-hidden"
          style={{
            height: `${height * 2}rpx`,
            left: `${(plot.left - 8) * 2}rpx`,
            width: `${((plot.width + 8) * grow + 8) * 2}rpx`,
          }}
        >
          <View
            className="absolute top-0"
            style={{
              left: `${-(plot.left - 8) * 2}rpx`,
              width: `${width * 2}rpx`,
            }}
          >
            <CanvasGraphics
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {parts
                .filter((part) => part.layer === "series")
                .map((part) => part.node)}
            </CanvasGraphics>
          </View>
        </View>
      ) : null}
    </>
  );
};
export const BumpChartRoot = forwardRef<BumpChartHandle, BumpChartProps>(
  (
    {
      data,
      xDataKey = "date",
      values = "rank",
      highlight: highlightProp,
      defaultHighlight = null,
      onHighlightChange,
      status = "ready",
      aspectRatio = 1.7,
      animationDuration = 700,
      morphDuration = 500,
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
    const ratio =
      Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1.7;
    const height = width / ratio;
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => ({
        child,
        metadata: child.type as {
          layer?: string;
          axis?: string;
          labels?: boolean;
          line?: boolean;
        },
        order,
      }));
    const hasY = parts.some((part) => part.metadata.axis === "y");
    let labels: (typeof parts)[number] | undefined;
    for (const part of parts) {
      if (part.metadata.labels) {
        labels = part;
      }
    }
    const labelsWidth = labels
      ? ((labels.child.props as { width?: number }).width ?? 84)
      : null;
    const pad = useMemo(
      () =>
        compact
          ? { bottom: 6, left: 6, right: 6, top: 6 }
          : {
              bottom: 32,
              left: hasY ? 42 : 10,
              right: labelsWidth ? labelsWidth + 12 : 10,
              top: 8,
            },
      [compact, hasY, labelsWidth]
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
    const [registered, setSeries] = useState<BumpSeries[]>([]);
    const registerSeries = useCallback((series: BumpSeries) => {
      setSeries((current) => {
        const old = current.find((item) => item.key === series.key);
        if (
          old &&
          old.color === series.color &&
          old.label === series.label &&
          old.strokeWidth === series.strokeWidth &&
          old.showDots === series.showDots
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
      .filter((part) => part.metadata.line)
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
    const ranks = useMemo(
      () =>
        bumpRanks(
          data,
          series.map((item) => item.key),
          { values }
        ),
      [data, series, values]
    );
    const rows = Math.max(
      1,
      ...Object.values(ranks)
        .flat()
        .filter((rank): rank is number => rank !== null)
    );
    const fractions = useMemo(() => rankFractions(ranks, rows), [ranks, rows]);
    const [positions] = useState(() =>
      createObservableValue({ from: fractions, to: fractions })
    );
    const morph = useChartTween(1, cubicInOut);
    const reduced = usePanelReducedMotion();
    const first = useRef(true);
    useEffect(() => {
      const previous = positions.value;
      const current = Object.fromEntries(
        Object.keys(fractions).map((key) => [
          key,
          (previous.to[key] ?? []).map((end, index) => {
            const start = previous.from[key]?.[index];
            if (end === null) {
              return null;
            }
            return start === null || start === undefined
              ? end
              : start + (end - start) * morph.signal.value;
          }),
        ])
      );
      positions.value = {
        from: first.current || reduced ? fractions : current,
        to: fractions,
      };
      morph.setImmediate(first.current || reduced ? 1 : 0);
      first.current = false;
      if (!reduced) {
        morph.timingTo(1, morphDuration);
      }
    }, [
      fractions,
      positions,
      reduced,
      morphDuration,
      morph.setImmediate,
      morph.timingTo,
      morph.signal,
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
    const { value: highlight, setValue: setHighlight } = useControllableState({
      defaultValue: defaultHighlight,
      onChange: onHighlightChange,
      value: highlightProp,
    });
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
      data,
      graphics,
      height,
      highlight,
      morph: morph.signal,
      pad,
      plot,
      positions,
      ranks,
      registerSeries,
      reveal: reveal.signal,
      rows,
      series,
      setActiveIndexJS,
      setHighlight,
      status,
      unregisterSeries,
      width,
      xDataKey,
    };
    const render = (layer: string) =>
      parts
        .filter((part) => (part.metadata.layer ?? "svg") === layer)
        .map(({ child, order }) => (
          <BumpOrderContext.Provider key={child.key ?? order} value={order}>
            {child}
          </BumpOrderContext.Provider>
        ));
    return (
      <BumpChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          {render("header")}
          <ChartAccessibilityData
            chart="Bump chart"
            data={data}
            disabled={accessible === false || status === "loading"}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityLabelForDatum={accessibilityLabelForDatum}
            onAccessibilityDatumPress={onAccessibilityDatumPress}
            valueOf={(datum) => [
              [xDataKey, datum[xDataKey]],
              ...series.map((item) => {
                const rank = ranks[item.key]?.[data.indexOf(datum)];
                return [
                  item.label,
                  rank === null || rank === undefined ? null : `rank ${rank}`,
                ] as [string, unknown];
              }),
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
                <BumpLines />
                {render("overlay")}
              </>
            ) : null}
          </View>
        </View>
      </BumpChartContext.Provider>
    );
  }
);
BumpChartRoot.displayName = "BumpChart";
