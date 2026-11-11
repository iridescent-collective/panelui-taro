import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { Text } from "../primitives/Text";
import { bandsOf, waterfallSignedValue } from "./math";
import { useWaterfallSettings } from "./root";
import type { WaterfallChartValuesProps } from "./types";

export const WaterfallChartValues = Object.assign(
  ({ format, className }: WaterfallChartValuesProps) => {
    const { plot, status, extent } = useChart("WaterfallChart.Values");
    const { steps, orientation, barGap, barWidth } = useWaterfallSettings();
    if (
      orientation === "horizontal" ||
      status === "loading" ||
      !steps.length ||
      plot.width <= 0 ||
      plot.height <= 0
    ) {
      return null;
    }
    const bands = bandsOf(plot, steps.length, false, barGap, barWidth);
    const [min, max] = extent;
    const range = max - min || 1;
    return (
      <View className="absolute inset-0" style={{ pointerEvents: "none" }}>
        {steps.map((step, index) => {
          const y =
            plot.top + plot.height - ((step.end - min) / range) * plot.height;
          const forward = step.end >= step.start;
          const text = format
            ? format(step, index)
            : waterfallSignedValue(step);
          return (
            <Text
              key={index}
              size="xs"
              weight="medium"
              numberOfLines={1}
              className={cn(className)}
              style={{
                left: `${(plot.left + bands.band * index) * 2}rpx`,
                position: "absolute",
                textAlign: "center",
                top: `${(forward ? y - 18 : y + 2) * 2}rpx`,
                width: `${bands.band * 2}rpx`,
              }}
            >
              {text}
            </Text>
          );
        })}
      </View>
    );
  },
  { displayName: "WaterfallChart.Values", layer: "overlay" as const }
);
