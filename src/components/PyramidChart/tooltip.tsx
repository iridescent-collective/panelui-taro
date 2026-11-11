import { Canvas, View } from "@tarojs/components";

import { useElementLayout } from "../../hooks/use-element-layout";
import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { useChartPointer } from "../LineChart/use-pointer";
import { Text } from "../primitives/Text";
import type { PyramidChartTooltipProps } from "./types";

const LABEL_WIDTH = 132;
export const PyramidChartTooltip = Object.assign(
  ({ formatValue, formatX, className }: PyramidChartTooltipProps) => {
    const {
      data,
      xDataKey,
      plot,
      series,
      status,
      activeIndexJS: index,
    } = useChart("PyramidChart.Tooltip");

    const pointer = useChartPointer((_x, y) => {
      if (!data.length) {
        return -1;
      }
      const span = plot.height;
      const offset = (y - plot.top) / (span || 1);
      return Math.max(
        0,
        Math.min(data.length - 1, Math.floor(offset * data.length))
      );
    });
    const active = index >= 0 ? data[index] : null;
    const label = useElementLayout(Boolean(active), [
      active,
      series,
      className,
    ]);
    if (status === "loading") {
      return null;
    }
    const band = plot.height / Math.max(data.length, 1);
    const centre = plot.top + band * (index + 0.5);
    const x = plot.left + plot.width / 2 - LABEL_WIDTH / 2;
    const tall = label.layout?.height ?? 0;
    const y = Math.min(
      plot.top + Math.max(plot.height - tall, 0),
      Math.max(plot.top, centre - tall / 2)
    );
    return (
      <View className="absolute inset-0">
        <Canvas
          type="2d"
          aria-hidden
          disableScroll={data.length > 0}
          className="panel-pyramid-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          aria-hidden
          className="absolute top-0 left-0"
          style={{
            opacity: index < 0 ? 0 : 1,
            pointerEvents: "none",
            transform: `translate(${x * 2}rpx,${y * 2}rpx)`,
            width: `${LABEL_WIDTH * 2}rpx`,
          }}
        >
          {active ? (
            <View
              id={label.id}
              className={cn(
                "flex flex-col rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg",
                className
              )}
            >
              <Text size="xs" muted numberOfLines={1}>
                {formatX ? formatX(active) : String(active[xDataKey] ?? "")}
              </Text>
              {series.map(([key, color]) => {
                const value = active[key];
                if (typeof value !== "number" || !Number.isFinite(value)) {
                  return null;
                }
                return (
                  <View
                    key={key}
                    className="flex flex-row items-center gap-[12px]"
                  >
                    <View
                      style={{ backgroundColor: color }}
                      className="h-[12px] w-[12px] rounded-full"
                    />
                    <Text size="xs" weight="medium">
                      {formatValue
                        ? formatValue(value, key)
                        : compactNumber(value)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
  { displayName: "PyramidChart.Tooltip", layer: "overlay" as const }
);
