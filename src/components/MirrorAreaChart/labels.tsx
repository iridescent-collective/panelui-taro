import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import { sidesInOrder } from "./math";
import type {
  MirrorAreaChartHeaderProps,
  MirrorAreaChartLegendProps,
} from "./types";

const SeriesSwatch = ({ color, label }: { color: string; label: string }) => (
  <View className="flex flex-row items-center gap-[12px]">
    <View
      className="h-[16px] w-[16px] rounded-full"
      style={{ backgroundColor: color }}
    />
    <Text size="xs" muted>
      {label}
    </Text>
  </View>
);
export const MirrorAreaChartLegend = Object.assign(
  ({ className, style, ...props }: MirrorAreaChartLegendProps) => {
    const { series } = useChart("MirrorAreaChart.Legend");
    return series.length ? (
      <View
        {...props}
        style={mergeStyle({ pointerEvents: "none" }, style)}
        className={cn(
          "absolute top-0 right-[16px] flex flex-row flex-wrap gap-[24px]",
          className
        )}
      >
        {sidesInOrder(series).map((item) => (
          <SeriesSwatch key={item.key} color={item.color} label={item.label} />
        ))}
      </View>
    ) : null;
  },
  { displayName: "MirrorAreaChart.Legend", layer: "overlay" as const }
);
export const MirrorAreaChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    legend = false,
    children,
    ...props
  }: MirrorAreaChartHeaderProps) => {
    const { series } = useChart("MirrorAreaChart.Header");
    const trailing =
      children ??
      (legend && series.length ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          {sidesInOrder(series).map((item) => (
            <SeriesSwatch
              key={item.key}
              color={item.color}
              label={item.label}
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
  { displayName: "MirrorAreaChart.Header", layer: "header" as const }
);
