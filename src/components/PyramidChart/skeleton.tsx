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
import { geometry, pyramidLabelSpace } from "./math";
import { usePyramidChartSettings } from "./root";
import type { PyramidChartSkeletonProps } from "./types";

const SKELETON_LENGTH = 0.35;
const SKELETON_ROWS = 5;
export const PyramidChartSkeleton = Object.assign(
  ({ rows, duration = 1400, color }: PyramidChartSkeletonProps) => {
    const { plot, status, data } = useChart("PyramidChart.Skeleton");
    const { hasYAxis, labelPlacement, barGap, barWidth, cornerRadius } =
      usePyramidChartSettings();
    const { gutter, labelInset } = pyramidLabelSpace(hasYAxis, labelPlacement);
    const base = useThemeToken("skeleton");
    const highlight = useSeriesColor(undefined, 1);
    const loading = status === "loading";
    const sweep = useChartSweep(loading, duration);
    const id = `panelui-bar-skeleton-${useId().replaceAll(":", "")}`;
    const requested = rows ?? (data.length || SKELETON_ROWS);
    const total = Number.isFinite(requested)
      ? Math.max(1, Math.floor(requested))
      : SKELETON_ROWS;
    const d = useMemo(() => {
      if (plot.width <= 0 || plot.height <= 0) {
        return "";
      }
      const { innerStart, innerEnd, wing } = geometry(plot, gutter);
      const band = plot.height / total;
      const usable = Math.max(band - labelInset, 0);
      const thickness = Math.min(
        barWidth ?? usable * (1 - barGap),
        usable * (1 - barGap)
      );
      const length = wing * SKELETON_LENGTH;
      let path = "";
      for (let index = 0; index < total; index += 1) {
        const lead =
          plot.top + index * band + labelInset + (usable - thickness) / 2;
        path += barPath(
          innerStart - length,
          lead,
          length,
          thickness,
          cornerRadius,
          "left"
        );
        path += barPath(
          innerEnd,
          lead,
          length,
          thickness,
          cornerRadius,
          "right"
        );
      }
      return path;
    }, [plot, gutter, labelInset, total, barGap, barWidth, cornerRadius]);
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
  { displayName: "PyramidChart.Skeleton", layer: "svg" as const }
);
