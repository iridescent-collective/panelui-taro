import { useEffect, useMemo } from "react";

import { areaPath, columnValues, linePath, yOf } from "../../lib/chart";
import { Circle, G, Path, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { usePlot, usePlotDomain } from "./context";
import { plotBarsPath, pointX } from "./math";
import type {
  PlotAreaProps,
  PlotBarsProps,
  PlotDotsProps,
  PlotGridProps,
  PlotLineProps,
  PlotSeriesProps,
} from "./types";
import { usePlotGraphic } from "./use-graphic";

const useSeries = ({ dataKey, color, colorIndex = 1 }: PlotSeriesProps) => {
  const ctx = usePlot("Plot series");
  const selected =
    color ?? ctx.palette[Math.max(0, Math.min(4, colorIndex - 1))];
  useEffect(() => {
    ctx.registerSeries(dataKey, selected);
    return () => ctx.unregisterSeries(dataKey, selected);
  }, [dataKey, selected, ctx.registerSeries, ctx.unregisterSeries]);
  const values = useMemo(
    () => columnValues(ctx.data, dataKey),
    [ctx.data, dataKey]
  );
  const domain = usePlotDomain();
  return { color: selected, ctx, domain, values };
};
export const PlotGrid = Object.assign(
  ({ rows = 4, color, dashArray = "4,6", opacity = 1 }: PlotGridProps) => {
    const { plot } = usePlot("Plot.Grid");
    const token = useThemeToken("border");
    const count = Number.isFinite(rows) ? Math.max(0, Math.floor(rows)) : 4;
    const node = useMemo(
      () => (
        <G opacity={opacity}>
          {count > 0
            ? Array.from({ length: count + 1 }, (_, i) => (
                <SvgLine
                  key={i}
                  x1={plot.left}
                  x2={plot.left + plot.width}
                  y1={plot.top + (plot.height / count) * i}
                  y2={plot.top + (plot.height / count) * i}
                  stroke={color ?? token}
                  strokeWidth={1}
                  {...(dashArray === undefined
                    ? {}
                    : { strokeDasharray: dashArray })}
                />
              ))
            : null}
        </G>
      ),
      [count, plot, color, token, dashArray, opacity]
    );
    usePlotGraphic("grid", node);
    return null;
  },
  { displayName: "Plot.Grid", layer: "svg" }
);
export const PlotLine = Object.assign(
  (props: PlotLineProps) => {
    const {
      ctx,
      color,
      values,
      domain: [min, max],
    } = useSeries(props);
    const { strokeWidth = 2.5, dashArray, curve = ctx.curve } = props;
    const node = useMemo(
      () => (
        <Path
          d={
            ctx.status === "loading" || min === max
              ? ""
              : linePath(
                  values,
                  ctx.plot,
                  min,
                  max,
                  curve,
                  false,
                  undefined,
                  ctx.xScale === "band"
                )
          }
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          {...(dashArray === undefined ? {} : { strokeDasharray: dashArray })}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
      [
        values,
        ctx.plot,
        min,
        max,
        curve,
        ctx.status,
        ctx.xScale,
        color,
        strokeWidth,
        dashArray,
      ]
    );
    usePlotGraphic("series", node);
    return null;
  },
  { displayName: "Plot.Line", layer: "series" }
);
export const PlotArea = Object.assign(
  (props: PlotAreaProps) => {
    const {
      ctx,
      color,
      values,
      domain: [min, max],
    } = useSeries(props);
    const { opacity = 0.18, curve = ctx.curve } = props;
    const node = useMemo(
      () => (
        <Path
          d={
            ctx.status === "loading" || min === max
              ? ""
              : areaPath(
                  values,
                  ctx.plot,
                  min,
                  max,
                  curve,
                  false,
                  undefined,
                  ctx.xScale === "band"
                )
          }
          fill={color}
          fillOpacity={opacity}
          stroke="none"
        />
      ),
      [
        values,
        ctx.plot,
        min,
        max,
        curve,
        ctx.status,
        ctx.xScale,
        color,
        opacity,
      ]
    );
    usePlotGraphic("series", node);
    return null;
  },
  { displayName: "Plot.Area", layer: "series" }
);
export const PlotBars = Object.assign(
  (props: PlotBarsProps) => {
    const {
      ctx,
      color,
      values,
      domain: [min, max],
    } = useSeries(props);
    const { gap = 0.35, radius = 4, opacity = 1, baseline = 0 } = props;
    const node = useMemo(
      () => (
        <Path
          d={
            ctx.status === "loading"
              ? ""
              : plotBarsPath(values, ctx.plot, min, max, gap, radius, baseline)
          }
          fill={color}
          fillOpacity={opacity}
        />
      ),
      [
        ctx.status,
        values,
        ctx.plot,
        min,
        max,
        gap,
        radius,
        baseline,
        color,
        opacity,
      ]
    );
    usePlotGraphic("series", node);
    return null;
  },
  { displayName: "Plot.Bars", layer: "series", mark: "band" }
);
export const PlotDots = Object.assign(
  (props: PlotDotsProps) => {
    const {
      ctx,
      color,
      values,
      domain: [min, max],
    } = useSeries(props);
    const { size = 3.5, ringWidth = 2 } = props;
    const ring = useThemeToken("background");
    const node = useMemo(
      () => (
        <G>
          {ctx.status === "loading"
            ? null
            : values.map((value, i) =>
                value === null ? null : (
                  <Circle
                    key={i}
                    cx={pointX(i, values.length, ctx.plot, ctx.xScale)}
                    cy={yOf(value, ctx.plot, min, max)}
                    r={size}
                    fill={color}
                    stroke={ring}
                    strokeWidth={ringWidth}
                  />
                )
              )}
        </G>
      ),
      [
        ctx.status,
        ctx.plot,
        ctx.xScale,
        values,
        min,
        max,
        size,
        color,
        ring,
        ringWidth,
      ]
    );
    usePlotGraphic("series", node);
    return null;
  },
  { displayName: "Plot.Dots", layer: "series" }
);
