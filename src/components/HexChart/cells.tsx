import { useMemo } from "react";

import { G, Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useHexGraphic } from "./context";
import type { HexChartCellsProps, HexChartSkeletonProps } from "./types";

export const HexChartCells = Object.assign(
  ({ emptyColor, dimOpacity = 0.25 }: HexChartCellsProps) => {
    const { data, plan, total, colors, status, clipId, activeIndex } =
      useChart("HexChart.Cells");
    const token = useThemeToken("muted");
    const node = useMemo(
      () =>
        status === "loading" ? null : (
          <G>
            {plan.field ? (
              <Path d={plan.field} fill={emptyColor ?? token} />
            ) : null}
            <G clipPath={`url(#${clipId})`}>
              {plan.paths.map((d, index) => {
                const series = data[index];
                if (!d || !series) {
                  return null;
                }
                const percent =
                  total > 0
                    ? Math.round((Math.max(0, series.value) / total) * 100)
                    : 0;
                return (
                  <Path
                    key={series.label}
                    d={d}
                    fill={colors[index]}
                    fillOpacity={
                      activeIndex >= 0 && activeIndex !== index ? dimOpacity : 1
                    }
                    aria-label={`${series.label}, ${percent} percent`}
                  />
                );
              })}
            </G>
          </G>
        ),
      [
        data,
        plan,
        total,
        colors,
        status,
        clipId,
        activeIndex,
        dimOpacity,
        emptyColor,
        token,
      ]
    );
    useHexGraphic(node);
    return null;
  },
  { displayName: "HexChart.Cells", slot: "svg" as const }
);
export const HexChartSkeleton = Object.assign(
  ({ color }: HexChartSkeletonProps) => {
    const { plan, status } = useChart("HexChart.Skeleton");
    const token = useThemeToken("skeleton");
    const node = useMemo(
      () =>
        status === "loading" && plan.field ? (
          <Path d={plan.field} fill={color ?? token} />
        ) : null,
      [status, plan.field, color, token]
    );
    useHexGraphic(node);
    return null;
  },
  { displayName: "HexChart.Skeleton", slot: "svg" as const }
);
