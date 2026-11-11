import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { usePlot } from "./context";
import type { PlotHeaderProps, PlotLegendProps } from "./types";

export const PlotHeader = Object.assign(
  ({
    title,
    value,
    caption,
    className,
    children,
    ...props
  }: PlotHeaderProps) => (
    <View {...props} className={cn("flex flex-col gap-[4px]", className)}>
      {children ?? (
        <>
          {title ? (
            <Text size="sm" muted numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {value ? (
            <Text size="2xl" weight="semibold" numberOfLines={1}>
              {value}
            </Text>
          ) : null}
          {caption ? (
            <Text size="xs" muted numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </>
      )}
    </View>
  ),
  { displayName: "Plot.Header", layer: "header" }
);
export const PlotLegend = Object.assign(
  ({ labels, className, ...props }: PlotLegendProps) => {
    const { series } = usePlot("Plot.Legend");
    return series.length ? (
      <View
        {...props}
        className={cn(
          "flex flex-row flex-wrap items-center gap-x-[24px] gap-y-[8px] pt-[8px]",
          className
        )}
      >
        {series.map(([key, color]) => (
          <View key={key} className="flex flex-row items-center gap-[12px]">
            <View
              className="h-[16px] w-[16px] rounded-full"
              style={{ backgroundColor: color }}
            />
            <Text size="xs" muted>
              {labels?.[key] ?? key}
            </Text>
          </View>
        ))}
      </View>
    ) : null;
  },
  { displayName: "Plot.Legend", layer: "header" }
);
