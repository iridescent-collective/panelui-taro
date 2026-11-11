import { useEffect, useId, useMemo } from "react";

import { xOf } from "../../lib/chart";
import { useChartSweep } from "../../primitives/chart-sweep";
import {
  G,
  Path,
  SvgLine,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useBumpFrame, useBumpGraphic } from "./context";
import { pointsAt, bumpSegment, dotsPath, colorStop } from "./math";
import type {
  BumpChartGridProps,
  BumpChartLineProps,
  BumpChartSkeletonProps,
} from "./types";

export const BumpChartLine = Object.assign(
  ({
    dataKey,
    label,
    color,
    colorIndex = 1,
    strokeWidth = 1.5,
    showDots = true,
  }: BumpChartLineProps) => {
    const resolved = useSeriesColor(color, colorIndex);
    const { registerSeries, unregisterSeries } = useChart("BumpChart.Line");
    useEffect(() => {
      registerSeries({
        color: resolved,
        key: dataKey,
        label: label ?? dataKey,
        showDots,
        strokeWidth,
      });
    }, [dataKey, label, resolved, strokeWidth, showDots, registerSeries]);
    useEffect(
      () => () => unregisterSeries(dataKey),
      [dataKey, unregisterSeries]
    );
    return null;
  },
  {
    displayName: "BumpChart.Line",
    layer: "series" as const,
    line: true as const,
  }
);
export const BumpLines = () => {
  const { series, highlight, status } = useChart("BumpChart lines");
  const frame = useBumpFrame();
  const { plot } = useChart("BumpChart lines");
  const muted = useThemeToken("muted-foreground");
  const ordered = highlight
    ? [
        ...series.filter((item) => item.key !== highlight),
        ...series.filter((item) => item.key === highlight),
      ]
    : series;
  const node = useMemo(
    () =>
      status === "loading" ? null : (
        <>
          {ordered.map((item) => {
            const picked = highlight === item.key;
            const dimmed = highlight !== null && !picked;
            const color = dimmed ? muted : item.color;
            const runs = pointsAt(
              item.key,
              frame.from,
              frame.to,
              frame.progress,
              plot
            );
            return (
              <G key={item.key} opacity={dimmed ? 0.5 : 1}>
                <Path
                  d={runs.map(bumpSegment).join(" ")}
                  stroke={color}
                  strokeWidth={item.strokeWidth + (picked ? 1 : 0)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {item.showDots ? (
                  <Path
                    d={runs
                      .map((run) => dotsPath(run, picked ? 3.5 : 2.5))
                      .join("")}
                    fill={color}
                  />
                ) : null}
              </G>
            );
          })}
        </>
      ),
    [
      status,
      ordered,
      highlight,
      muted,
      frame.from,
      frame.to,
      frame.progress,
      plot,
    ]
  );
  useBumpGraphic(node, "series", 10_000);
  return null;
};
export const BumpChartGrid = Object.assign(
  ({
    vertical = true,
    horizontal = false,
    color,
    dashArray = "3,5",
    opacity = 1,
  }: BumpChartGridProps) => {
    const { data, plot, rows } = useChart("BumpChart.Grid");
    const token = useThemeToken("border");
    const node = useMemo(
      () => (
        <G opacity={opacity}>
          {vertical
            ? data.map((_, i) => (
                <SvgLine
                  key={`v${i}`}
                  x1={xOf(i, data.length, plot)}
                  x2={xOf(i, data.length, plot)}
                  y1={plot.top}
                  y2={plot.top + plot.height}
                  stroke={color ?? token}
                  strokeWidth={1}
                  strokeDasharray={dashArray}
                />
              ))
            : null}
          {horizontal
            ? Array.from({ length: rows }, (_, i) =>
                rows <= 1 ? 0.5 : i / (rows - 1)
              ).map((fraction, i) => (
                <SvgLine
                  key={`h${i}`}
                  x1={plot.left}
                  x2={plot.left + plot.width}
                  y1={plot.top + plot.height * fraction}
                  y2={plot.top + plot.height * fraction}
                  stroke={color ?? token}
                  strokeWidth={1}
                  strokeDasharray={dashArray}
                />
              ))
            : null}
        </G>
      ),
      [data, plot, rows, vertical, horizontal, color, token, dashArray, opacity]
    );
    useBumpGraphic(node);
    return null;
  },
  { displayName: "BumpChart.Grid", layer: "svg" as const }
);
export const BumpChartSkeleton = Object.assign(
  ({ duration = 1400, color, rows: rowsProp }: BumpChartSkeletonProps) => {
    const { status, rows, plot } = useChart("BumpChart.Skeleton");
    const token = useThemeToken("skeleton");
    const accent = useThemeToken("chart-1");
    const id = `panel-bump-${useId().replaceAll(":", "")}`;
    const sweep = useChartSweep(status === "loading", duration);
    const count = rowsProp ?? Math.max(rows, 4);
    const base = colorStop(color ?? token);
    const node = useMemo(
      () =>
        status === "loading" ? (
          <>
            <Defs>
              <LinearGradient
                id={id}
                x1={`${(sweep * 1.4 - 0.4) * 100}%`}
                y1={0}
                x2={`${sweep * 1.4 * 100}%`}
                y2={0}
              >
                <Stop offset="0" {...base} />
                <Stop offset="0.5" stopColor={accent} stopOpacity={0.3} />
                <Stop offset="1" {...base} />
              </LinearGradient>
            </Defs>
            {Array.from({ length: count }, (_, i) => (
              <Rect
                key={i}
                x={plot.left}
                y={
                  plot.top +
                  (count <= 1 ? 0.5 : i / (count - 1)) * plot.height -
                  2
                }
                width={plot.width}
                height={4}
                rx={2}
                fill={`url(#${id})`}
              />
            ))}
          </>
        ) : null,
      [status, id, plot, sweep, base, accent, count]
    );
    useBumpGraphic(node);
    return null;
  },
  { displayName: "BumpChart.Skeleton", layer: "svg" as const }
);
