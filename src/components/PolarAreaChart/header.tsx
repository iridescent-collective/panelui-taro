import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { PolarAreaChartHeaderProps } from "./types";

export const PolarAreaChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    labels,
    legend = false,
    children,
    ...props
  }: PolarAreaChartHeaderProps) => {
    const { data, colors } = useChart("PolarAreaChart.Header");
    const trailing =
      children ??
      (legend && data.length ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          {data.map((slice, index) => (
            <View
              key={slice.label}
              className="flex flex-row items-center gap-[12px]"
            >
              <View
                style={{ backgroundColor: colors[index] }}
                className="h-[16px] w-[16px] rounded-full"
              />
              <Text size="xs" muted numberOfLines={1}>
                {labels?.[slice.label] ?? slice.label}
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
  { displayName: "PolarAreaChart.Header", slot: "header" as const }
);
