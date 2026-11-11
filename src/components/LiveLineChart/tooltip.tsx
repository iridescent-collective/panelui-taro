import { Canvas, View } from "@tarojs/components";

import { compactNumber, yOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart, useLiveFrame } from "./context";
import { xAt } from "./math";
import type { LiveLineChartTooltipProps } from "./types";
import { useLivePointer } from "./use-pointer";

export const LiveLineChartTooltip = Object.assign(
  ({ formatValue = compactNumber, className }: LiveLineChartTooltipProps) => {
    const { plot, windowMs, activePoint, status, color } = useChart(
      "LiveLineChart.Tooltip"
    );
    const frame = useLiveFrame();
    const pointer = useLivePointer();
    if (status === "loading") {
      return null;
    }
    const x = activePoint
      ? xAt(activePoint.time, plot, frame.time - windowMs, frame.time)
      : 0;
    const y = activePoint
      ? yOf(activePoint.value, plot, frame.extent[0], frame.extent[1])
      : 0;
    const at =
      Math.min(plot.left + plot.width - 58, Math.max(plot.left + 58, x)) - 58;
    const ago = activePoint
      ? Math.max(0, Math.round((Date.now() - activePoint.time) / 1000))
      : 0;
    return (
      <View className="absolute inset-0">
        <Canvas
          type="2d"
          aria-hidden
          disableScroll
          className="panel-live-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          className="absolute left-0"
          style={{
            backgroundColor: color,
            height: `${plot.height * 2}rpx`,
            opacity: activePoint ? 0.45 : 0,
            pointerEvents: "none",
            top: `${plot.top * 2}rpx`,
            transform: `translateX(${x * 2}rpx)`,
            width: "2rpx",
          }}
        />
        <View
          className="absolute top-0 left-0 rounded-full"
          style={{
            backgroundColor: color,
            height: "16rpx",
            opacity: activePoint ? 1 : 0,
            pointerEvents: "none",
            transform: `translate(${(x - 4) * 2}rpx,${(y - 4) * 2}rpx)`,
            width: "16rpx",
          }}
        />
        {activePoint ? (
          <View
            className={cn(
              "absolute top-0 left-0 flex flex-col items-center rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[16px] py-[8px] shadow-sm",
              className
            )}
            style={{
              pointerEvents: "none",
              transform: `translateX(${at * 2}rpx)`,
              width: "232rpx",
            }}
          >
            <Text size="xs" weight="medium" numberOfLines={1}>
              {formatValue(activePoint.value)}
            </Text>
            <Text size="xs" muted numberOfLines={1}>
              {ago === 0 ? "just now" : `${ago}s ago`}
            </Text>
          </View>
        ) : null}
      </View>
    );
  },
  { displayName: "LiveLineChart.Tooltip", layer: "overlay" as const }
);
