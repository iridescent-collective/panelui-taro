import { useEffect, useMemo, useSyncExternalStore } from "react";

import { columnValues } from "../../lib/chart";
import { G, Path } from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { useChart, useChartDomain } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { pyramidChartPath, pyramidLabelSpace } from "./math";
import { usePyramidChartSettings } from "./root";
import type { PyramidChartBarProps } from "./types";

export const PyramidChartBar = Object.assign(
  ({
    dataKey,
    side = "end",
    color,
    colorIndex,
    cornerRadius,
  }: PyramidChartBarProps) => {
    const {
      data,
      plot,
      status,
      registerSeries,
      unregisterSeries,
      reveal,
      activeIndexJS: active,
    } = useChart("PyramidChart.Bar");
    const settings = usePyramidChartSettings();
    const [, max] = useChartDomain();
    const grow = useSyncExternalStore(
      reveal.subscribe,
      reveal.getSnapshot,
      reveal.getSnapshot
    );
    const fill = useSeriesColor(
      color,
      colorIndex ?? (side === "start" ? 2 : 1)
    );
    const radius = cornerRadius ?? settings.cornerRadius;
    useEffect(() => {
      registerSeries(dataKey, fill);
      return () => unregisterSeries(dataKey);
    }, [dataKey, fill, registerSeries, unregisterSeries]);
    const values = useMemo(() => columnValues(data, dataKey), [data, dataKey]);
    const options = {
      ...settings,
      active,
      ...pyramidLabelSpace(settings.hasYAxis, settings.labelPlacement),
      grow,
      loading: status === "loading",
      max,
      plot,
      radius,
      side,
      values,
    };
    const rest = pyramidChartPath({ ...options, wantActive: false });
    const chosen = pyramidChartPath({ ...options, wantActive: true });
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
  { displayName: "PyramidChart.Bar", layer: "svg" as const }
);
