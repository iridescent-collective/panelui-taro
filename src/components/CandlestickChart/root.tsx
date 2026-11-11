import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { ReactNode } from "react";

import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { useLineChart } from "../LineChart/context";
import { CartesianChartRoot } from "../LineChart/root";
import { candleExtent } from "./math";
import type {
  CandlestickChartProps,
  CandlestickChartHandle,
  CandlestickChartDatum,
} from "./types";

interface Settings {
  openKey: string;
  highKey: string;
  lowKey: string;
  closeKey: string;
  candleGap: number;
  candleWidth?: number;
  fadedOpacity: number;
}
const SettingsContext = createContext<Settings | null>(null);
export const useCandleSettings = () => {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error(
      "CandlestickChart parts must be within a <CandlestickChart>"
    );
  }
  return settings;
};
export const useCandlestickChart = () => {
  useCandleSettings();
  return useLineChart();
};
const AccessibilitySlot = Object.assign(
  ({ children }: { children: ReactNode }) => <>{children}</>,
  { layer: "header" as const }
);
export const CandlestickChartRoot = forwardRef<
  CandlestickChartHandle,
  CandlestickChartProps
>(
  (
    {
      data,
      xDataKey = "date",
      openDataKey = "open",
      highDataKey = "high",
      lowDataKey = "low",
      closeDataKey = "close",
      aspectRatio = 1.6,
      candleGap = 0.3,
      candleWidth,
      fadedOpacity = 0.3,
      accessible,
      accessibilityLabel,
      accessibilityHint,
      accessibilityLabelForDatum,
      onAccessibilityDatumPress,
      children,
      ...props
    },
    ref
  ) => {
    const settings = useMemo(
      () => ({
        candleGap,
        candleWidth,
        closeKey: closeDataKey,
        fadedOpacity,
        highKey: highDataKey,
        lowKey: lowDataKey,
        openKey: openDataKey,
      }),
      [
        openDataKey,
        highDataKey,
        lowDataKey,
        closeDataKey,
        candleGap,
        candleWidth,
        fadedOpacity,
      ]
    );
    const extentForData = useCallback(
      (
        rows: CandlestickChartDatum[],
        _keys: string[],
        yDomain?: [number, number]
      ) =>
        candleExtent(
          rows,
          openDataKey,
          highDataKey,
          lowDataKey,
          closeDataKey,
          yDomain
        ),
      [openDataKey, highDataKey, lowDataKey, closeDataKey]
    );
    const plotForSize = useCallback(
      (width: number, height: number, compact: boolean, hasYAxis: boolean) => {
        const pad = compact
          ? { bottom: 2, left: 1, right: 1, top: 2 }
          : { bottom: 22, left: hasYAxis ? 48 : 10, right: 10, top: 12 };
        return {
          height: Math.max(height - pad.top - pad.bottom, 0),
          left: pad.left,
          top: pad.top,
          width: Math.max(width - pad.left - pad.right, 0),
        };
      },
      []
    );
    return (
      <SettingsContext.Provider value={settings}>
        <CartesianChartRoot
          {...props}
          ref={ref}
          data={data}
          xDataKey={xDataKey}
          aspectRatio={aspectRatio}
          chartLabel="Candlestick chart"
          accessible={false}
          extentForData={extentForData}
          plotForSize={plotForSize}
        >
          {children}
          <AccessibilitySlot>
            <ChartAccessibilityData
              chart="Candlestick chart"
              data={data}
              disabled={accessible === false || props.status === "loading"}
              accessibilityLabel={accessibilityLabel}
              accessibilityHint={accessibilityHint}
              accessibilityLabelForDatum={accessibilityLabelForDatum}
              onAccessibilityDatumPress={onAccessibilityDatumPress}
              valueOf={(datum) => [
                [xDataKey, datum[xDataKey]],
                [openDataKey, datum[openDataKey]],
                [highDataKey, datum[highDataKey]],
                [lowDataKey, datum[lowDataKey]],
                [closeDataKey, datum[closeDataKey]],
              ]}
            />
          </AccessibilitySlot>
        </CartesianChartRoot>
      </SettingsContext.Provider>
    );
  }
);
CandlestickChartRoot.displayName = "CandlestickChart";
