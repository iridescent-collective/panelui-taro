import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { HexChartLegendProps, HexChartHeaderProps } from "./types";

export const HexChartLegend = Object.assign(
  ({ className, showValue = true, ...props }: HexChartLegendProps) => {
    const { data, total, colors, activeIndex, setActiveIndex } =
      useChart("HexChart.Legend");
    if (!data.length) {
      return null;
    }
    return (
      <View
        {...props}
        className={cn(
          "flex w-full flex-row flex-wrap items-center justify-center gap-x-[24px] gap-y-[12px] pt-[24px]",
          className
        )}
      >
        {data.map((series, index) => {
          const percent =
            total > 0
              ? Math.round((Math.max(0, series.value) / total) * 100)
              : 0;
          const dimmed = activeIndex >= 0 && activeIndex !== index;
          return (
            <AnimatedPressable
              key={series.label}
              pressScale={1}
              accessibilityRole="button"
              accessibilityLabel={`${series.label}, ${percent} percent`}
              onPress={() => setActiveIndex(activeIndex === index ? -1 : index)}
              style={{ opacity: dimmed ? 0.4 : 1 }}
              className="flex max-w-full flex-row items-center gap-[12px]"
            >
              <View
                style={{ backgroundColor: colors[index] }}
                className="h-[16px] w-[16px] rounded-full"
              />
              <Text size="xs" muted numberOfLines={1} className="shrink">
                {series.label}
              </Text>
              {showValue ? (
                <Text size="xs" weight="medium">
                  {percent}%
                </Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </View>
    );
  },
  { displayName: "HexChart.Legend", slot: "footer" as const }
);
export const HexChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    labels,
    legend = false,
    children,
    ...props
  }: HexChartHeaderProps) => {
    const { data, colors } = useChart("HexChart.Header");
    const trailing =
      children ??
      (legend && data.length ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          {data.map((series, index) => (
            <View
              key={series.label}
              className="flex flex-row items-center gap-[12px]"
            >
              <View
                style={{ backgroundColor: colors[index] }}
                className="h-[16px] w-[16px] rounded-full"
              />
              <Text size="xs" muted numberOfLines={1}>
                {labels?.[series.label] ?? series.label}
              </Text>
            </View>
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
        {trailing ? (
          <View className="max-w-[55%] shrink pt-[8px]">{trailing}</View>
        ) : null}
      </View>
    );
  },
  { displayName: "HexChart.Header", slot: "header" as const }
);
