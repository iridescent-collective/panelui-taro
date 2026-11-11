import { useId, useMemo } from "react";

import { barPath } from "../../lib/chart";
import { useChartSweep } from "../../primitives/chart-sweep";
import {
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { useBarChartSettings } from "./root";
import type { BarChartSkeletonProps } from "./types";

const SKELETON_LENGTH = 0.22;
const SKELETON_BARS = 7;
export const BarChartSkeleton = Object.assign(
  ({ bars, duration = 1400, color }: BarChartSkeletonProps) => {
    const { plot, status, data } = useChart("BarChart.Skeleton");
    const { orientation, barGap, barWidth, cornerRadius } =
      useBarChartSettings();
    const base = useThemeToken("skeleton");
    const highlight = useSeriesColor(undefined, 1);
    const loading = status === "loading";
    const sweep = useChartSweep(loading, duration);
    const id = `panelui-bar-skeleton-${useId().replaceAll(":", "")}`;
    const horizontal = orientation === "horizontal";
    const requested = bars ?? (data.length || SKELETON_BARS);
    const total = Number.isFinite(requested)
      ? Math.max(1, Math.floor(requested))
      : SKELETON_BARS;
    const d = useMemo(() => {
      if (plot.width <= 0 || plot.height <= 0) {
        return "";
      }
      const along = horizontal ? plot.height : plot.width;
      const alongStart = horizontal ? plot.top : plot.left;
      const across = horizontal ? plot.width : plot.height;
      const band = along / total;
      const usable = band * (1 - barGap);
      const thickness = Math.min(barWidth ?? usable, usable);
      const length = across * SKELETON_LENGTH;
      let path = "";
      for (let index = 0; index < total; index += 1) {
        const lead = alongStart + index * band + (band - thickness) / 2;
        path += horizontal
          ? barPath(plot.left, lead, length, thickness, cornerRadius, "right")
          : barPath(
              lead,
              plot.top + plot.height - length,
              thickness,
              length,
              cornerRadius,
              "up"
            );
      }
      return path;
    }, [plot, horizontal, total, barGap, barWidth, cornerRadius]);
    const node = useMemo(
      () =>
        loading && d ? (
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
            <Path d={d} fill={`url(#${id})`} />
          </G>
        ) : null,
      [loading, d, id, sweep, color, base, highlight]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "BarChart.Skeleton", layer: "svg" as const }
);
