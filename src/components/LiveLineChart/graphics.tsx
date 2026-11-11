import { useId, useMemo } from "react";

import { segment } from "../../lib/chart";
import {
  G,
  Path,
  SvgLine,
  Defs,
  LinearGradient,
  Stop,
} from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useLiveFrame, useLiveGraphic } from "./context";
import { runOf } from "./math";
import type {
  LiveLineChartGridProps,
  LiveLineChartLineProps,
  LiveLineChartAreaProps,
  LiveLineChartSkeletonProps,
} from "./types";

export const LiveLineChartGrid = Object.assign(
  ({ rows = 4, color, dashArray = "4,6" }: LiveLineChartGridProps) => {
    const { plot } = useChart("LiveLineChart.Grid");
    const token = useThemeToken("border");
    const node = useMemo(
      () => (
        <G>
          {Array.from({ length: rows + 1 }, (_, index) => (
            <SvgLine
              key={index}
              x1={plot.left}
              x2={plot.left + plot.width}
              y1={plot.top + (plot.height / rows) * index}
              y2={plot.top + (plot.height / rows) * index}
              stroke={color ?? token}
              strokeWidth={1}
              strokeDasharray={dashArray}
            />
          ))}
        </G>
      ),
      [plot, rows, color, token, dashArray]
    );
    useLiveGraphic(node);
    return null;
  },
  { displayName: "LiveLineChart.Grid", layer: "svg" as const }
);
export const LiveLineChartLine = Object.assign(
  ({ strokeWidth = 2, color }: LiveLineChartLineProps) => {
    const {
      data,
      plot,
      curve,
      status,
      color: themed,
      clipId,
      windowMs,
    } = useChart("LiveLineChart.Line");
    const frame = useLiveFrame();
    const node = useMemo(() => {
      if (status === "loading") {
        return null;
      }
      const run = runOf(
        data.map((point) => point.time),
        data.map((point) => point.value),
        plot,
        frame.time - windowMs,
        frame.time,
        frame.extent[0],
        frame.extent[1]
      );
      return (
        <G clipPath={`url(#${clipId})`}>
          <Path
            d={run.length > 1 ? segment(run, curve) : ""}
            stroke={color ?? themed}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>
      );
    }, [
      data,
      plot,
      curve,
      status,
      themed,
      color,
      clipId,
      windowMs,
      frame.time,
      frame.extent,
      strokeWidth,
    ]);
    useLiveGraphic(node);
    return null;
  },
  { displayName: "LiveLineChart.Line", layer: "svg" as const }
);
export const LiveLineChartArea = Object.assign(
  ({ opacity = 0.22, color }: LiveLineChartAreaProps) => {
    const {
      data,
      plot,
      curve,
      status,
      color: themed,
      clipId,
      windowMs,
    } = useChart("LiveLineChart.Area");
    const frame = useLiveFrame();
    const id = `panel-live-fill-${useId().replaceAll(":", "")}`;
    const node = useMemo(() => {
      if (status === "loading") {
        return null;
      }
      const run = runOf(
        data.map((point) => point.time),
        data.map((point) => point.value),
        plot,
        frame.time - windowMs,
        frame.time,
        frame.extent[0],
        frame.extent[1]
      );
      const bottom = plot.top + plot.height;
      const path =
        run.length < 2
          ? ""
          : `${segment(run, curve)} L${run.at(-1)?.x ?? 0},${bottom} L${run[0].x},${bottom} Z`;
      return (
        <G clipPath={`url(#${clipId})`}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={color ?? themed}
                stopOpacity={opacity}
              />
              <Stop offset="1" stopColor={color ?? themed} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={path} fill={`url(#${id})`} />
        </G>
      );
    }, [
      data,
      plot,
      curve,
      status,
      themed,
      color,
      clipId,
      windowMs,
      frame.time,
      frame.extent,
      id,
      opacity,
    ]);
    useLiveGraphic(node);
    return null;
  },
  { displayName: "LiveLineChart.Area", layer: "svg" as const }
);
export const LiveLineChartSkeleton = Object.assign(
  ({ color }: LiveLineChartSkeletonProps) => {
    const { plot, status } = useChart("LiveLineChart.Skeleton");
    const token = useThemeToken("skeleton");
    const node = useMemo(
      () =>
        status !== "loading" || plot.width <= 0 ? null : (
          <SvgLine
            x1={plot.left}
            x2={plot.left + plot.width}
            y1={plot.top + plot.height / 2}
            y2={plot.top + plot.height / 2}
            stroke={color ?? token}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ),
      [plot, status, color, token]
    );
    useLiveGraphic(node);
    return null;
  },
  { displayName: "LiveLineChart.Skeleton", layer: "svg" as const }
);
