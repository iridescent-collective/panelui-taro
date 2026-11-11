import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useChart, useBumpFrame } from "./context";
import { pointsAt } from "./math";
import type {
  BumpChartLabelsProps,
  BumpChartHeaderProps,
  BumpChartLegendProps,
} from "./types";

const SeriesSwatch = ({ color, label }: { color: string; label: string }) => (
  <View className="flex flex-row items-center gap-[12px]">
    <View
      className="h-[16px] w-[16px] rounded-full"
      style={{ backgroundColor: color }}
    />
    <Text size="xs" muted>
      {label}
    </Text>
  </View>
);
export const BumpChartLabels = Object.assign(
  ({ pressable = true, className }: BumpChartLabelsProps) => {
    const { series, plot, pad, highlight, setHighlight, status } =
      useChart("BumpChart.Labels");
    const frame = useBumpFrame();
    if (status === "loading") {
      return null;
    }
    return (
      <View className="absolute inset-0" style={{ pointerEvents: "none" }}>
        {series.map((item) => {
          const runs = pointsAt(
            item.key,
            frame.from,
            frame.to,
            frame.progress,
            plot
          );
          const last = runs.at(-1)?.at(-1);
          const picked = highlight === item.key;
          const dimmed = highlight !== null && !picked;
          let textStyle;
          if (dimmed) {
            textStyle = { opacity: 0.8 };
          } else if (!picked) {
            textStyle = { color: item.color };
          }
          return (
            <View
              key={item.key}
              className="panel-bump-label absolute top-0"
              style={{
                height: "40rpx",
                left: `${(plot.left + plot.width + 12) * 2}rpx`,
                opacity: last ? 1 : 0,
                pointerEvents: pressable ? "auto" : "none",
                transform: `translateY(${((last?.y ?? 10) - 10) * 2}rpx)`,
                width: `${(pad.right - 12) * 2}rpx`,
              }}
            >
              <AnimatedPressable
                hitSlop={{ bottom: 4, top: 4 }}
                disabled={!pressable}
                onPress={() => setHighlight(picked ? null : item.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: picked }}
                accessibilityLabel={item.label}
                className="flex h-full flex-col justify-center"
              >
                <Text
                  size="xs"
                  weight={picked ? "semibold" : undefined}
                  muted={!picked}
                  numberOfLines={1}
                  className={className}
                  style={textStyle}
                >
                  {item.label}
                </Text>
              </AnimatedPressable>
            </View>
          );
        })}
      </View>
    );
  },
  {
    displayName: "BumpChart.Labels",
    labels: true as const,
    layer: "overlay" as const,
  }
);
export const BumpChartLegend = Object.assign(
  ({ className, style, ...props }: BumpChartLegendProps) => {
    const { series } = useChart("BumpChart.Legend");
    return series.length ? (
      <View
        {...props}
        style={mergeStyle({ pointerEvents: "none" }, style)}
        className={cn(
          "absolute top-0 right-[16px] flex flex-row flex-wrap gap-[24px]",
          className
        )}
      >
        {series.map((item) => (
          <SeriesSwatch key={item.key} color={item.color} label={item.label} />
        ))}
      </View>
    ) : null;
  },
  { displayName: "BumpChart.Legend", layer: "overlay" as const }
);
export const BumpChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    legend = false,
    children,
    ...props
  }: BumpChartHeaderProps) => {
    const { series } = useChart("BumpChart.Header");
    const trailing =
      children ??
      (legend && series.length ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          {series.map((item) => (
            <SeriesSwatch
              key={item.key}
              color={item.color}
              label={item.label}
            />
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
        {trailing ? <View className="shrink pt-[8px]">{trailing}</View> : null}
      </View>
    );
  },
  { displayName: "BumpChart.Header", layer: "header" as const }
);
