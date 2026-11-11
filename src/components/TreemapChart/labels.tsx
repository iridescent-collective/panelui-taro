import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { inkOn } from "../../lib/chart-colors";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useChart, useTreemapReveal } from "./context";
import { tileProgress } from "./tiles";
import type {
  TreemapChartLabelsProps,
  TreemapChartTooltipProps,
  TreemapChartLegendProps,
  TreemapChartHeaderProps,
} from "./types";

export const TreemapChartLabels = Object.assign(
  ({
    showValue = true,
    showShare = false,
    formatValue = compactNumber,
    className,
  }: TreemapChartLabelsProps) => {
    const {
      tiles,
      minLabelSize,
      windows,
      status,
      activeIndex,
      setActiveIndex,
    } = useChart("TreemapChart.Labels");
    const grow = useTreemapReveal();
    const background = useThemeToken("background");
    if (status === "loading" || !tiles.length) {
      return null;
    }
    return (
      <>
        {tiles.map((tile, index) => {
          if (tile.width < minLabelSize || tile.height < minLabelSize) {
            return null;
          }
          const ink = inkOn(tile.color, background, tile.strength);
          const percent = Math.round(tile.share * 100);
          const progress = tileProgress(
            grow,
            windows[index] ?? { from: 0, to: 1 }
          );
          return (
            <AnimatedPressable
              key={`${tile.label}-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected: activeIndex === index }}
              accessibilityLabel={`${tile.label}, ${formatValue(tile.value, tile)}, ${percent} percent`}
              onPress={() => setActiveIndex(activeIndex === index ? -1 : index)}
              style={{
                height: `${tile.height * 2}rpx`,
                left: `${tile.x * 2}rpx`,
                opacity: progress * progress,
                pointerEvents: "auto",
                position: "absolute",
                top: `${tile.y * 2}rpx`,
                width: `${tile.width * 2}rpx`,
              }}
              className={cn(
                "flex flex-col items-start justify-start p-[16px]",
                className
              )}
            >
              <Text
                size="xs"
                weight="semibold"
                numberOfLines={1}
                style={{ color: ink.color }}
              >
                {tile.label}
              </Text>
              {showValue ? (
                <Text size="xs" numberOfLines={1} style={{ color: ink.muted }}>
                  {formatValue(tile.value, tile)}
                </Text>
              ) : null}
              {showShare ? (
                <Text size="xs" numberOfLines={1} style={{ color: ink.muted }}>
                  {percent}%
                </Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </>
    );
  },
  { displayName: "TreemapChart.Labels", slot: "overlay" as const }
);
export const TreemapChartTooltip = Object.assign(
  ({ formatValue = compactNumber, className }: TreemapChartTooltipProps) => {
    const { tiles, width, height, activeIndex, status } = useChart(
      "TreemapChart.Tooltip"
    );
    if (status === "loading" || activeIndex < 0) {
      return null;
    }
    const tile = tiles[activeIndex];
    if (!tile) {
      return null;
    }
    const left = Math.max(
      0,
      Math.min(width - 132, tile.x + tile.width / 2 - 66)
    );
    const above = tile.y - 30 - 4;
    const top = Math.max(
      0,
      Math.min(height - 30, above < 0 ? tile.y + 4 : above)
    );
    return (
      <View
        className={cn(
          "absolute flex flex-col items-center rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[16px] py-[8px] shadow-sm",
          className
        )}
        style={{
          left: `${left * 2}rpx`,
          pointerEvents: "none",
          top: `${top * 2}rpx`,
          width: "264rpx",
        }}
      >
        <Text size="xs" weight="medium" numberOfLines={1}>
          {tile.label}
        </Text>
        <Text size="xs" muted numberOfLines={1}>
          {formatValue(tile.value, tile)} · {Math.round(tile.share * 100)}%
        </Text>
      </View>
    );
  },
  { displayName: "TreemapChart.Tooltip", slot: "overlay" as const }
);
export const TreemapChartLegend = Object.assign(
  ({
    className,
    limit,
    showShare = true,
    ...props
  }: TreemapChartLegendProps) => {
    const { tiles, activeIndex, setActiveIndex } = useChart(
      "TreemapChart.Legend"
    );
    if (!tiles.length) {
      return null;
    }
    const shown =
      limit && limit > 0 ? tiles.slice(0, Math.floor(limit)) : tiles;
    return (
      <View
        {...props}
        className={cn(
          "flex w-full flex-row flex-wrap items-center gap-x-[24px] gap-y-[12px] pt-[24px]",
          className
        )}
      >
        {shown.map((tile, index) => {
          const percent = Math.round(tile.share * 100);
          const dimmed = activeIndex >= 0 && activeIndex !== index;
          return (
            <AnimatedPressable
              key={`${tile.label}-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected: activeIndex === index }}
              accessibilityLabel={`${tile.label}, ${percent} percent`}
              onPress={() => setActiveIndex(activeIndex === index ? -1 : index)}
              style={{ opacity: dimmed ? 0.4 : 1 }}
              className="flex max-w-full flex-row items-center gap-[12px]"
            >
              <View
                style={{
                  backgroundColor: tile.color,
                  borderRadius: "4rpx",
                  height: "16rpx",
                  opacity: tile.strength,
                  width: "16rpx",
                }}
              />
              <Text size="xs" muted numberOfLines={1} className="shrink">
                {tile.label}
              </Text>
              {showShare ? (
                <Text size="xs" weight="medium" numberOfLines={1}>
                  {percent}%
                </Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </View>
    );
  },
  { displayName: "TreemapChart.Legend", slot: "footer" as const }
);
export const TreemapChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    children,
    ...props
  }: TreemapChartHeaderProps) => (
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
      {children ? (
        <View className="max-w-[55%] shrink pt-[8px]">{children}</View>
      ) : null}
    </View>
  ),
  { displayName: "TreemapChart.Header", slot: "header" as const }
);
