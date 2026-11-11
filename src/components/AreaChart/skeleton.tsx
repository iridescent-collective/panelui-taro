import { useId, useMemo } from "react";

import { useChartSweep } from "../../primitives/chart-sweep";
import {
  Defs,
  G,
  LinearGradient,
  Rect,
  Stop,
} from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import type { AreaChartSkeletonProps } from "./types";

const SKELETON_BAND = 0.18;
export const AreaChartSkeleton = Object.assign(
  ({ duration = 1400, color }: AreaChartSkeletonProps) => {
    const { plot, status } = useChart("AreaChart.Skeleton");
    const base = useThemeToken("skeleton");
    const highlight = useSeriesColor(undefined, 1);
    const loading = status === "loading";
    const sweep = useChartSweep(loading, duration);
    const id = `panelui-area-skeleton-${useId().replaceAll(":", "")}`;
    const height = plot.height * SKELETON_BAND;
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
            <Rect
              x={plot.left}
              y={plot.top + plot.height - height}
              width={plot.width}
              height={height}
              fill={`url(#${id})`}
            />
          </G>
        ) : null,
      [loading, id, sweep, color, base, highlight, plot, height]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "AreaChart.Skeleton", layer: "svg" as const }
);
