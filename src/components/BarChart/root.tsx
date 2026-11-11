import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { CartesianChartRoot } from "../LineChart/root";
import { barChartExtent, barChartPlot } from "./math";
import type { BarChartDatum, BarChartHandle, BarChartProps } from "./types";

type BarChartSettings = Required<
  Pick<
    BarChartProps,
    | "orientation"
    | "stacked"
    | "barGap"
    | "stackGap"
    | "cornerRadius"
    | "minBarLength"
    | "fadedOpacity"
  >
> &
  Pick<BarChartProps, "barWidth">;
const BarChartSettingsContext = createContext<BarChartSettings | null>(null);
export const useBarChartSettings = () => {
  const settings = useContext(BarChartSettingsContext);
  if (!settings) {
    throw new Error("BarChart parts must be inside <BarChart>.");
  }
  return settings;
};
export const BarChartRoot = forwardRef<BarChartHandle, BarChartProps>(
  (
    {
      orientation = "vertical",
      stacked = false,
      barGap = 0.2,
      barWidth,
      stackGap = 0,
      cornerRadius = 4,
      minBarLength = 0,
      fadedOpacity = 0.3,
      xDataKey = "name",
      ...props
    },
    ref
  ) => {
    const settings = useMemo(
      () => ({
        barGap,
        barWidth,
        cornerRadius,
        fadedOpacity,
        minBarLength,
        orientation,
        stackGap,
        stacked,
      }),
      [
        orientation,
        stacked,
        barGap,
        barWidth,
        stackGap,
        cornerRadius,
        minBarLength,
        fadedOpacity,
      ]
    );
    const extentForData = useCallback(
      (data: BarChartDatum[], keys: string[], domain?: [number, number]) =>
        barChartExtent(data, keys, stacked, domain),
      [stacked]
    );
    const plotForSize = useCallback(
      (width: number, height: number, compact: boolean, hasYAxis: boolean) =>
        barChartPlot(width, height, compact, hasYAxis, orientation),
      [orientation]
    );
    return (
      <BarChartSettingsContext.Provider value={settings}>
        <CartesianChartRoot
          {...props}
          ref={ref}
          xDataKey={xDataKey}
          chartLabel="Bar chart"
          extentForData={extentForData}
          plotForSize={plotForSize}
        />
      </BarChartSettingsContext.Provider>
    );
  }
);
BarChartRoot.displayName = "BarChart";
