import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { ScatterChartHeaderProps, ScatterChartLegendProps } from "./types";

export const SeriesSwatch = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => (
  <View className="flex flex-row items-center gap-[12px]">
    <View
      style={{ backgroundColor: color }}
      className="h-[16px] w-[16px] rounded-full"
    />
    <Text size="xs" muted>
      {label}
    </Text>
  </View>
);
export const ScatterChartLegend = Object.assign(
  ({ className, labels, style, ...props }: ScatterChartLegendProps) => {
    const { series } = useChart("ScatterChart.Legend");
    if (!series.length) {
      return null;
    }
    return (
      <View
        {...props}
        className={cn(
          "absolute top-0 left-[20px] flex flex-row flex-wrap items-center gap-[32px]",
          className
        )}
        style={mergeStyle({ pointerEvents: "none" }, style)}
      >
        {series.map(([key, color]) => (
          <SeriesSwatch key={key} color={color} label={labels?.[key] ?? key} />
        ))}
      </View>
    );
  },
  { displayName: "ScatterChart.Legend", layer: "overlay" as const }
);
export const ScatterChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    labels,
    legend = false,
    children,
    ...props
  }: ScatterChartHeaderProps) => {
    const { series } = useChart("ScatterChart.Header");
    const trailing =
      children ??
      (legend && series.length ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          {series.map(([key, color]) => (
            <SeriesSwatch
              key={key}
              color={color}
              label={labels?.[key] ?? key}
            />
          ))}
        </View>
      ) : null);
    return (
      <View
        {...props}
        className={cn(
          "flex flex-row items-start justify-between gap-[24px] pb-[24px]",
          className
        )}
      >
        <View className="flex flex-1 flex-col gap-[4px]">
          {title ? (
            <Text size="xs" muted>
              {title}
            </Text>
          ) : null}
          {value ? (
            <Text size="xl" weight="bold">
              {value}
            </Text>
          ) : null}
          {caption ? (
            <Text size="xs" muted>
              {caption}
            </Text>
          ) : null}
        </View>
        {trailing ? <View className="shrink pt-[8px]">{trailing}</View> : null}
      </View>
    );
  },
  { displayName: "ScatterChart.Header", layer: "header" as const }
);
