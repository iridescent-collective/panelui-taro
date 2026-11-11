import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { PolarAreaChartLegendProps } from "./types";

export const PolarAreaChartLegend = Object.assign(
  ({
    className,
    showValue = true,
    formatValue,
    ...props
  }: PolarAreaChartLegendProps) => {
    const { data, colors, activeIndex, setActiveIndex } = useChart(
      "PolarAreaChart.Legend"
    );
    if (!data.length) {
      return null;
    }
    const format = formatValue ?? ((value: number) => compactNumber(value));
    return (
      <View
        {...props}
        className={cn(
          "flex w-full flex-row flex-wrap items-center justify-center gap-x-[24px] gap-y-[12px] pt-[24px]",
          className
        )}
      >
        {data.map((slice, index) => {
          const dimmed = activeIndex >= 0 && activeIndex !== index;
          return (
            <AnimatedPressable
              key={`${slice.label}-${index}`}
              pressScale={1}
              accessibilityRole="button"
              accessibilityState={{ selected: activeIndex === index }}
              accessibilityLabel={`${slice.label}, ${format(slice.value, slice)}`}
              onPress={() => setActiveIndex(activeIndex === index ? -1 : index)}
              style={{ opacity: dimmed ? 0.4 : 1, transition: "none" }}
              className="flex max-w-full flex-row items-center gap-[12px]"
            >
              <View
                style={{ backgroundColor: colors[index] }}
                className="h-[16px] w-[16px] rounded-full"
              />
              <Text size="xs" muted numberOfLines={1} className="shrink">
                {slice.label}
              </Text>
              {showValue ? (
                <Text size="xs" weight="medium">
                  {format(slice.value, slice)}
                </Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </View>
    );
  },
  { displayName: "PolarAreaChart.Legend", slot: "footer" as const }
);
