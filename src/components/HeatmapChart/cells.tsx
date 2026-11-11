import { useMemo } from "react";

import { G, Rect, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useHeatmap, useHeatmapGraphic } from "./context";
import type { HeatmapCellsProps, HeatmapSeparatorProps } from "./types";

export const HeatmapCells = Object.assign(
  ({ cornerRadius }: HeatmapCellsProps) => {
    const {
      grid,
      data,
      ramp,
      opacities,
      levelOf,
      activeCell,
      inactiveOpacity,
      cornerRadius: rootRadius,
    } = useHeatmap("HeatmapChart.Cells");
    const radius = cornerRadius ?? rootRadius;
    const step = grid.size + grid.gap;
    const node = useMemo(
      () => (
        <G>
          {data.map((column, columnIndex) =>
            Array.from({ length: grid.rows }, (_, row) => {
              const bin = column.bins.find(
                (candidate) => candidate.bin === row
              );
              const level = levelOf(bin?.count ?? 0);
              const dimmed =
                activeCell !== null &&
                !(activeCell.column === columnIndex && activeCell.row === row);
              return (
                <Rect
                  key={`${columnIndex}-${row}`}
                  x={columnIndex * step}
                  y={row * step}
                  width={grid.size}
                  height={grid.size}
                  rx={radius}
                  ry={radius}
                  fill={ramp[level]}
                  fillOpacity={
                    opacities[level] * (dimmed ? inactiveOpacity : 1)
                  }
                />
              );
            })
          )}
        </G>
      ),
      [
        data,
        grid,
        ramp,
        opacities,
        levelOf,
        activeCell,
        inactiveOpacity,
        radius,
        step,
      ]
    );
    useHeatmapGraphic(node);
    return null;
  },
  { displayName: "HeatmapChart.Cells", slot: "cells" as const }
);
export const HeatmapSeparator = Object.assign(
  ({ every = "quarter", color, dashArray }: HeatmapSeparatorProps) => {
    const { grid } = useHeatmap("HeatmapChart.Separator");
    const token = useThemeToken("border");
    const interval = every === "quarter" ? 13 : every;
    const step = grid.size + grid.gap;
    const node = useMemo(() => {
      if (interval <= 0) {
        return null;
      }
      const lines: number[] = [];
      for (let column = interval; column < grid.columns; column += interval) {
        lines.push(column);
      }
      return (
        <G>
          {lines.map((column) => (
            <SvgLine
              key={column}
              x1={column * step - grid.gap / 2}
              x2={column * step - grid.gap / 2}
              y1={0}
              y2={grid.height}
              stroke={color ?? token}
              strokeWidth={1}
              {...(dashArray === undefined
                ? {}
                : { strokeDasharray: dashArray })}
            />
          ))}
        </G>
      );
    }, [grid, interval, step, color, token, dashArray]);
    useHeatmapGraphic(node);
    return null;
  },
  { displayName: "HeatmapChart.Separator", slot: "rules" as const }
);
