import { useMemo } from "react";

import { polarPoint } from "../../lib/chart";
import { Circle, G, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "./context";
import type { PolarAreaChartGridProps } from "./types";
import { usePolarGraphic } from "./use-graphic";

export const PolarAreaChartGrid = Object.assign(
  ({ rings = 4, color, spokes = false }: PolarAreaChartGridProps) => {
    const { size, radius, maxValue, radiusOf, wedges } = useChart(
      "PolarAreaChart.Grid"
    );
    const border = useThemeToken("border");
    const stroke = color ?? border;
    const count = Number.isFinite(rings)
      ? Math.min(256, Math.max(0, Math.floor(rings)))
      : 0;
    const centre = size / 2;
    const node = useMemo(
      () =>
        radius > 0 && count > 0 ? (
          <G>
            {Array.from({ length: count }, (_, index) => {
              const r = radiusOf(((index + 1) / count) * maxValue);
              return r > 0 ? (
                <Circle
                  key={index}
                  cx={centre}
                  cy={centre}
                  r={r}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1}
                />
              ) : null;
            })}
            {spokes
              ? wedges.map((wedge, index) => {
                  const point = polarPoint(centre, centre, radius, wedge.from);
                  return (
                    <SvgLine
                      key={index}
                      x1={centre}
                      y1={centre}
                      x2={point.x}
                      y2={point.y}
                      stroke={stroke}
                      strokeWidth={1}
                    />
                  );
                })
              : null}
          </G>
        ) : null,
      [radius, count, radiusOf, maxValue, centre, stroke, spokes, wedges]
    );
    usePolarGraphic(node);
    return null;
  },
  { displayName: "PolarAreaChart.Grid", slot: "svg" as const }
);
