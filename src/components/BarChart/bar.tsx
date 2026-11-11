import { useEffect, useMemo, useSyncExternalStore } from "react";

import { columnValues } from "../../lib/chart";
import { G, Path } from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { areaChartBaselines } from "../AreaChart/math";
import { useChart, useChartDomain } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { barChartPath } from "./math";
import { useBarChartSettings } from "./root";
import type { BarChartBarProps } from "./types";

export const BarChartBar = Object.assign(
  ({ dataKey, color, colorIndex = 1, cornerRadius }: BarChartBarProps) => {
    const {
      data,
      plot,
      status,
      series,
      registerSeries,
      unregisterSeries,
      reveal,
      activeIndexJS: active,
    } = useChart("BarChart.Bar");
    const settings = useBarChartSettings();
    const [min, max] = useChartDomain();
    const grow = useSyncExternalStore(
      reveal.subscribe,
      reveal.getSnapshot,
      reveal.getSnapshot
    );
    const fill = useSeriesColor(color, colorIndex);
    const radius = cornerRadius ?? settings.cornerRadius;
    useEffect(() => {
      registerSeries(dataKey, fill);
      return () => unregisterSeries(dataKey);
    }, [dataKey, fill, registerSeries, unregisterSeries]);
    const values = useMemo(() => columnValues(data, dataKey), [data, dataKey]);
    const baselines = useMemo(
      () => areaChartBaselines(data, series, dataKey, settings.stacked),
      [data, series, dataKey, settings.stacked]
    );
    const options = {
      ...settings,
      active,
      baselines,
      grow,
      horizontal: settings.orientation === "horizontal",
      loading: status === "loading",
      max,
      min,
      plot,
      radius,
      seriesCount: Math.max(1, series.length),
      seriesIndex: Math.max(
        0,
        series.findIndex(([key]) => key === dataKey)
      ),
      values,
    };
    const rest = barChartPath({ ...options, wantActive: false });
    const chosen = barChartPath({ ...options, wantActive: true });
    const node = useMemo(
      () => (
        <G>
          <Path d={rest.d} opacity={rest.opacity} fill={fill} />
          <Path d={chosen.d} opacity={chosen.opacity} fill={fill} />
        </G>
      ),
      [rest.d, rest.opacity, chosen.d, chosen.opacity, fill]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "BarChart.Bar", layer: "svg" as const }
);
