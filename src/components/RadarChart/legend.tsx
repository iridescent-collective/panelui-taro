import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { RadarChartLegendProps } from "./types";

export const RadarChartLegend = Object.assign(
  ({ className, formatName }: RadarChartLegendProps) => {
    const { series } = useChart("RadarChart.Legend");
    if (!series.length) {
      return null;
    }
    return (
      <View
        className={cn(
          "absolute bottom-0 left-0 flex flex-col gap-[8px]",
          className
        )}
        style={{ pointerEvents: "none" }}
      >
        {series.map(([key, color]) => (
          <View key={key} className="flex flex-row items-center gap-[12px]">
            <View
              className="h-[16px] w-[16px] rounded-full"
              style={{ backgroundColor: color }}
            />
            <Text size="sm" muted>
              {formatName ? formatName(key) : key}
            </Text>
          </View>
        ))}
      </View>
    );
  },
  { displayName: "RadarChart.Legend", layer: "overlay" as const }
);
