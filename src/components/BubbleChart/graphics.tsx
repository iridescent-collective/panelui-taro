import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useChartTween } from "../../primitives/chart-tween";
import { useSkeletonHandoff } from "../../primitives/skeleton-handoff";
import { G, Circle, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useBubbleFrame, useBubbleGraphic } from "./context";
import { bubbleCircleFrame, bubbleFit, projectBubble } from "./math";
import type {
  BubbleChartGridProps,
  BubbleChartBubblesProps,
  BubbleChartSkeletonProps,
  BubbleChartTrendProps,
  ResolvedBubble,
} from "./types";

export const BubbleChartGrid = Object.assign(
  ({
    rows = 8,
    columns = 8,
    dashArray = "4,6",
    color,
    opacity = 1,
  }: BubbleChartGridProps) => {
    const { plot } = useChart("BubbleChart.Grid");
    const token = useThemeToken("border");
    const node = useMemo(
      () => (
        <G opacity={opacity}>
          {Array.from({ length: rows + 1 }, (_, i) => i / rows).map(
            (fraction) => (
              <SvgLine
                key={`h${fraction}`}
                x1={plot.left}
                x2={plot.left + plot.width}
                y1={plot.top + plot.height * fraction}
                y2={plot.top + plot.height * fraction}
                stroke={color ?? token}
                strokeWidth={1}
                strokeDasharray={dashArray}
              />
            )
          )}
          {Array.from({ length: columns + 1 }, (_, i) => i / columns).map(
            (fraction) => (
              <SvgLine
                key={`v${fraction}`}
                x1={plot.left + plot.width * fraction}
                x2={plot.left + plot.width * fraction}
                y1={plot.top}
                y2={plot.top + plot.height}
                stroke={color ?? token}
                strokeWidth={1}
                strokeDasharray={dashArray}
              />
            )
          )}
        </G>
      ),
      [plot, rows, columns, dashArray, color, token, opacity]
    );
    useBubbleGraphic(node);
    return null;
  },
  { displayName: "BubbleChart.Grid", layer: "svg" as const }
);
const Bubble = ({
  bubble,
  order,
  total,
  opacity,
  color,
}: {
  bubble: ResolvedBubble;
  order: number;
  total: number;
  opacity: number;
  color?: string;
}) => {
  const { plot, activeIndexJS } = useChart("BubbleChart.Bubbles");
  const frame = useBubbleFrame();
  const selected = useChartTween(0);
  const reduced = usePanelReducedMotion();
  useEffect(() => {
    const target = activeIndexJS === bubble.index ? 1 : 0;
    if (reduced) {
      selected.setImmediate(target);
    } else {
      selected.timingTo(target, 140);
    }
  }, [
    activeIndexJS,
    bubble.index,
    reduced,
    selected.setImmediate,
    selected.timingTo,
  ]);
  const selection = useSyncExternalStore(
    selected.signal.subscribe,
    selected.signal.getSnapshot,
    selected.signal.getSnapshot
  );
  const circle = bubbleCircleFrame({
    ...bubble,
    grow: frame.grow,
    opacity,
    order,
    plot,
    selection,
    total,
    xExtent: [frame.xMin, frame.xMax],
    yExtent: [frame.yMin, frame.yMax],
  });
  const node = useMemo(
    () => <Circle {...circle} fill={color ?? bubble.color} />,
    [circle.cx, circle.cy, circle.r, circle.fillOpacity, color, bubble.color]
  );
  useBubbleGraphic(node, order / (total + 1));
  return null;
};
export const BubbleChartBubbles = Object.assign(
  ({ opacity = 0.9, color }: BubbleChartBubblesProps) => {
    const { bubbles, status } = useChart("BubbleChart.Bubbles");
    return status === "loading" ? null : (
      <>
        {bubbles.map((bubble, order) => (
          <Bubble
            key={bubble.index}
            bubble={bubble}
            order={order}
            total={bubbles.length}
            opacity={opacity}
            color={color}
          />
        ))}
      </>
    );
  },
  { displayName: "BubbleChart.Bubbles", layer: "svg" as const }
);
export const BubbleChartSkeleton = Object.assign(
  ({ count = 7, color }: BubbleChartSkeletonProps) => {
    const { plot, status } = useChart("BubbleChart.Skeleton");
    const token = useThemeToken("skeleton");
    const { mounted, opacity } = useSkeletonHandoff(status === "loading");
    const node = useMemo(
      () =>
        mounted ? (
          <G opacity={opacity}>
            {Array.from({ length: count }, (_, index) => ({
              fx: ((index * 0.618) % 1) * 0.84 + 0.08,
              fy: ((index * 0.379) % 1) * 0.84 + 0.08,
              key: index,
              r: 16 + ((index * 0.472) % 1) * 12,
            })).map((circle) => (
              <Circle
                key={circle.key}
                cx={plot.left + circle.fx * plot.width}
                cy={plot.top + circle.fy * plot.height}
                r={circle.r}
                fill={color ?? token}
              />
            ))}
          </G>
        ) : null,
      [mounted, opacity, count, plot, color, token]
    );
    useBubbleGraphic(node);
    return null;
  },
  { displayName: "BubbleChart.Skeleton", layer: "svg" as const }
);
export const BubbleChartTrend = Object.assign(
  ({
    onFit,
    color,
    strokeWidth = 1.5,
    dashArray = "6,5",
    opacity = 0.7,
  }: BubbleChartTrendProps) => {
    const { bubbles, plot, status } = useChart("BubbleChart.Trend");
    const frame = useBubbleFrame();
    const fit = useMemo(() => bubbleFit(bubbles), [bubbles]);
    const token = useThemeToken("muted-foreground");
    const last = useRef<typeof fit>(null);
    const reporter = useRef(onFit);
    reporter.current = onFit;
    useEffect(() => {
      if (!fit) {
        return;
      }
      if (
        last.current?.slope === fit.slope &&
        last.current?.intercept === fit.intercept &&
        last.current?.r === fit.r
      ) {
        return;
      }
      last.current = fit;
      reporter.current?.(fit);
    }, [fit]);
    const node = useMemo(() => {
      if (!fit || status === "loading") {
        return null;
      }
      let ax = frame.xMin;
      let bx = frame.xMax;
      if (fit.slope !== 0) {
        const atLow = (frame.yMin - fit.intercept) / fit.slope;
        const atHigh = (frame.yMax - fit.intercept) / fit.slope;
        ax = Math.max(ax, Math.min(atLow, atHigh));
        bx = Math.min(bx, Math.max(atLow, atHigh));
      }
      if (bx < ax) {
        return null;
      }
      const grown = Math.max(0, Math.min(1, frame.grow));
      const midpoint = (ax + bx) / 2;
      const half = ((bx - ax) / 2) * grown;
      const a = projectBubble(
        {
          x: midpoint - half,
          y: fit.intercept + fit.slope * (midpoint - half),
        },
        plot,
        [frame.xMin, frame.xMax],
        [frame.yMin, frame.yMax]
      );
      const b = projectBubble(
        {
          x: midpoint + half,
          y: fit.intercept + fit.slope * (midpoint + half),
        },
        plot,
        [frame.xMin, frame.xMax],
        [frame.yMin, frame.yMax]
      );
      return (
        <SvgLine
          x1={a.x}
          x2={b.x}
          y1={a.y}
          y2={b.y}
          opacity={opacity * grown}
          stroke={color ?? token}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      );
    }, [
      fit,
      status,
      frame.xMin,
      frame.xMax,
      frame.yMin,
      frame.yMax,
      frame.grow,
      plot,
      opacity,
      color,
      token,
      strokeWidth,
      dashArray,
    ]);
    useBubbleGraphic(node);
    return null;
  },
  { displayName: "BubbleChart.Trend", layer: "svg" as const }
);
