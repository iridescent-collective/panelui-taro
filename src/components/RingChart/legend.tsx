import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { RingChartLegendProps } from "./types";

export const RingChartLegend = Object.assign(
  ({ className, showValue = true, style, ...props }: RingChartLegendProps) => {
    const { data, colors, activeIndex, setActiveIndex } =
      useChart("RingChart.Legend");
    if (!data.length) {
      return null;
    }
    return (
      <View
        {...props}
        style={mergeStyle({ pointerEvents: "none" }, style)}
        className={cn(
          "absolute -bottom-[16px] flex w-full flex-col gap-[8px]",
          className
        )}
      >
        {data.map((ring, index) => {
          const percent =
            ring.maxValue > 0
              ? Math.round((ring.value / ring.maxValue) * 100)
              : 0;
          const dimmed = activeIndex >= 0 && activeIndex !== index;
          return (
            <Pressable
              pressScale={1}
              key={ring.label}
              accessibilityRole="button"
              accessibilityLabel={`${ring.label}, ${percent} percent`}
              onPress={() => setActiveIndex(activeIndex === index ? -1 : index)}
              style={{
                opacity: dimmed ? 0.4 : 1,
                pointerEvents: "auto",
                transition: "none",
              }}
              className="flex flex-row items-center gap-[12px]"
            >
              <View
                style={{ backgroundColor: colors[index] }}
                className="h-[16px] w-[16px] rounded-full"
              />
              <Text size="xs" muted numberOfLines={1} className="flex-1">
                {ring.label}
              </Text>
              {showValue ? (
                <Text size="xs" weight="medium">
                  {percent}%
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  },
  { displayName: "RingChart.Legend", slot: "overlay" as const }
);
