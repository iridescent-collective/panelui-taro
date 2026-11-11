import { useContext, useEffect, useId, useMemo } from "react";

import { areaPath, columnValues, linePath } from "../../lib/chart";
import {
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useChart, useChartDomain } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { areaChartBaselines } from "./math";
import { AreaChartStackedContext } from "./root";
import type { AreaChartAreaProps } from "./types";

export const AreaChartArea = Object.assign(
  ({
    dataKey,
    color,
    colorIndex = 1,
    fillOpacity,
    gradientToOpacity = 0,
    showLine = true,
    strokeWidth = 2,
  }: AreaChartAreaProps) => {
    const {
      data,
      plot,
      status,
      curve,
      series,
      registerSeries,
      unregisterSeries,
    } = useChart("AreaChart.Area");
    const stacked = useContext(AreaChartStackedContext);
    const [min, max] = useChartDomain();
    const stroke = useSeriesColor(color, colorIndex);
    const id = `panelui-area-fill-${useId().replaceAll(/[^a-zA-Z0-9]/gu, "")}`;
    const topOpacity = fillOpacity ?? (stacked ? 0.85 : 0.35);
    useEffect(() => {
      registerSeries(dataKey, stroke);
      return () => unregisterSeries(dataKey);
    }, [dataKey, stroke, registerSeries, unregisterSeries]);
    const values = useMemo(() => columnValues(data, dataKey), [data, dataKey]);
    const baselines = useMemo(
      () => areaChartBaselines(data, series, dataKey, stacked),
      [data, series, dataKey, stacked]
    );
    const node = useMemo(
      () => (
        <G>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={topOpacity} />
              <Stop
                offset="1"
                stopColor={stroke}
                stopOpacity={gradientToOpacity}
              />
            </LinearGradient>
          </Defs>
          <Path
            d={areaPath(
              values,
              plot,
              min,
              max,
              curve,
              status === "loading",
              baselines
            )}
            fill={`url(#${id})`}
          />
          {showLine ? (
            <Path
              d={linePath(
                values,
                plot,
                min,
                max,
                curve,
                status === "loading",
                baselines
              )}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : null}
        </G>
      ),
      [
        id,
        stroke,
        topOpacity,
        gradientToOpacity,
        values,
        plot,
        min,
        max,
        curve,
        status,
        baselines,
        showLine,
        strokeWidth,
      ]
    );
    useChartGraphic("series", node);
    return null;
  },
  { displayName: "AreaChart.Area", layer: "series" as const }
);
