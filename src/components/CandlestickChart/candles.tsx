import { useMemo, useSyncExternalStore } from "react";

import { G, Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useChartDomain } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { candleColumns, candlePath, candleHighlight } from "./math";
import { useCandleSettings } from "./root";
import type { CandlestickChartCandlesProps } from "./types";

export const CandlestickChartCandles = Object.assign(
  ({
    risingColor,
    fallingColor,
    cornerRadius = 1.5,
  }: CandlestickChartCandlesProps) => {
    const {
      data,
      plot,
      status,
      reveal,
      activeIndexJS: active,
    } = useChart("CandlestickChart.Candles");
    const {
      openKey,
      highKey,
      lowKey,
      closeKey,
      candleGap,
      candleWidth,
      fadedOpacity,
    } = useCandleSettings();
    const [min, max] = useChartDomain();
    const grow = useSyncExternalStore(
      reveal.subscribe,
      reveal.getSnapshot,
      reveal.getSnapshot
    );
    const up = useThemeToken("success");
    const down = useThemeToken("destructive");
    const columns = useMemo(
      () => candleColumns(data, openKey, highKey, lowKey, closeKey),
      [data, openKey, highKey, lowKey, closeKey]
    );
    const slice = data.length ? plot.width / data.length : 0;
    const width = Math.max(
      1,
      Math.min(candleWidth ?? slice * (1 - candleGap), Math.max(slice - 1, 1))
    );
    const input = {
      active,
      columns,
      cornerRadius,
      grow,
      max,
      min,
      plot,
      width,
    };
    const node = useMemo(
      () =>
        status === "loading" ? null : (
          <>
            <G opacity={active >= 0 ? fadedOpacity : 1}>
              <Path
                d={candlePath(input, true, true).d}
                fill={risingColor ?? up}
              />
              <Path
                d={candlePath(input, false, true).d}
                fill={fallingColor ?? down}
              />
              <Path
                d={candlePath(input, true, false).d}
                fill={risingColor ?? up}
              />
              <Path
                d={candlePath(input, false, false).d}
                fill={fallingColor ?? down}
              />
            </G>
            <Path d={candleHighlight(input, true).d} fill={risingColor ?? up} />
            <Path
              d={candleHighlight(input, false).d}
              fill={fallingColor ?? down}
            />
          </>
        ),
      [
        columns,
        plot,
        width,
        min,
        max,
        grow,
        active,
        cornerRadius,
        status,
        fadedOpacity,
        risingColor,
        up,
        fallingColor,
        down,
      ]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "CandlestickChart.Candles", layer: "svg" as const }
);
