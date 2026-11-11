import { Canvas, View } from "@tarojs/components";
import { useContext, useId, useMemo } from "react";

import { columnValues, compactNumber, xOf, yOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Circle } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useChartDomain } from "../LineChart/context";
import { useChartPointer } from "../LineChart/use-pointer";
import { Text } from "../primitives/Text";
import { areaChartBaselines } from "./math";
import { AreaChartStackedContext } from "./root";
import type { AreaChartTooltipProps } from "./types";

const LABEL_WIDTH = 132;
const DOT = 9;
export const AreaChartTooltip = Object.assign(
  ({ color, formatValue, formatX, className }: AreaChartTooltipProps) => {
    const {
      data,
      xDataKey,
      plot,
      series,
      status,
      width,
      height,
      activeIndexJS: index,
    } = useChart("AreaChart.Tooltip");
    const stacked = useContext(AreaChartStackedContext);
    const [min, max] = useChartDomain();
    const stroke = useThemeToken("foreground");
    const pointer = useChartPointer();
    const id = `panelui-area-touch-${useId().replaceAll(":", "")}`;
    const stacks = useMemo(
      () =>
        series.map(([key, seriesColor]) => ({
          baselines: areaChartBaselines(data, series, key, stacked),
          color: seriesColor,
          key,
          values: columnValues(data, key),
        })),
      [series, data, stacked]
    );
    if (status === "loading") {
      return null;
    }
    const active = index >= 0 ? data[index] : null;
    const x = index >= 0 ? xOf(index, data.length, plot) : 0;
    const half = LABEL_WIDTH / 2;
    const clamped = Math.min(
      plot.left + plot.width - half,
      Math.max(plot.left + half, x)
    );
    return (
      <View className="absolute inset-0">
        <Canvas
          id={id}
          type="2d"
          disableScroll={data.length > 1}
          aria-hidden
          className="panel-area-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          aria-hidden
          className="absolute left-0"
          style={{
            backgroundColor: color ?? stroke,
            height: `${plot.height * 2}rpx`,
            opacity: index < 0 ? 0 : 0.45,
            pointerEvents: "none",
            top: `${plot.top * 2}rpx`,
            transform: `translateX(${x * 2}rpx)`,
            width: "2rpx",
          }}
        />
        <View
          aria-hidden
          className="absolute inset-0"
          style={{ pointerEvents: "none" }}
        >
          <CanvasGraphics
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            {stacks.map((stack) => {
              const value = index >= 0 ? stack.values[index] : null;
              if (value === null || value === undefined) {
                return null;
              }
              return (
                <Circle
                  key={stack.key}
                  cx={xOf(index, data.length, plot)}
                  cy={yOf(
                    value + (stack.baselines?.[index] ?? 0),
                    plot,
                    min,
                    max
                  )}
                  r={DOT / 2}
                  fill={stack.color}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}
          </CanvasGraphics>
        </View>
        <View
          aria-hidden
          className="absolute top-0 left-0"
          style={{
            opacity: index < 0 ? 0 : 1,
            pointerEvents: "none",
            transform: `translateX(${(clamped - half) * 2}rpx)`,
            width: `${LABEL_WIDTH * 2}rpx`,
          }}
        >
          {active ? (
            <View
              className={cn(
                "flex flex-col rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg",
                className
              )}
            >
              <Text size="xs" muted numberOfLines={1}>
                {formatX ? formatX(active) : String(active[xDataKey] ?? "")}
              </Text>
              {series.map(([key, seriesColor]) => {
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
                      style={{ backgroundColor: seriesColor }}
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
  { displayName: "AreaChart.Tooltip", layer: "overlay" as const }
);
