import { createContext, forwardRef, useCallback } from "react";

import { CartesianChartRoot } from "../LineChart/root";
import type { LineChartDatum } from "../LineChart/types";
import { areaChartExtent } from "./math";
import type { AreaChartHandle, AreaChartProps } from "./types";

export const AreaChartStackedContext = createContext(false);
export const AreaChartRoot = forwardRef<AreaChartHandle, AreaChartProps>(
  ({ stacked = false, ...props }, ref) => {
    const extentForData = useCallback(
      (data: LineChartDatum[], keys: string[], domain?: [number, number]) =>
        areaChartExtent(data, keys, stacked, domain),
      [stacked]
    );
    return (
      <AreaChartStackedContext.Provider value={stacked}>
        <CartesianChartRoot
          {...props}
          ref={ref}
          chartLabel="Area chart"
          extentForData={extentForData}
        />
      </AreaChartStackedContext.Provider>
    );
  }
);
AreaChartRoot.displayName = "AreaChart";
