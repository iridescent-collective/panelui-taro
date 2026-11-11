import { useMemo } from "react";

import { wedgePath } from "../../lib/chart";
import { useSkeletonHandoff } from "../../primitives/skeleton-handoff";
import { Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "./context";
import type { PieChartSkeletonProps } from "./types";
import { usePieGraphic } from "./use-graphic";

export const PieChartSkeleton = Object.assign(
  ({ color }: PieChartSkeletonProps) => {
    const { size, radius, hole, origin, span, status } =
      useChart("PieChart.Skeleton");
    const fill = useThemeToken("skeleton");
    const { mounted, opacity } = useSkeletonHandoff(status === "loading");
    const node = useMemo(
      () =>
        mounted && radius > 0 ? (
          <Path
            opacity={opacity}
            d={wedgePath(
              size / 2,
              size / 2,
              radius,
              hole,
              origin,
              origin + span,
              0
            )}
            fill={color ?? fill}
          />
        ) : null,
      [mounted, radius, opacity, size, hole, origin, span, color, fill]
    );
    usePieGraphic(node);
    return null;
  },
  { displayName: "PieChart.Skeleton", slot: "svg" as const }
);
