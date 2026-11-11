import { useEffect, useMemo, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useChartTween } from "../../primitives/chart-tween";
import { useSkeletonHandoff } from "../../primitives/skeleton-handoff";
import { G, Circle, SvgLine } from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useThemeToken } from "../../theme/use-theme";
import { bubbleSizeExtent } from "../BubbleChart/math";
import { useChart, useScatterFrame, useScatterGraphic } from "./context";
import { scatterCircleFrame, scatterPoints } from "./math";
import type {
  ScatterChartGridProps,
  ScatterChartPointsProps,
  ScatterChartSkeletonProps,
  ScatterChartPoint,
} from "./types";

export const ScatterChartGrid = Object.assign(
  ({
    rows = 4,
    columns = 4,
    dashArray = "4,6",
    color,
    opacity = 1,
  }: ScatterChartGridProps) => {
    const { plot } = useChart("ScatterChart.Grid");
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
    useScatterGraphic(node);
    return null;
  },
  { displayName: "ScatterChart.Grid", layer: "svg" as const }
);
interface ResolvedPoint extends ScatterChartPoint {
  r: number;
}
const Dot = ({
  point,
  order,
  total,
  opacity,
  color,
}: {
  point: ResolvedPoint;
  order: number;
  total: number;
  opacity: number;
  color: string;
}) => {
  const { plot, activePoint } = useChart("ScatterChart.Points");
  const frame = useScatterFrame();
  const selected = useChartTween(0);
  const reduced = usePanelReducedMotion();
  useEffect(() => {
    const target =
      activePoint?.dataKey === point.dataKey &&
      activePoint?.index === point.index
        ? 1
        : 0;
    if (reduced) {
      selected.setImmediate(target);
    } else {
      selected.timingTo(target, 140);
    }
  }, [
    activePoint,
    point.dataKey,
    point.index,
    reduced,
    selected.setImmediate,
    selected.timingTo,
  ]);
  const selection = useSyncExternalStore(
    selected.signal.subscribe,
    selected.signal.getSnapshot,
    selected.signal.getSnapshot
  );
  const circle = scatterCircleFrame({
    ...point,
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
    () => <Circle {...circle} fill={color} />,
    [circle.cx, circle.cy, circle.r, circle.fillOpacity, color]
  );
  useScatterGraphic(node, order / (total + 1));
  return null;
};
const DEFAULT_RANGE: [number, number] = [3, 14];
export const ScatterChartPoints = Object.assign(
  ({
    dataKey,
    color,
    colorIndex = 1,
    size = 4.5,
    sizeKey,
    sizeRange = DEFAULT_RANGE,
    opacity = 0.75,
  }: ScatterChartPointsProps) => {
    const { data, xDataKey, status, registerSeries, unregisterSeries } =
      useChart("ScatterChart.Points");
    const fill = useSeriesColor(color, colorIndex);
    useEffect(() => {
      registerSeries(dataKey, fill);
      return () => unregisterSeries(dataKey);
    }, [dataKey, fill, registerSeries, unregisterSeries]);
    const sizeExtent = useMemo(
      () => bubbleSizeExtent(data, sizeKey),
      [data, sizeKey]
    );
    const points = useMemo(
      () =>
        scatterPoints(
          data,
          xDataKey,
          dataKey,
          sizeKey,
          sizeRange,
          size,
          sizeExtent
        ),
      [data, xDataKey, dataKey, sizeKey, sizeRange, size, sizeExtent]
    );
    return status === "loading" ? null : (
      <>
        {points.map((point, order) => (
          <Dot
            key={point.index}
            point={point}
            order={order}
            total={points.length}
            color={fill}
            opacity={opacity}
          />
        ))}
      </>
    );
  },
  { displayName: "ScatterChart.Points", layer: "svg" as const }
);
export const ScatterChartSkeleton = Object.assign(
  ({ count = 24, color }: ScatterChartSkeletonProps) => {
    const { plot, status } = useChart("ScatterChart.Skeleton");
    const token = useThemeToken("skeleton");
    const { mounted, opacity } = useSkeletonHandoff(status === "loading");
    const node = useMemo(
      () =>
        mounted ? (
          <G opacity={opacity}>
            {Array.from({ length: count }, (_, index) => ({
              fx: ((index * 0.618) % 1) * 0.92 + 0.04,
              fy: ((index * 0.379) % 1) * 0.92 + 0.04,
              key: index,
              r: 4.5,
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
    useScatterGraphic(node);
    return null;
  },
  { displayName: "ScatterChart.Skeleton", layer: "svg" as const }
);
