import { useEffect, useId, useMemo } from "react";

import { areaPath, columnValues, linePath, xOf, yOf } from "../../lib/chart";
import { useChartSweep } from "../../primitives/chart-sweep";
import {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  SvgLine,
} from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useChartDomain } from "./context";
import type {
  LineChartAreaProps,
  LineChartGridProps,
  LineChartLineProps,
  LineChartSkeletonProps,
} from "./types";
import { useChartGraphic } from "./use-graphic";

export const LineChartGrid = Object.assign(
  ({ rows = 4, color, dashArray = "4,6", opacity = 1 }: LineChartGridProps) => {
    const { plot } = useChart("LineChart.Grid");
    const token = useThemeToken("border");
    const count = Number.isFinite(rows) ? Math.max(0, Math.floor(rows)) : 4;
    const node = useMemo(
      () => (
        <G opacity={opacity}>
          {count > 0
            ? Array.from({ length: count + 1 }, (_, index) => {
                const y = plot.top + (plot.height / count) * index;
                return (
                  <SvgLine
                    key={index}
                    x1={plot.left}
                    x2={plot.left + plot.width}
                    y1={y}
                    y2={y}
                    stroke={color ?? token}
                    strokeWidth={1}
                    strokeDasharray={dashArray}
                  />
                );
              })
            : null}
        </G>
      ),
      [opacity, count, plot, color, token, dashArray]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "LineChart.Grid", layer: "svg" as const }
);
export const LineChartLine = Object.assign(
  ({
    dataKey,
    color,
    colorIndex = 1,
    strokeWidth = 2.5,
    dashArray,
    showMarkers = false,
  }: LineChartLineProps) => {
    const { data, plot, curve, status, registerSeries, unregisterSeries } =
      useChart("LineChart.Line");
    const [min, max] = useChartDomain();
    const stroke = useSeriesColor(color, colorIndex);
    const values = useMemo(() => columnValues(data, dataKey), [data, dataKey]);
    const loading = status === "loading";
    useEffect(() => {
      registerSeries(dataKey, stroke);
      return () => unregisterSeries(dataKey);
    }, [dataKey, stroke, registerSeries, unregisterSeries]);
    const node = useMemo(
      () => (
        <G>
          <Path
            d={linePath(values, plot, min, max, curve, loading)}
            fill="none"
            stroke={loading ? "transparent" : stroke}
            strokeWidth={strokeWidth}
            {...(dashArray === undefined ? {} : { strokeDasharray: dashArray })}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showMarkers && !loading
            ? values.map((value, index) =>
                value === null ? null : (
                  <Circle
                    key={index}
                    cx={xOf(index, values.length, plot)}
                    cy={yOf(value, plot, min, max)}
                    r={3}
                    fill={stroke}
                  />
                )
              )
            : null}
        </G>
      ),
      [
        values,
        plot,
        min,
        max,
        curve,
        loading,
        stroke,
        strokeWidth,
        dashArray,
        showMarkers,
      ]
    );
    useChartGraphic("series", node);
    return null;
  },
  { displayName: "LineChart.Line", layer: "series" as const }
);
export const LineChartArea = Object.assign(
  ({ dataKey, color, colorIndex = 1, opacity = 0.18 }: LineChartAreaProps) => {
    const { data, plot, curve, status } = useChart("LineChart.Area");
    const [min, max] = useChartDomain();
    const fill = useSeriesColor(color, colorIndex);
    const id = `panelui-area-${useId().replaceAll(":", "")}`;
    const values = useMemo(() => columnValues(data, dataKey), [data, dataKey]);
    const node = useMemo(
      () => (
        <G>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={fill} stopOpacity={opacity} />
              <Stop offset="1" stopColor={fill} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path
            d={areaPath(values, plot, min, max, curve, status === "loading")}
            fill={`url(#${id})`}
            stroke="none"
          />
        </G>
      ),
      [id, fill, opacity, values, plot, min, max, curve, status]
    );
    useChartGraphic("series", node);
    return null;
  },
  { displayName: "LineChart.Area", layer: "series" as const }
);
export const LineChartSkeleton = Object.assign(
  ({ duration = 1400, color }: LineChartSkeletonProps) => {
    const { plot, status } = useChart("LineChart.Skeleton");
    const base = useThemeToken("skeleton");
    const highlight = useSeriesColor(undefined, 1);
    const id = `panelui-chart-skeleton-${useId().replaceAll(":", "")}`;
    const loading = status === "loading";
    const sweep = useChartSweep(loading, duration);
    const node = useMemo(
      () =>
        loading ? (
          <G>
            <Defs>
              <LinearGradient
                id={id}
                x1={`${(sweep * 1.4 - 0.4) * 100}%`}
                x2={`${sweep * 1.4 * 100}%`}
                y1="0"
                y2="0"
              >
                <Stop offset="0" stopColor={color ?? base} />
                <Stop offset="0.5" stopColor={highlight} stopOpacity={0.55} />
                <Stop offset="1" stopColor={color ?? base} />
              </LinearGradient>
            </Defs>
            <SvgLine
              x1={plot.left}
              x2={plot.left + plot.width}
              y1={plot.top + plot.height / 2}
              y2={plot.top + plot.height / 2}
              stroke={`url(#${id})`}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </G>
        ) : null,
      [loading, id, sweep, color, base, highlight, plot]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "LineChart.Skeleton", layer: "svg" as const }
);
