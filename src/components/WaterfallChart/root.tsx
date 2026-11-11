import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { ReactNode } from "react";

import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { useThemeToken } from "../../theme/use-theme";
import { useChart } from "../LineChart/context";
import { CartesianChartRoot } from "../LineChart/root";
import { waterfallExtent, waterfallSteps } from "./math";
import type {
  WaterfallChartHandle,
  WaterfallChartProps,
  WaterfallKind,
  WaterfallStep,
} from "./types";

type Settings = Required<
  Pick<
    WaterfallChartProps,
    "orientation" | "barGap" | "cornerRadius" | "minBarLength" | "fadedOpacity"
  >
> &
  Pick<WaterfallChartProps, "barWidth"> & {
    steps: WaterfallStep[];
    colors: Record<WaterfallKind, string>;
  };
const SettingsContext = createContext<Settings | null>(null);
export const useWaterfallSettings = () => {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error("WaterfallChart parts must be within a <WaterfallChart>");
  }
  return settings;
};
export const useWaterfallChart = () => {
  const { steps } = useWaterfallSettings();
  const { activeIndexJS } = useChart("useWaterfallChart");
  return {
    activeIndex: activeIndexJS,
    activeStep: activeIndexJS >= 0 ? (steps[activeIndexJS] ?? null) : null,
  };
};
const AccessibilitySlot = Object.assign(
  ({ children }: { children: ReactNode }) => <>{children}</>,
  { layer: "header" as const }
);

export const WaterfallChartRoot = forwardRef<
  WaterfallChartHandle,
  WaterfallChartProps
>(
  (
    {
      data,
      orientation = "vertical",
      barGap = 0.34,
      barWidth,
      cornerRadius = 4,
      minBarLength = 2,
      fadedOpacity = 0.3,
      riseColor,
      fallColor,
      totalColor,
      onActiveIndexChange,
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
    const steps = useMemo(() => waterfallSteps(data), [data]);
    const rise = useThemeToken("success");
    const fall = useThemeToken("destructive");
    const total = useThemeToken("chart-1");
    const colors = useMemo(
      () => ({
        fall: fallColor ?? fall,
        rise: riseColor ?? rise,
        total: totalColor ?? total,
      }),
      [riseColor, rise, fallColor, fall, totalColor, total]
    );
    const settings = useMemo(
      () => ({
        barGap,
        barWidth,
        colors,
        cornerRadius,
        fadedOpacity,
        minBarLength,
        orientation,
        steps,
      }),
      [
        steps,
        orientation,
        barGap,
        barWidth,
        cornerRadius,
        minBarLength,
        fadedOpacity,
        colors,
      ]
    );
    const mapped = useMemo(
      () =>
        steps.map((step) => ({
          end: step.end,
          kind: step.kind,
          label: step.label,
          start: step.start,
          value: step.value,
        })),
      [steps]
    );
    const extentForData = useCallback(
      (_data: unknown, _keys: unknown, yDomain?: [number, number]) =>
        waterfallExtent(steps, yDomain),
      [steps]
    );
    const plotForSize = useCallback(
      (width: number, height: number, compact: boolean, hasYAxis: boolean) => {
        let pad = { bottom: 22, left: hasYAxis ? 44 : 10, right: 10, top: 12 };
        if (orientation === "horizontal") {
          pad = { bottom: 6, left: 76, right: 10, top: 6 };
        }
        if (compact) {
          pad = { bottom: 2, left: 1, right: 1, top: 2 };
        }
        return {
          height: Math.max(height - pad.top - pad.bottom, 0),
          left: pad.left,
          top: pad.top,
          width: Math.max(width - pad.left - pad.right, 0),
        };
      },
      [orientation]
    );
    const report = useCallback(
      (index: number) =>
        onActiveIndexChange?.(
          index,
          index >= 0 ? (steps[index] ?? null) : null
        ),
      [steps, onActiveIndexChange]
    );
    const access = (
      <ChartAccessibilityData
        chart="Waterfall chart"
        data={steps}
        disabled={accessible === false || props.status === "loading"}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityLabelForDatum={accessibilityLabelForDatum}
        onAccessibilityDatumPress={onAccessibilityDatumPress}
        valueOf={(step) => [
          ["label", step.label],
          ["change", step.value],
          ["kind", step.kind],
          ["starts at", step.start],
          ["ends at", step.end],
        ]}
      />
    );
    return (
      <SettingsContext.Provider value={settings}>
        <CartesianChartRoot
          {...props}
          ref={ref}
          data={mapped}
          xDataKey="label"
          chartLabel="Waterfall chart"
          accessible={false}
          onActiveIndexChange={report}
          extentForData={extentForData}
          plotForSize={plotForSize}
        >
          {children}
          <AccessibilitySlot>{access}</AccessibilitySlot>
        </CartesianChartRoot>
      </SettingsContext.Provider>
    );
  }
);
WaterfallChartRoot.displayName = "WaterfallChart";
