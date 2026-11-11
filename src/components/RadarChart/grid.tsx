import { useMemo } from "react";

import { polarPoint } from "../../lib/chart";
import { Circle, G, Polygon, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "./context";
import type { RadarChartGridProps } from "./types";
import { useRadarGraphic } from "./use-graphic";

export const RadarChartGrid = Object.assign(
  ({
    rings = 4,
    color,
    circular = false,
    spokes = true,
  }: RadarChartGridProps) => {
    const { data, cx, cy, radius } = useChart("RadarChart.Grid");
    const token = useThemeToken("border");
    const stroke = color ?? token;
    const count = data.length;
    const levels = Number.isFinite(rings)
      ? Math.min(256, Math.max(0, Math.floor(rings)))
      : 0;
    const node = useMemo(
      () =>
        count >= 3 ? (
          <G>
            {Array.from({ length: levels }, (_, index) => {
              const r = ((index + 1) / levels) * radius;
              return circular ? (
                <Circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1}
                />
              ) : (
                <Polygon
                  key={index}
                  points={Array.from({ length: count }, (_point, spoke) => {
                    const point = polarPoint(cx, cy, r, spoke / count);
                    return `${point.x},${point.y}`;
                  }).join(" ")}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1}
                />
              );
            })}
            {spokes
              ? Array.from({ length: count }, (_, index) => {
                  const point = polarPoint(cx, cy, radius, index / count);
                  return (
                    <SvgLine
                      key={index}
                      x1={cx}
                      y1={cy}
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
      [count, levels, radius, circular, cx, cy, stroke, spokes]
    );
    useRadarGraphic(node);
    return null;
  },
  { displayName: "RadarChart.Grid", layer: "svg" as const }
);
