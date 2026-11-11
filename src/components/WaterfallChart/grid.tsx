import { useMemo } from "react";

import { G, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { useWaterfallSettings } from "./root";
import type { WaterfallChartGridProps } from "./types";

export const WaterfallChartGrid = Object.assign(
  ({
    rows = 4,
    color,
    dashArray = "4,6",
    opacity = 1,
  }: WaterfallChartGridProps) => {
    const { plot } = useChart("WaterfallChart.Grid");
    const { orientation } = useWaterfallSettings();
    const token = useThemeToken("border");
    const count = Number.isFinite(rows) ? Math.max(0, Math.floor(rows)) : 4;
    const node = useMemo(
      () => (
        <G opacity={opacity}>
          {count > 0
            ? Array.from({ length: count + 1 }, (_, index) => {
                const fraction = index / count;
                return orientation === "vertical" ? (
                  <SvgLine
                    key={index}
                    x1={plot.left}
                    x2={plot.left + plot.width}
                    y1={plot.top + plot.height * fraction}
                    y2={plot.top + plot.height * fraction}
                    stroke={color ?? token}
                    strokeDasharray={dashArray}
                    strokeWidth={1}
                  />
                ) : (
                  <SvgLine
                    key={index}
                    x1={plot.left + plot.width * fraction}
                    x2={plot.left + plot.width * fraction}
                    y1={plot.top}
                    y2={plot.top + plot.height}
                    stroke={color ?? token}
                    strokeDasharray={dashArray}
                    strokeWidth={1}
                  />
                );
              })
            : null}
        </G>
      ),
      [count, plot, orientation, color, token, dashArray, opacity]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "WaterfallChart.Grid", layer: "svg" as const }
);
