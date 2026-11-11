import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart, useBubbleFrame } from "./context";
import { projectBubble } from "./math";
import type {
  BubbleChartLabelsProps,
  BubbleChartLegendProps,
  BubbleChartHeaderProps,
} from "./types";

export const BubbleChartLabels = Object.assign(
  ({ minRadius = 10, format, className }: BubbleChartLabelsProps) => {
    const { bubbles, plot, status } = useChart("BubbleChart.Labels");
    const frame = useBubbleFrame();
    if (status === "loading") {
      return null;
    }
    return (
      <View className="absolute inset-0" style={{ pointerEvents: "none" }}>
        {bubbles
          .filter((bubble) => bubble.r >= minRadius && (format || bubble.label))
          .map((bubble, order) => {
            const start =
              bubbles.length > 1 ? (order / bubbles.length) * 0.4 : 0;
            const arrived = Math.max(
              0,
              Math.min(1, (frame.grow - start) / 0.6)
            );
            const center = projectBubble(
              bubble,
              plot,
              [frame.xMin, frame.xMax],
              [frame.yMin, frame.yMax]
            );
            return (
              <View
                key={bubble.index}
                className="absolute top-0 left-0"
                style={{
                  height: "32rpx",
                  opacity: Math.max(0, arrived * 2 - 1),
                  transform: `translate(${(center.x - bubble.r) * 2}rpx,${(center.y - 8) * 2}rpx)`,
                  width: `${bubble.r * 4}rpx`,
                }}
              >
                <Text
                  size="xs"
                  weight="medium"
                  numberOfLines={1}
                  className={cn("text-center text-white", className)}
                >
                  {format ? format(bubble) : bubble.label}
                </Text>
              </View>
            );
          })}
      </View>
    );
  },
  { displayName: "BubbleChart.Labels", layer: "overlay" as const }
);
export const BubbleChartLegend = Object.assign(
  ({ className, limit = 8, style, ...props }: BubbleChartLegendProps) => {
    const { bubbles } = useChart("BubbleChart.Legend");
    const shown = bubbles.filter((bubble) => bubble.label).slice(0, limit);
    if (!shown.length) {
      return null;
    }
    return (
      <View
        {...props}
        style={mergeStyle({ pointerEvents: "none" }, style)}
        className={cn(
          "flex flex-row flex-wrap items-center justify-center gap-x-[24px] gap-y-[8px] pt-[24px]",
          className
        )}
      >
        {shown.map((bubble) => (
          <View
            key={bubble.index}
            className="flex flex-row items-center gap-[12px]"
          >
            <View
              style={{ backgroundColor: bubble.color }}
              className="h-[16px] w-[16px] rounded-full"
            />
            <Text size="xs" muted>
              {bubble.label}
            </Text>
          </View>
        ))}
      </View>
    );
  },
  { displayName: "BubbleChart.Legend", layer: "footer" as const }
);
export const BubbleChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    children,
    ...props
  }: BubbleChartHeaderProps) => (
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
      {children ? <View className="shrink pt-[8px]">{children}</View> : null}
    </View>
  ),
  { displayName: "BubbleChart.Header", layer: "header" as const }
);
