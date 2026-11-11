import { useEffect, useId, useMemo } from "react";

import { useChartSweep } from "../../primitives/chart-sweep";
import {
  G,
  Path,
  Rect,
  SvgLine,
  Defs,
  LinearGradient,
  Stop,
} from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useThemeToken } from "../../theme/use-theme";
import { dotsPath, colorStop } from "../BumpChart/math";
import { useChart, useMirrorFrame, useMirrorGraphic } from "./context";
import { edgeRuns, edgePath, fillPath } from "./math";
import type {
  MirrorAreaChartAreaProps,
  MirrorAreaChartGridProps,
  MirrorAreaChartBaselineProps,
  MirrorAreaChartSkeletonProps,
} from "./types";

export const MirrorAreaChartArea = Object.assign(
  ({
    dataKey,
    side = "top",
    label,
    color,
    colorIndex = 1,
    muted = false,
    fillOpacity,
    gradientToOpacity,
    showLine = true,
    strokeWidth = 1.5,
  }: MirrorAreaChartAreaProps) => {
    const { data, plot, baseline, curve, registerSeries, unregisterSeries } =
      useChart("MirrorAreaChart.Area");
    const frame = useMirrorFrame();
    const resolved = useSeriesColor(color, colorIndex);
    const mutedColor = useThemeToken("muted-foreground");
    const stroke = muted && !color ? mutedColor : resolved;
    const gradientId = `panel-mirror-fill-${useId().replaceAll(":", "")}`;
    const outer = fillOpacity ?? (muted ? 0.22 : 0.3);
    const inner = gradientToOpacity ?? outer;
    const top = side === "top";
    useEffect(() => {
      registerSeries({
        color: stroke,
        key: dataKey,
        label: label ?? dataKey,
        side,
      });
    }, [dataKey, stroke, label, side, registerSeries]);
    useEffect(
      () => () => unregisterSeries(dataKey),
      [dataKey, unregisterSeries]
    );
    const values = useMemo(
      () =>
        data.map((row) =>
          typeof row[dataKey] === "number" && Number.isFinite(row[dataKey])
            ? (row[dataKey] as number)
            : null
        ),
      [data, dataKey]
    );
    const node = useMemo(() => {
      const height = top
        ? baseline - plot.top
        : plot.top + plot.height - baseline;
      const runs = edgeRuns(
        values,
        plot,
        baseline,
        height,
        top ? frame.topMax : frame.bottomMax,
        frame.grow,
        top ? -1 : 1
      );
      return (
        <G>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={stroke}
                stopOpacity={top ? outer : inner}
              />
              <Stop
                offset="1"
                stopColor={stroke}
                stopOpacity={top ? inner : outer}
              />
            </LinearGradient>
          </Defs>
          <Path
            d={fillPath(runs, curve, baseline)}
            fill={`url(#${gradientId})`}
          />
          {showLine ? (
            <Path
              d={edgePath(runs, curve)}
              opacity={frame.grow > 0.001 ? 1 : 0}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : null}
        </G>
      );
    }, [
      top,
      baseline,
      plot,
      values,
      frame.topMax,
      frame.bottomMax,
      frame.grow,
      gradientId,
      stroke,
      outer,
      inner,
      curve,
      showLine,
      strokeWidth,
    ]);
    useMirrorGraphic(node, "series");
    return null;
  },
  {
    area: true as const,
    displayName: "MirrorAreaChart.Area",
    layer: "series" as const,
  }
);
export const MirrorAreaChartGrid = Object.assign(
  ({
    variant = "dots",
    spacing,
    color,
    opacity = 1,
  }: MirrorAreaChartGridProps) => {
    const { plot, baseline } = useChart("MirrorAreaChart.Grid");
    const token = useThemeToken("border");
    const node = useMemo(() => {
      if (variant === "dots") {
        const gap = Math.max(spacing ?? 12, 4);
        const columns = Math.floor(plot.width / gap);
        const offset = plot.left + (plot.width - columns * gap) / 2;
        const points: { x: number; y: number }[] = [];
        for (let y = baseline; y >= plot.top - 0.5; y -= gap) {
          for (let c = 0; c <= columns; c += 1) {
            points.push({ x: offset + c * gap, y });
          }
        }
        for (
          let y = baseline + gap;
          y <= plot.top + plot.height + 0.5;
          y += gap
        ) {
          for (let c = 0; c <= columns; c += 1) {
            points.push({ x: offset + c * gap, y });
          }
        }
        return (
          <Path
            d={dotsPath(points, 0.9)}
            fill={color ?? token}
            opacity={opacity}
          />
        );
      }
      const rules = Math.max(Math.round(spacing ?? 2), 1);
      const lines: number[] = [];
      for (let i = 1; i <= rules; i += 1) {
        lines.push(
          baseline - ((baseline - plot.top) * i) / rules,
          baseline + ((plot.top + plot.height - baseline) * i) / rules
        );
      }
      return (
        <G opacity={opacity}>
          {lines.map((y) => (
            <SvgLine
              key={y}
              x1={plot.left}
              x2={plot.left + plot.width}
              y1={y}
              y2={y}
              stroke={color ?? token}
              strokeDasharray="4,6"
              strokeWidth={1}
            />
          ))}
        </G>
      );
    }, [plot, baseline, variant, spacing, color, token, opacity]);
    useMirrorGraphic(node);
    return null;
  },
  { displayName: "MirrorAreaChart.Grid", layer: "svg" as const }
);
export const MirrorAreaChartBaseline = Object.assign(
  ({ color, strokeWidth = 1, opacity = 0.5 }: MirrorAreaChartBaselineProps) => {
    const { plot, baseline } = useChart("MirrorAreaChart.Baseline");
    const token = useThemeToken("muted-foreground");
    const node = useMemo(
      () => (
        <SvgLine
          x1={plot.left}
          x2={plot.left + plot.width}
          y1={baseline}
          y2={baseline}
          stroke={color ?? token}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      ),
      [plot, baseline, color, token, strokeWidth, opacity]
    );
    useMirrorGraphic(node, "series");
    return null;
  },
  { displayName: "MirrorAreaChart.Baseline", layer: "series" as const }
);
export const MirrorAreaChartSkeleton = Object.assign(
  ({ duration = 1400, color }: MirrorAreaChartSkeletonProps) => {
    const { plot, baseline, status } = useChart("MirrorAreaChart.Skeleton");
    const token = useThemeToken("skeleton");
    const accent = useThemeToken("chart-1");
    const sweep = useChartSweep(status === "loading", duration);
    const id = `panel-mirror-skeleton-${useId().replaceAll(":", "")}`;
    const base = useMemo(() => colorStop(color ?? token), [color, token]);
    const node = useMemo(() => {
      if (status !== "loading") {
        return null;
      }
      const above = (baseline - plot.top) * 0.18;
      const below = (plot.top + plot.height - baseline) * 0.18;
      return (
        <G>
          <Defs>
            <LinearGradient
              id={id}
              x1={`${(sweep * 1.4 - 0.4) * 100}%`}
              x2={`${(sweep * 1.4 - 0.4 + 0.4) * 100}%`}
              y1="0"
              y2="0"
            >
              <Stop offset="0" {...base} />
              <Stop offset="0.5" stopColor={accent} stopOpacity={0.3} />
              <Stop offset="1" {...base} />
            </LinearGradient>
          </Defs>
          <Rect
            x={plot.left}
            y={baseline - above}
            width={plot.width}
            height={above + below}
            fill={`url(#${id})`}
          />
        </G>
      );
    }, [status, plot, baseline, id, sweep, base, accent]);
    useMirrorGraphic(node);
    return null;
  },
  { displayName: "MirrorAreaChart.Skeleton", layer: "svg" as const }
);
