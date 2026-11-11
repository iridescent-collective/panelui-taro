import { useMemo } from "react";

import { Circle } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "./context";
import type { PolarAreaChartSkeletonProps } from "./types";
import { usePolarGraphic } from "./use-graphic";

export const PolarAreaChartSkeleton = Object.assign(
  ({ color }: PolarAreaChartSkeletonProps) => {
    const { size, radius, status } = useChart("PolarAreaChart.Skeleton");
    const fill = useThemeToken("skeleton");
    const node = useMemo(
      () =>
        status === "loading" && radius > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius * 0.62}
            fill={color ?? fill}
          />
        ) : null,
      [size, radius, status, color, fill]
    );
    usePolarGraphic(node);
    return null;
  },
  { displayName: "PolarAreaChart.Skeleton", slot: "svg" as const }
);
