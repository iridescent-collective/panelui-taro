import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { RadarChartHeaderProps } from "./types";

export const RadarChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    legend = false,
    children,
  }: RadarChartHeaderProps) => {
    const { series } = useChart("RadarChart.Header");
    return (
      <View
        className={cn(
          "flex flex-row items-start justify-between gap-[24px] pb-[16px]",
          className
        )}
      >
        <View className="flex flex-1 flex-col">
          {title ? (
            <Text size="sm" muted>
              {title}
            </Text>
          ) : null}
          {value ? (
            <Text size="2xl" weight="bold">
              {value}
            </Text>
          ) : null}
          {caption ? (
            <Text size="sm" muted>
              {caption}
            </Text>
          ) : null}
        </View>
        {legend ? (
          <View className="flex flex-col items-end gap-[8px]">
            {series.map(([key, color]) => (
              <View key={key} className="flex flex-row items-center gap-[12px]">
                <View
                  className="h-[16px] w-[16px] rounded-full"
                  style={{ backgroundColor: color }}
                />
                <Text size="sm" muted>
                  {key}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {children}
      </View>
    );
  },
  { displayName: "RadarChart.Header", layer: "header" as const }
);
