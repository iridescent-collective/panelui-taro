import { View } from "@tarojs/components";

import { AnimatedPressable } from "./animated-pressable";

export const CHART_AXIS_MAX_FONT_SCALE = 1.353;

export interface ChartAccessibilityProps<Datum> {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLabelForDatum?: (datum: Datum, index: number) => string;
  onAccessibilityDatumPress?: (datum: Datum, index: number) => void;
}
export interface ChartAccessibilityItem<Datum> {
  datum: Datum;
  index: number;
  label: string;
}
const spoken = (value: unknown): string | null => {
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return null;
};
export const chartAccessibilityModel = <Datum,>(
  chart: string,
  data: Datum[],
  valueOf: (datum: Datum) => [string, unknown][],
  labelForDatum?: (datum: Datum, index: number) => string
): { summary: string; items: ChartAccessibilityItem<Datum>[] } => ({
  items: data.map((datum, index) => ({
    datum,
    index,
    label:
      labelForDatum?.(datum, index) ??
      valueOf(datum)
        .map(([label, value]) => {
          const text = spoken(value);
          return text === null ? null : `${label}, ${text}`;
        })
        .filter((part): part is string => part !== null)
        .join(". "),
  })),
  summary: `${chart}, ${data.length} ${data.length === 1 ? "data entry" : "data entries"}`,
});
export interface ChartAccessibilityDataProps<
  Datum,
> extends ChartAccessibilityProps<Datum> {
  chart: string;
  data: Datum[];
  valueOf: (datum: Datum) => [string, unknown][];
  disabled?: boolean;
}
export const ChartAccessibilityData = <Datum,>({
  chart,
  data,
  valueOf,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityLabelForDatum,
  onAccessibilityDatumPress,
}: ChartAccessibilityDataProps<Datum>) => {
  if (disabled) {
    return null;
  }
  const model = chartAccessibilityModel(
    chart,
    data,
    valueOf,
    accessibilityLabelForDatum
  );
  return (
    <View
      style={{
        height: "2rpx",
        left: "-20000rpx",
        position: "absolute",
        width: "2rpx",
      }}
    >
      <View
        role="img"
        aria-role="image"
        aria-label={accessibilityLabel ?? model.summary}
        aria-description={accessibilityHint}
      />
      {model.items.map((item) => (
        <AnimatedPressable
          key={item.index}
          pressScale={1}
          accessibilityRole={onAccessibilityDatumPress ? "button" : "text"}
          accessibilityLabel={item.label}
          onPress={
            onAccessibilityDatumPress
              ? () => onAccessibilityDatumPress(item.datum, item.index)
              : undefined
          }
        />
      ))}
    </View>
  );
};
