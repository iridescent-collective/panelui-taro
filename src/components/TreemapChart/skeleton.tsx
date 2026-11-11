import { useId, useMemo } from "react";

import { useChartSweep } from "../../primitives/chart-sweep";
import { useSkeletonHandoff } from "../../primitives/skeleton-handoff";
import {
  G,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useTreemapGraphic } from "./context";
import type { TreemapChartSkeletonProps } from "./types";

export const TreemapChartSkeleton = Object.assign(
  ({ duration = 1400, color }: TreemapChartSkeletonProps) => {
    const { width, height, cornerRadius, status } = useChart(
      "TreemapChart.Skeleton"
    );
    const token = useThemeToken("skeleton");
    const accent = useThemeToken("chart-1");
    const sweep = useChartSweep(status === "loading", duration);
    const { mounted, opacity } = useSkeletonHandoff(status === "loading");
    const id = `panel-treemap-skeleton-${useId().replaceAll(":", "")}`;
    const node = useMemo(
      () =>
        mounted && width > 0 && height > 0 ? (
          <G opacity={opacity}>
            <Defs>
              <LinearGradient
                id={id}
                x1={`${(sweep * 1.4 - 0.4) * 100}%`}
                x2={`${(sweep * 1.4 - 0.4 + 0.4) * 100}%`}
                y1="0"
                y2="0"
              >
                <Stop offset="0" stopColor={color ?? token} />
                <Stop offset="0.5" stopColor={accent} stopOpacity={0.55} />
                <Stop offset="1" stopColor={color ?? token} />
              </LinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              rx={cornerRadius}
              fill={`url(#${id})`}
            />
          </G>
        ) : null,
      [
        mounted,
        width,
        height,
        opacity,
        id,
        sweep,
        color,
        token,
        accent,
        cornerRadius,
      ]
    );
    useTreemapGraphic(node);
    return null;
  },
  { displayName: "TreemapChart.Skeleton", slot: "svg" as const }
);
