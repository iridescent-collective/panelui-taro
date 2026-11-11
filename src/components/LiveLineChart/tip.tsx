import { View } from "@tarojs/components";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { compactNumber, yOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useChartTween } from "../../primitives/chart-tween";
import { Text } from "../primitives/Text";
import { useChart, useLiveFrame } from "./context";
import { xAt } from "./math";
import type { LiveLineChartTipProps, LiveLineChartHeaderProps } from "./types";

export const LiveLineChartTip = Object.assign(
  ({
    badge = false,
    pulse = true,
    formatValue = compactNumber,
    className,
  }: LiveLineChartTipProps) => {
    const { plot, data, status, color, latest, activePoint, windowMs } =
      useChart("LiveLineChart.Tip");
    const frame = useLiveFrame();
    const reduced = usePanelReducedMotion();
    const tweenRef = useRef<ReturnType<typeof useChartTween> | null>(null);
    const beat = useChartTween(0, undefined, (value) => {
      if (value === 1 && pulse && !reduced && status !== "loading") {
        tweenRef.current?.setImmediate(0);
        tweenRef.current?.timingTo(1, 1600);
      }
    });
    tweenRef.current = beat;
    useEffect(() => {
      beat.setImmediate(0);
      if (pulse && !reduced && status !== "loading") {
        beat.timingTo(1, 1600);
      }
      return beat.stop;
    }, [pulse, reduced, status, beat.setImmediate, beat.timingTo, beat.stop]);
    const progress = useSyncExternalStore(
      beat.signal.subscribe,
      beat.signal.getSnapshot,
      beat.signal.getSnapshot
    );
    let visible;
    for (const point of data) {
      if (point.time <= frame.time) {
        visible = point;
      }
    }
    if (status === "loading" || !latest) {
      return null;
    }
    const shown = visible && visible.time >= frame.time - windowMs;
    const x = visible
      ? xAt(visible.time, plot, frame.time - windowMs, frame.time)
      : 4;
    const y = visible
      ? yOf(visible.value, plot, frame.extent[0], frame.extent[1])
      : 4;
    return (
      <View
        className="panel-live-tip absolute top-0 left-0"
        style={{
          height: "16rpx",
          opacity: shown ? 1 : 0,
          pointerEvents: "none",
          transform: `translate(${(x - 4) * 2}rpx,${(y - 4) * 2}rpx)`,
          width: "16rpx",
        }}
      >
        {pulse ? (
          <View
            className="absolute h-[16px] w-[16px] rounded-full"
            style={{
              backgroundColor: color,
              opacity: (1 - progress) * 0.55,
              transform: `scale(${1 + progress * 2.2})`,
            }}
          />
        ) : null}
        <View
          className="h-[16px] w-[16px] rounded-full"
          style={{ backgroundColor: color }}
        />
        {badge && !activePoint ? (
          <View
            className={cn(
              "absolute rounded-[var(--panel-radius-md)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[12px] py-[4px]",
              className
            )}
            style={{ right: "32rpx", top: "-12rpx" }}
          >
            <Text size="xs" weight="medium" numberOfLines={1}>
              {formatValue(latest.value)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  },
  { displayName: "LiveLineChart.Tip", layer: "overlay" as const }
);
export const LiveLineChartHeader = Object.assign(
  ({
    title,
    value,
    caption,
    formatValue = compactNumber,
    className,
    children,
    ...props
  }: LiveLineChartHeaderProps) => {
    const { activePoint, latest } = useChart("LiveLineChart.Header");
    const shown = activePoint ?? latest;
    return (
      <View
        {...props}
        className={cn(
          "flex flex-row items-start justify-between gap-[24px] pb-[24px]",
          className
        )}
      >
        <View aria-hidden className="flex flex-1 flex-col gap-[4px]">
          {title ? (
            <Text size="xs" muted>
              {title}
            </Text>
          ) : null}
          <Text size="xl" weight="bold">
            {value ?? (shown ? formatValue(shown.value) : "—")}
          </Text>
          {caption ? (
            <Text size="xs" muted>
              {caption}
            </Text>
          ) : null}
        </View>
        {children ? (
          <View className="max-w-[55%] shrink pt-[8px]">{children}</View>
        ) : null}
      </View>
    );
  },
  { displayName: "LiveLineChart.Header", layer: "header" as const }
);
