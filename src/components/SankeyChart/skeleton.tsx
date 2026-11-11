import { useMemo } from "react";

import { useSkeletonHandoff } from "../../primitives/skeleton-handoff";
import { G, Path, Rect } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useSankeyGraphic } from "./context";
import { flowPath, flowPathVertical } from "./math";
import type { SankeyChartSkeletonProps } from "./types";

export const SankeyChartSkeleton = Object.assign(
  ({ color }: SankeyChartSkeletonProps) => {
    const { width, height, curve, status, orientation } = useChart(
      "SankeyChart.Skeleton"
    );
    const token = useThemeToken("skeleton");
    const fill = color ?? token;
    const { mounted, opacity } = useSkeletonHandoff(status === "loading");
    const upright = orientation === "horizontal";
    const node = useMemo(() => {
      if (!mounted || width <= 0 || height <= 0) {
        return null;
      }
      const along = upright ? width : height;
      const cross = upright ? height : width;
      const bar = 10;
      const step = (along - bar) / 2;
      const band = cross / 3;
      const columns = Array.from({ length: 3 }, (_, i) => i * step);
      const path = upright ? flowPath : flowPathVertical;
      const ribbons: string[] = [];
      for (let i = 0; i < 2; i += 1) {
        const from = columns[i] + bar;
        const to = columns[i + 1];
        ribbons.push(
          path(from, cross / 3, to, cross / 3, band * 0.5, curve),
          path(from, (cross * 2) / 3, to, (cross * 2) / 3, band * 0.5, curve)
        );
      }
      return (
        <G opacity={opacity}>
          {ribbons.map((d, i) => (
            <Path key={`r${i}`} d={d} fill={fill} fillOpacity={0.5} />
          ))}
          {columns.map((at, i) => (
            <Rect
              key={`b${i}`}
              x={upright ? at : cross / 6}
              y={upright ? cross / 6 : at}
              width={upright ? bar : (cross * 2) / 3}
              height={upright ? (cross * 2) / 3 : bar}
              rx={2}
              fill={fill}
            />
          ))}
        </G>
      );
    }, [mounted, width, height, curve, upright, opacity, fill]);
    useSankeyGraphic(node);
    return null;
  },
  { displayName: "SankeyChart.Skeleton", slot: "svg" as const }
);
