import { Canvas, View } from "@tarojs/components";

import { xOf } from "../../lib/chart";
import { sortCopy } from "../../lib/sort-copy";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { BumpChartTooltipProps } from "./types";
import { useBumpPointer } from "./use-pointer";

export const BumpChartTooltip = Object.assign(
  ({ color, formatRank, formatX, className }: BumpChartTooltipProps) => {
    const {
      data,
      xDataKey,
      plot,
      series,
      ranks,
      highlight,
      activeIndexJS: index,
      status,
    } = useChart("BumpChart.Tooltip");
    const pointer = useBumpPointer();
    const token = useThemeToken("foreground");
    const muted = useThemeToken("muted-foreground");
    const active = index >= 0 ? data[index] : null;
    const standings = sortCopy(
      series
        .map((item) => ({ item, rank: ranks[item.key]?.[index] ?? null }))
        .filter(
          (entry): entry is { item: (typeof series)[number]; rank: number } =>
            entry.rank !== null
        ),
      (a, b) => a.rank - b.rank
    );
    const x = xOf(index, data.length, plot);
    const at =
      x + 10 + 148 <= plot.left + plot.width
        ? x + 10
        : Math.max(plot.left, x - 10 - 148);
    if (status === "loading") {
      return null;
    }
    return (
      <View
        className="absolute top-0 bottom-0 left-0"
        style={{ width: `${(plot.left + plot.width + 8) * 2}rpx` }}
      >
        <Canvas
          type="2d"
          aria-hidden
          disableScroll={data.length > 0}
          className="panel-bump-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          className="absolute left-0"
          style={{
            backgroundColor: color ?? token,
            height: `${plot.height * 2}rpx`,
            opacity: index < 0 ? 0 : 0.45,
            pointerEvents: "none",
            top: `${plot.top * 2}rpx`,
            transform: `translateX(${(index < 0 ? 0 : x) * 2}rpx)`,
            width: "2rpx",
          }}
        />
        <View
          className="absolute left-0"
          style={{
            opacity: index < 0 ? 0 : 1,
            pointerEvents: "none",
            top: `${plot.top * 2}rpx`,
            transform: `translateX(${at * 2}rpx)`,
            width: "296rpx",
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
              {standings.map(({ item, rank }) => (
                <View
                  key={item.key}
                  className="flex flex-row items-center gap-[12px]"
                >
                  <Text size="xs" muted style={{ minWidth: "40rpx" }}>
                    {formatRank ? formatRank(rank) : `#${rank}`}
                  </Text>
                  <View
                    style={{
                      backgroundColor:
                        highlight !== null && highlight !== item.key
                          ? muted
                          : item.color,
                      borderRadius: "6rpx",
                      height: "12rpx",
                      width: "12rpx",
                    }}
                  />
                  <Text
                    size="xs"
                    weight={highlight === item.key ? "semibold" : "medium"}
                    numberOfLines={1}
                    className="shrink"
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
  { displayName: "BumpChart.Tooltip", layer: "overlay" as const }
);
