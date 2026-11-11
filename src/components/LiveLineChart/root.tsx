import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { useChartTween } from "../../primitives/chart-tween";
import { createObservableValue } from "../../primitives/observable-value";
import { Defs, ClipPath, Rect } from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useThemeToken } from "../../theme/use-theme";
import { LiveLineChartContext, useChart } from "./context";
import { liveLineAccessibility } from "./live-line-accessibility";
import {
  normalizeLiveLinePoints,
  normalizeLiveLineWindow,
  reconcileLiveLineActivePoint,
} from "./live-line-lifecycle";
import type {
  LiveLineChartProps,
  LiveLineChartHandle,
  LiveLinePoint,
  LiveLineMomentum,
  LiveLineChartHeaderProps,
  LiveLineChartTipProps,
  LiveLineChartTooltipProps,
} from "./types";
import { useLiveClock } from "./use-clock";

const GraphicLayer = () => {
  const { graphics, width, height, plot, clipId } = useChart(
    "LiveLineChart graphics"
  );
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
      <Defs>
        <ClipPath id={clipId}>
          <Rect
            x={plot.left}
            y={0}
            width={plot.width}
            height={plot.top + plot.height}
          />
        </ClipPath>
      </Defs>
      {parts.map((part) => part.node)}
    </CanvasGraphics>
  );
};
const extentOf = (
  points: LiveLinePoint[],
  windowMs: number,
  yDomain?: [number, number]
): [number, number] => {
  if (yDomain) {
    return yDomain;
  }
  const from = (points.at(-1)?.time ?? Date.now()) - windowMs;
  const visible = points
    .filter((point) => point.time >= from)
    .map((point) => point.value);
  if (!visible.length) {
    return [0, 1];
  }
  const min = Math.min(...visible);
  const max = Math.max(...visible);
  if (min === max) {
    return [min - 1, max + 1];
  }
  const headroom = (max - min) * 0.12;
  return [min - headroom, max + headroom];
};
const momentumOf = (
  points: LiveLinePoint[],
  extent: [number, number]
): LiveLineMomentum => {
  if (points.length < 2) {
    return "flat";
  }
  const recent = points.slice(-6);
  const change =
    ((recent.at(-1)?.value ?? recent[0].value) - recent[0].value) /
    (Math.abs(extent[1] - extent[0]) || 1);
  if (change > 0.04) {
    return "up";
  }
  return change < -0.04 ? "down" : "flat";
};
const useHeldReading = (
  paused: boolean,
  extent: [number, number],
  latest: LiveLinePoint | null,
  momentum: LiveLineMomentum
) => {
  const held = useRef<{
    extent: [number, number];
    latest: LiveLinePoint | null;
    momentum: LiveLineMomentum;
  } | null>(null);
  if (!paused) {
    held.current = { extent, latest, momentum };
  }
  if (paused && held.current) {
    return held.current;
  }
  return { extent, latest, momentum: paused ? ("flat" as const) : momentum };
};
const momentumColor = (
  colors: LiveLineChartProps["momentumColors"],
  momentum: LiveLineMomentum,
  base: string,
  success: string,
  destructive: string
) => {
  if (!colors) {
    return base;
  }
  if (momentum === "up") {
    return colors.up ?? success;
  }
  if (momentum === "down") {
    return colors.down ?? destructive;
  }
  return colors.flat ?? base;
};
export const LiveLineChartRoot = forwardRef<
  LiveLineChartHandle,
  LiveLineChartProps
