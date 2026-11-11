import { useMemo } from "react";

import { seriesColorAt } from "../lib/chart-colors";
import { useSeriesColor } from "./use-series-color";

export const useChartPalette = (
  data: readonly { color?: string }[],
  toneLaps = false
) => {
  const c1 = useSeriesColor(undefined, 1);
  const c2 = useSeriesColor(undefined, 2);
  const c3 = useSeriesColor(undefined, 3);
  const c4 = useSeriesColor(undefined, 4);
  const c5 = useSeriesColor(undefined, 5);
  const palette = useMemo(() => [c1, c2, c3, c4, c5], [c1, c2, c3, c4, c5]);
  return useMemo(
    () =>
      data.map(
        (item, index) =>
          item.color ??
          (toneLaps
            ? seriesColorAt(palette, index)
            : palette[index % palette.length])
      ),
    [data, palette, toneLaps]
  );
};
