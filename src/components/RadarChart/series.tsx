import { useEffect, useMemo, useSyncExternalStore } from "react";

import { polarPoint, radarPath } from "../../lib/chart";
import { Circle, G, Path } from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useChart } from "./context";
import { radarValues, scaledRadarValues } from "./math";
import type { RadarChartSeriesProps } from "./types";
import { useRadarGraphic } from "./use-graphic";
import { useRadarMorph } from "./use-morph";

export const RadarChartSeries = Object.assign(
  ({
    dataKey,
    name: _name,
    color,
    colorIndex = 1,
    strokeWidth = 2,
    fillOpacity = 0.18,
    showDots = false,
  }: RadarChartSeriesProps) => {
    const {
      data,
      cx,
      cy,
      radius,
      domainMin,
      domainMax,
      reveal,
      status,
      registerSeries,
      unregisterSeries,
    } = useChart("RadarChart.Series");
    const stroke = useSeriesColor(color, colorIndex);
    useEffect(() => {
      registerSeries(dataKey, stroke);
      return () => unregisterSeries(dataKey);
    }, [dataKey, stroke, registerSeries, unregisterSeries]);
    const values = useMemo(() => radarValues(data, dataKey), [data, dataKey]);
    const morph = useRadarMorph(values);
    const shown = useSyncExternalStore(
      reveal.subscribe,
      reveal.getSnapshot,
      reveal.getSnapshot
    );
    const min = useSyncExternalStore(
      domainMin.subscribe,
      domainMin.getSnapshot,
      domainMin.getSnapshot
    );
    const max = useSyncExternalStore(
      domainMax.subscribe,
      domainMax.getSnapshot,
      domainMax.getSnapshot
    );
    const scaled = useMemo(
      () =>
        scaledRadarValues(
          morph.from,
          morph.to,
          morph.progress,
          min,
          max,
          shown
        ),
      [morph.from, morph.to, morph.progress, min, max, shown]
    );
    const d = status === "loading" ? "" : radarPath(scaled, cx, cy, radius);
    const node = useMemo(
      () => (
        <G>
          <Path
            d={d}
            fill={stroke}
            fillOpacity={fillOpacity}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {showDots && data.length >= 3
            ? values.map((value, index) => {
                if (value === null) {
                  return null;
                }
                const target = morph.to[index];
                const start = morph.from[index] ?? target;
                const point =
                  target === null ||
                  target === undefined ||
                  start === null ||
                  start === undefined
                    ? { x: cx, y: cy }
                    : polarPoint(
                        cx,
                        cy,
                        radius *
                          (((start + (target - start) * morph.progress - min) /
                            Math.max(max - min, 1e-6)) *
                            shown),
                        index / data.length
                      );
                return (
                  <Circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={3}
                    fill={stroke}
                  />
                );
              })
            : null}
        </G>
      ),
      [
        d,
        stroke,
        fillOpacity,
        strokeWidth,
        showDots,
        data.length,
        values,
        morph.from,
        morph.to,
        morph.progress,
        min,
        max,
        shown,
        cx,
        cy,
        radius,
      ]
    );
    useRadarGraphic(node);
    return null;
  },
  { displayName: "RadarChart.Series", layer: "svg" as const }
);
