import { useMemo } from "react";

import { G, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { geometry, pyramidLabelSpace } from "./math";
import { usePyramidChartSettings } from "./root";
import type { PyramidChartGridProps } from "./types";

export const PyramidChartGrid = Object.assign(
  ({
    columns = 2,
    color,
    dashArray = "4,6",
    opacity = 1,
    centreLine = true,
  }: PyramidChartGridProps) => {
    const { plot } = useChart("PyramidChart.Grid");
    const { hasYAxis, labelPlacement } = usePyramidChartSettings();
    const { gutter } = pyramidLabelSpace(hasYAxis, labelPlacement);
    const { innerStart, innerEnd, wing, centre } = geometry(plot, gutter);
    const token = useThemeToken("border");
    const stroke = color ?? token;
    const node = useMemo(
      () => (
        <G opacity={opacity}>
          {Array.from(
            { length: columns },
            (_, index) => (index + 1) / columns
          ).map((fraction) => (
            <G key={fraction}>
              <SvgLine
                x1={innerStart - wing * fraction}
                x2={innerStart - wing * fraction}
                y1={plot.top}
                y2={plot.top + plot.height}
                stroke={stroke}
                strokeDasharray={dashArray}
                strokeWidth={1}
              />
              <SvgLine
                x1={innerEnd + wing * fraction}
                x2={innerEnd + wing * fraction}
                y1={plot.top}
                y2={plot.top + plot.height}
                stroke={stroke}
                strokeDasharray={dashArray}
                strokeWidth={1}
              />
            </G>
          ))}
          {centreLine ? (
            <SvgLine
              x1={centre}
              x2={centre}
              y1={plot.top}
              y2={plot.top + plot.height}
              stroke={stroke}
              strokeWidth={1}
            />
          ) : null}
        </G>
      ),
      [
        columns,
        innerStart,
        innerEnd,
        wing,
        centre,
        plot,
        stroke,
        dashArray,
        opacity,
        centreLine,
      ]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "PyramidChart.Grid", layer: "svg" as const }
);
