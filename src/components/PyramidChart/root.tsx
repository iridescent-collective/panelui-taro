import {
  Children,
  isValidElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { CartesianChartRoot } from "../LineChart/root";
import { pyramidChartExtent, pyramidChartPlot } from "./math";
import type {
  PyramidChartDatum,
  PyramidChartHandle,
  PyramidChartProps,
} from "./types";

type PyramidChartSettings = Required<
  Pick<
    PyramidChartProps,
    | "labelPlacement"
    | "barGap"
    | "cornerRadius"
    | "minBarLength"
    | "fadedOpacity"
  >
> &
  Pick<PyramidChartProps, "barWidth"> & { hasYAxis: boolean };
const PyramidChartSettingsContext = createContext<PyramidChartSettings | null>(
  null
);
export const usePyramidChartSettings = () => {
  const settings = useContext(PyramidChartSettingsContext);
  if (!settings) {
    throw new Error("PyramidChart parts must be inside <PyramidChart>.");
  }
  return settings;
};
export const PyramidChartRoot = forwardRef<
  PyramidChartHandle,
  PyramidChartProps
>(
  (
    {
      labelPlacement = "above",
      maxValue,
      aspectRatio = 1.2,
      barGap = 0.25,
      barWidth,
      cornerRadius = 4,
      minBarLength = 0,
      fadedOpacity = 0.3,
      xDataKey = "name",
      children,
      ...props
    },
    ref
  ) => {
    const hasYAxis = Children.toArray(children).some(
      (child) =>
        isValidElement(child) && (child.type as { axis?: string }).axis === "y"
    );
    const settings = useMemo(
      () => ({
        barGap,
        barWidth,
        cornerRadius,
        fadedOpacity,
        hasYAxis,
        labelPlacement,
        minBarLength,
      }),
      [
        hasYAxis,
        labelPlacement,
        barGap,
        barWidth,
        cornerRadius,
        minBarLength,
        fadedOpacity,
      ]
    );
    const extentForData = useCallback(
      (data: PyramidChartDatum[], keys: string[]) =>
        pyramidChartExtent(data, keys, maxValue),
      [maxValue]
    );
    const plotForSize = useCallback(
      (
        width: number,
        height: number,
        _compact: boolean,
        axisPresent: boolean
      ) => pyramidChartPlot(width, height, axisPresent, labelPlacement),
      [labelPlacement]
    );
    return (
      <PyramidChartSettingsContext.Provider value={settings}>
        <CartesianChartRoot
          {...props}
          ref={ref}
          xDataKey={xDataKey}
          aspectRatio={aspectRatio}
          chartLabel="Pyramid chart"
          extentForData={extentForData}
          plotForSize={plotForSize}
        >
          {children}
        </CartesianChartRoot>
      </PyramidChartSettingsContext.Provider>
    );
  }
);
PyramidChartRoot.displayName = "PyramidChart";
