import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useChart, useBubbleFrame } from "./context";
import { bubbleRadius, projectBubble } from "./math";
import type {
  BubbleChartQuadrantsProps,
  BubbleChartSizeKeyProps,
} from "./types";

export const BubbleChartQuadrants = Object.assign(
  ({
    x,
    y,
    labels,
    tint = true,
    color,
    className,
  }: BubbleChartQuadrantsProps) => {
    const { bubbles, plot, status } = useChart("BubbleChart.Quadrants");
    const frame = useBubbleFrame();
    const token = useThemeToken("muted-foreground");
    const foreground = useThemeToken("foreground");
    if (status === "loading" || !bubbles.length) {
      return null;
    }
    const center = projectBubble(
      {
        x: x ?? bubbles.reduce((sum, b) => sum + b.x, 0) / bubbles.length,
        y: y ?? bubbles.reduce((sum, b) => sum + b.y, 0) / bubbles.length,
      },
      plot,
      [frame.xMin, frame.xMax],
      [frame.yMin, frame.yMax]
    );
    const corners = [
      {
        key: "topLeft" as const,
        left: plot.left + 6,
        right: false,
        top: plot.top + 6,
      },
      {
        key: "topRight" as const,
        left: plot.left + plot.width / 2,
        right: true,
        top: plot.top + 6,
      },
      {
        key: "bottomLeft" as const,
        left: plot.left + 6,
        right: false,
        top: plot.top + plot.height - 22,
      },
      {
        key: "bottomRight" as const,
        left: plot.left + plot.width / 2,
        right: true,
        top: plot.top + plot.height - 22,
      },
    ];
    return (
      <View
        className={cn("absolute inset-0", className)}
        style={{ pointerEvents: "none" }}
      >
        {tint ? (
          <>
            <View
              className="absolute"
              style={{
                backgroundColor: foreground,
                height: `${Math.max(center.y - plot.top, 0) * 2}rpx`,
                left: `${center.x * 2}rpx`,
                opacity: 0.04,
                top: `${plot.top * 2}rpx`,
                width: `${Math.max(plot.left + plot.width - center.x, 0) * 2}rpx`,
              }}
            />
            <View
              className="absolute"
              style={{
                backgroundColor: foreground,
                height: `${Math.max(plot.top + plot.height - center.y, 0) * 2}rpx`,
                left: `${plot.left * 2}rpx`,
                opacity: 0.04,
                top: `${center.y * 2}rpx`,
                width: `${Math.max(center.x - plot.left, 0) * 2}rpx`,
              }}
            />
          </>
        ) : null}
        <View
          className="absolute"
          style={{
            backgroundColor: color ?? token,
            height: `${plot.height * 2}rpx`,
            left: `${center.x * 2}rpx`,
            opacity: 0.7,
            top: `${plot.top * 2}rpx`,
            width: "2rpx",
          }}
        />
        <View
          className="absolute"
          style={{
            backgroundColor: color ?? token,
            height: "2rpx",
            left: `${plot.left * 2}rpx`,
            opacity: 0.7,
            top: `${center.y * 2}rpx`,
            width: `${plot.width * 2}rpx`,
          }}
        />
        {corners.map((corner) =>
          labels?.[corner.key] ? (
            <Text
              key={corner.key}
              size="xs"
              weight="medium"
              numberOfLines={1}
              style={{
                left: `${corner.left * 2}rpx`,
                position: "absolute",
                textAlign: corner.right ? "right" : undefined,
                top: `${corner.top * 2}rpx`,
                width: `${(plot.width / 2 - 6) * 2}rpx`,
              }}
            >
              {labels[corner.key]}
            </Text>
          ) : null
        )}
      </View>
    );
  },
  { displayName: "BubbleChart.Quadrants", layer: "overlay" as const }
);
export const BubbleChartSizeKey = Object.assign(
  ({
    placement = "bottom-right",
    format = compactNumber,
    label,
    className,
  }: BubbleChartSizeKeyProps) => {
    const { plot, status, sizeExtent, sizeRange } = useChart(
      "BubbleChart.SizeKey"
    );
    const stroke = useThemeToken("muted-foreground");
    if (status === "loading" || !sizeExtent) {
      return null;
    }
    const [min, max] = sizeExtent;
    const steps = [max, (min + max) / 2, min].map((value) => ({
      r: bubbleRadius(value, sizeExtent, sizeRange),
      value,
    }));
    const outer = steps[0].r;
    const width = outer * 2 + 44;
    const height = outer * 2 + (label ? 16 : 0);
    const top = placement.startsWith("top")
      ? plot.top
      : plot.top + plot.height - height;
    const left = placement.endsWith("left")
      ? plot.left
      : plot.left + plot.width - width;
    return (
      <View
        className={cn("absolute", className)}
        style={{
          height: `${height * 2}rpx`,
          left: `${left * 2}rpx`,
          pointerEvents: "none",
          top: `${top * 2}rpx`,
          width: `${width * 2}rpx`,
        }}
      >
        {label ? (
          <Text size="xs" weight="medium" numberOfLines={1}>
            {label}
          </Text>
        ) : null}
        <View
          className="relative"
          style={{ height: `${outer * 4}rpx`, width: `${width * 2}rpx` }}
        >
          {steps.map((step, index) => (
            <View
              key={index}
              className="absolute border-solid"
              style={{
                borderColor: stroke,
                borderRadius: `${step.r * 2}rpx`,
                borderWidth: "2rpx",
                bottom: 0,
                height: `${step.r * 4}rpx`,
                left: `${(outer - step.r) * 2}rpx`,
                opacity: 0.85,
                width: `${step.r * 4}rpx`,
              }}
            />
          ))}
          {steps.map((step, index) => (
            <Text
              key={index}
              size="xs"
              weight="medium"
              numberOfLines={1}
              style={{
                left: `${(outer * 2 + 6) * 2}rpx`,
                position: "absolute",
                top: `${(outer * 2 - step.r * 2 - 8) * 2}rpx`,
                width: "76rpx",
              }}
            >
              {format(step.value)}
            </Text>
          ))}
        </View>
      </View>
    );
  },
  { displayName: "BubbleChart.SizeKey", layer: "overlay" as const }
);