>(
  (
    {
      data,
      window: seconds = 30,
      paused = false,
      yDomain,
      domainDuration = 420,
      curve = "monotone",
      maxPoints = 500,
      aspectRatio = 2,
      status = "ready",
      momentumColors,
      color,
      onActivePointChange,
      accessibilityLabel,
      accessibilityHint,
      className,
      children,
      onLayout,
      ...props
    },
    ref
  ) => {
    const measure = useElementLayout(
      true,
      [aspectRatio, className, children],
      undefined,
      false
    );
    const width = measure.layout?.width ?? 0;
    const ratio =
      Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 2;
    const height = width / ratio;
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child) => ({
        child,
        metadata: child.type as {
          layer?: string;
          axis?: string;
          displayName?: string;
        },
      }));
    const hasY = parts.some((part) => part.metadata.axis === "y");
    const plot = useMemo(
      () => ({
        height: Math.max(height - 34, 0),
        left: hasY ? 44 : 10,
        top: 12,
        width: Math.max(width - (hasY ? 44 : 10) - 14, 0),
      }),
      [width, height, hasY]
    );
    const windowMs = normalizeLiveLineWindow(seconds) * 1000;
    const points = useMemo(
      () => normalizeLiveLinePoints(data, maxPoints),
      [data, maxPoints]
    );
    const liveExtent = useMemo(
      () => extentOf(points, windowMs, yDomain),
      [points, windowMs, yDomain]
    );
    const liveLatest = points.at(-1) ?? null;
    const liveMomentum = useMemo(
      () => momentumOf(points, liveExtent),
      [points, liveExtent]
    );
    const { extent, latest, momentum } = useHeldReading(
      paused,
      liveExtent,
      liveLatest,
      liveMomentum
    );
    const reduced = usePanelReducedMotion();
    const now = useLiveClock(
      !paused && status !== "loading" && !reduced,
      paused,
      points
    );
    useImperativeHandle(
      ref,
      () => ({
        sync: () => {
          now.value = Date.now();
        },
      }),
      [now]
    );
    const [domains] = useState(() =>
      createObservableValue<readonly number[]>([0, 0])
    );
    const from = useRef(domains.value);
    const to = useRef(domains.value);
    const tween = useChartTween(0, undefined, (value) => {
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
      to.current = extent;
      tween.setImmediate(0);
      if (first || reduced) {
        tween.setImmediate(1);
      } else {
        tween.timingTo(1, domainDuration);
      }
    }, [
      status,
      domains,
      extent,
      reduced,
      domainDuration,
      tween.setImmediate,
      tween.timingTo,
    ]);
    const [activePoint, setActive] = useState<LiveLinePoint | null>(null);
    const setActivePoint = useCallback(
      (point: LiveLinePoint | null) => {
        setActive(point);
        onActivePointChange?.(point);
      },
      [onActivePointChange]
    );
    useEffect(() => {
      const next = reconcileLiveLineActivePoint(activePoint, points);
      if (next !== activePoint) {
        setActivePoint(next);
      }
    }, [activePoint, points, setActivePoint]);
    const base = useSeriesColor(color, 1);
    const success = useThemeToken("success");
    const destructive = useThemeToken("destructive");
    const resolved = momentumColor(
      momentumColors,
      momentum,
      base,
      success,
      destructive
    );
    const semantic = useMemo(() => {
      let headerFormat: ((value: number) => string) | undefined;
      let tipFormat: ((value: number) => string) | undefined;
      let title: string | undefined;
      let tooltipFormat: ((value: number) => string) | undefined;
      let value: string | undefined;
      for (const part of parts) {
        if (part.metadata.displayName === "LiveLineChart.Header") {
          const header = part.child.props as LiveLineChartHeaderProps;
          title ??= header.title;
          value ??= header.value;
          headerFormat ??= header.formatValue;
        } else if (part.metadata.displayName === "LiveLineChart.Tip") {
          tipFormat ??= (part.child.props as LiveLineChartTipProps).formatValue;
        } else if (part.metadata.displayName === "LiveLineChart.Tooltip") {
          tooltipFormat ??= (part.child.props as LiveLineChartTooltipProps)
            .formatValue;
        }
      }
      return liveLineAccessibility({
        activePoint,
        formatActive:
          tooltipFormat ?? headerFormat ?? tipFormat ?? compactNumber,
        formatLatest: headerFormat ?? tipFormat ?? compactNumber,
        latest,
        momentum,
        name: accessibilityLabel ?? title,
        now: Date.now(),
        paused,
        status,
        valueOverride: value,
        windowSeconds: windowMs / 1000,
      });
    }, [
      parts,
      accessibilityLabel,
      status,
      latest,
      activePoint,
      momentum,
      windowMs,
      paused,
    ]);
    const [graphics] = useState(createChartGraphicsStore);
    const clipId = `panel-live-${useId().replaceAll(":", "")}`;
    const context = {
      activePoint,
      clipId,
      color: resolved,
      curve,
      data: points,
      domains,
      extent,
      graphics,
      height,
      latest,
      momentum,
      now,
      plot,
      setActivePoint,
      status,
      width,
      windowMs,
    };
    const render = (layer: string) =>
      parts
        .filter((part) => (part.metadata.layer ?? "overlay") === layer)
        .map((part) => part.child);
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
    }, [measure.layout, width, height, onLayout]);
    return (
      <LiveLineChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          <View
            role="img"
            aria-role="image"
            aria-label={semantic.label}
            aria-description={accessibilityHint}
            style={{
              height: "2rpx",
              left: "-20000rpx",
              position: "absolute",
              width: "2rpx",
            }}
          />
          {render("header")}
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
      </LiveLineChartContext.Provider>
    );
  }
);
LiveLineChartRoot.displayName = "LiveLineChart";
