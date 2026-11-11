import { useMemo } from "react";

import { polarPoint } from "../../lib/chart";
import { G, SvgText } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "./context";
import type { RadarChartAxisProps } from "./types";
import { useRadarGraphic } from "./use-graphic";

export const RadarChartAxis = Object.assign(
  ({ color, fontSize = 11, offset = 10, formatLabel }: RadarChartAxisProps) => {
    const { data, axisKey, cx, cy, radius, width, height } =
      useChart("RadarChart.Axis");
    const token = useThemeToken("muted-foreground");
    const fill = color ?? token;
    const node = useMemo(
      () =>
        data.length >= 3 ? (
          <G>
            {data.map((row, index) => {
              const label = formatLabel
                ? formatLabel(String(row[axisKey] ?? ""), index)
                : String(row[axisKey] ?? "");
              const point = polarPoint(
                cx,
                cy,
                radius + offset,
                index / data.length
              );
              const dx = point.x - cx;
              let anchor: "start" | "end" | "middle" = dx > 0 ? "start" : "end";
              if (Math.abs(dx) < radius * 0.15) {
                anchor = "middle";
              }
              const estimated = label.length * fontSize * 0.55;
              let { x } = point;
              if (anchor === "start") {
                x = Math.min(point.x, Math.max(width - estimated, cx));
              } else if (anchor === "end") {
                x = Math.max(point.x, Math.min(estimated, cx));
              }
              const dy = point.y < cy ? 0 : fontSize * 0.72;
              const y = Math.min(Math.max(point.y + dy, fontSize), height - 2);
              return (
                <SvgText
                  key={index}
                  x={x}
                  y={y}
                  fill={fill}
                  fontSize={fontSize}
                  fontWeight="500"
                  textAnchor={anchor}
                >
                  {label}
                </SvgText>
              );
            })}
          </G>
        ) : null,
      [
        data,
        axisKey,
        cx,
        cy,
        radius,
        width,
        height,
        fill,
        fontSize,
        offset,
        formatLabel,
      ]
    );
    useRadarGraphic(node);
    return null;
  },
  { displayName: "RadarChart.Axis", layer: "svg" as const }
);
