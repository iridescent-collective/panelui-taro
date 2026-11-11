import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { PieChartLegendProps } from "./types";

export const PieChartLegend = Object.assign(
  ({ className, showValue = true, ...props }: PieChartLegendProps) => {
    const { data, slices, colors, activeIndex, setActiveIndex } =
      useChart("PieChart.Legend");
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
        {data.map((slice, index) => {
          const percent = Math.round((slices[index]?.fraction ?? 0) * 100);
          const dimmed = activeIndex >= 0 && activeIndex !== index;
          return (
            <AnimatedPressable
              key={slice.label}
              pressScale={1}
              accessibilityRole="button"
              accessibilityLabel={`${slice.label}, ${percent} percent`}
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
                  {percent}%
                </Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </View>
    );
  },
  { displayName: "PieChart.Legend", slot: "footer" as const }
);
