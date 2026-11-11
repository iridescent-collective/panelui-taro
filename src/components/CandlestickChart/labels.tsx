import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { SeriesSwatch } from "../LineChart/labels";
import { Text } from "../primitives/Text";
import type {
  CandlestickChartHeaderProps,
  CandlestickChartLegendProps,
} from "./types";

export const CandlestickChartLegend = Object.assign(
  ({
    className,
    risingLabel = "Up",
    fallingLabel = "Down",
    style,
    ...props
  }: CandlestickChartLegendProps) => {
    const rising = useThemeToken("success");
    const falling = useThemeToken("destructive");
    return (
      <View
        {...props}
        style={mergeStyle({ pointerEvents: "none" }, style)}
        className={cn(
          "absolute top-[8px] right-[16px] flex flex-row gap-[24px]",
          className
        )}
      >
        <SeriesSwatch color={rising} label={risingLabel} />
        <SeriesSwatch color={falling} label={fallingLabel} />
      </View>
    );
  },
  { displayName: "CandlestickChart.Legend", layer: "overlay" as const }
);
export const CandlestickChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    legend = false,
    risingLabel = "Up",
    fallingLabel = "Down",
    children,
    ...props
  }: CandlestickChartHeaderProps) => {
    const rising = useThemeToken("success");
    const falling = useThemeToken("destructive");
    const trailing =
      children ??
      (legend ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          <SeriesSwatch color={rising} label={risingLabel} />
          <SeriesSwatch color={falling} label={fallingLabel} />
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
  { displayName: "CandlestickChart.Header", layer: "header" as const }
);
