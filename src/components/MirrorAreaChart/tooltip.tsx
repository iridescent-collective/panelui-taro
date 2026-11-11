import { Canvas, View } from "@tarojs/components";
import { useMemo } from "react";

import { compactNumber, xOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { Circle, G, SvgLine } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useChart, useMirrorFrame, useMirrorGraphic } from "./context";
import type { MirrorAreaChartTooltipProps } from "./types";
import { useMirrorPointer } from "./use-pointer";

export const MirrorAreaChartTooltip = Object.assign(
  ({
    color,
    formatValue = compactNumber,
    formatX,
    formatSummary,
    className,
  }: MirrorAreaChartTooltipProps) => {
    const {
      data,
      xDataKey,
      plot,
      baseline,
      series,
      activeIndexJS: index,
      status,
    } = useChart("MirrorAreaChart.Tooltip");
    const frame = useMirrorFrame();
    const pointer = useMirrorPointer();
    const foreground = useThemeToken("foreground");
    const background = useThemeToken("background");
    const stroke = color ?? foreground;
    const top = series.some((item) => item.side === "top");
    const dotValues = useMemo(
      () =>
        data.map((row) => {
          let most: number | null = null;
          for (const item of series) {
            if (item.side !== (top ? "top" : "bottom")) {
              continue;
            }
            const value = row[item.key];
            if (
              typeof value === "number" &&
              Number.isFinite(value) &&
              (most === null || value > most)
            ) {
              most = value;
            }
          }
          return most;
        }),
      [data, series, top]
    );
    const value = dotValues[index];
    const valid = index >= 0 && value !== null && value !== undefined;
    const max = top ? frame.topMax : frame.bottomMax;
    const height = top
      ? baseline - plot.top
      : plot.top + plot.height - baseline;
    const reach = valid
      ? (Math.max(value, 0) / (max > 0 ? max : 1)) * height * frame.grow
      : 0;
    const x = index < 0 ? 0 : xOf(index, data.length, plot);
    const node = useMemo(
      () =>
        status === "loading" ? null : (
          <G>
            <SvgLine
              x1={x}
              x2={x}
              y1={plot.top}
              y2={plot.top + plot.height}
              opacity={index < 0 ? 0 : 0.6}
              stroke={stroke}
              strokeWidth={1}
              strokeDasharray="3,4"
            />
            <Circle
              opacity={valid ? 1 : 0}
              cx={valid ? x : 0}
              cy={valid ? baseline + (top ? -reach : reach) : 0}
              r={4.5}
              fill={stroke}
              stroke={background}
              strokeWidth={2}
            />
          </G>
        ),
      [status, x, plot, index, stroke, valid, baseline, top, reach, background]
    );
    useMirrorGraphic(node, "series", 10_000);
    const active = index >= 0 ? data[index] : null;
    const at =
      x - 14.5 - 168 >= plot.left
        ? x - 14.5 - 168
        : Math.min(x + 14.5, plot.left + plot.width - 168);
    if (status === "loading") {
      return null;
    }
    return (
      <View className="absolute inset-0">
        <Canvas
          type="2d"
          aria-hidden
          disableScroll={data.length > 0}
          className="panel-mirror-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          className="absolute left-0"
          style={{
            opacity: index < 0 ? 0 : 1,
            pointerEvents: "none",
            top: `${plot.top * 2}rpx`,
            transform: `translateX(${at * 2}rpx)`,
            width: "336rpx",
          }}
        >
          {active ? (
            <View
              className={cn(
                "flex flex-col gap-[4px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg",
                className
              )}
            >
              <Text size="xs" muted numberOfLines={1}>
                {formatX ? formatX(active) : String(active[xDataKey] ?? "")}
              </Text>
              {formatSummary ? (
                <Text size="xs" weight="semibold" numberOfLines={2}>
                  {formatSummary(active)}
                </Text>
              ) : (
                series.map((item) => {
                  const reading = active[item.key];
                  if (typeof reading !== "number") {
                    return null;
                  }
                  return (
                    <View
                      key={item.key}
                      className="flex flex-row items-center gap-[12px]"
                    >
                      <View
                        style={{
                          backgroundColor: item.color,
                          borderRadius: "6rpx",
                          height: "12rpx",
                          width: "12rpx",
                        }}
                      />
                      <Text size="xs" weight="medium">
                        {formatValue(reading, item.key)}
                      </Text>
                      <Text
                        size="xs"
                        muted
                        numberOfLines={1}
                        className="shrink"
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
  { displayName: "MirrorAreaChart.Tooltip", layer: "overlay" as const }
);
