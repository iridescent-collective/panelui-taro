import { useMemo } from "react";

import { useSkeletonHandoff } from "../../primitives/skeleton-handoff";
import { Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "./context";
import { ribbonPath } from "./ribbon";
import type { FunnelChartSkeletonProps } from "./types";
import { useFunnelGraphic } from "./use-graphic";

export const FunnelChartSkeleton = Object.assign(
  ({ color }: FunnelChartSkeletonProps) => {
    const { width, height, middle, textBand, curve, status } = useChart(
      "FunnelChart.Skeleton"
    );
    const fill = useThemeToken("skeleton");
    const { mounted, opacity } = useSkeletonHandoff(status === "loading");
    const extent = Math.max(0, height / 2 - textBand);
    const node = useMemo(
      () =>
        mounted && width > 0 && height > 0 ? (
          <Path
            d={ribbonPath(0, width, extent, extent * 0.4, middle, curve)}
            fill={color ?? fill}
            opacity={opacity}
          />
        ) : null,
      [mounted, width, height, extent, middle, curve, color, fill, opacity]
    );
    useFunnelGraphic(node);
    return null;
  },
  { displayName: "FunnelChart.Skeleton", slot: "svg" as const }
);
