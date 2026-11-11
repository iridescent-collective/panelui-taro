import { Canvas, View } from "@tarojs/components";
import { useId } from "react";

import { columnValues, compactNumber, xOf, yOf } from "../../lib/chart";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { LINE_CHART_DOT, LINE_CHART_LABEL_WIDTH } from "./constants";
import { useChart, useChartDomain } from "./context";
import type { LineChartTooltipProps } from "./types";
import { useChartPointer } from "./use-pointer";

export const LineChartTooltip = Object.assign(
  ({
    color,
    showLabel = true,
    formatValue,
    formatX,
  }: LineChartTooltipProps) => {
    const {
      data,
      xDataKey,
      plot,
      series,
      activeIndexJS: index,
      status,
    } = useChart("LineChart.Tooltip");
    const [min, max] = useChartDomain();
    const token = useThemeToken("foreground");
    const pointer = useChartPointer();
    const id = `panelui-line-touch-${useId().replaceAll(":", "")}`;
    if (status === "loading") {
      return null;
    }
    const active = index >= 0 ? data[index] : null;
    const x = index >= 0 ? xOf(index, data.length, plot) : 0;
    const half = LINE_CHART_LABEL_WIDTH / 2;
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
          className="panel-line-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        <View
          aria-hidden
          className="absolute left-0"
          style={{
            backgroundColor: color ?? token,
            height: `${plot.height * 2}rpx`,
            opacity: index < 0 ? 0 : 0.45,
            pointerEvents: "none",
            top: `${plot.top * 2}rpx`,
            transform: `translateX(${x * 2}rpx)`,
            width: "2rpx",
          }}
        />
        {series.map(([key, seriesColor]) => {
          const value = index < 0 ? null : columnValues(data, key)[index];
          if (value === null || value === undefined) {
            return null;
          }
          return (
            <View
              key={key}
              aria-hidden
              className="absolute top-0 left-0"
              style={{
                backgroundColor: seriesColor,
                borderRadius: `${LINE_CHART_DOT}rpx`,
                height: `${LINE_CHART_DOT * 2}rpx`,
                pointerEvents: "none",
                transform: `translate(${(xOf(index, data.length, plot) - LINE_CHART_DOT / 2) * 2}rpx,${(yOf(value, plot, min, max) - LINE_CHART_DOT / 2) * 2}rpx)`,
                width: `${LINE_CHART_DOT * 2}rpx`,
              }}
            />
          );
        })}
        {showLabel ? (
          <View
            aria-hidden
            className="absolute left-0"
            style={{
              opacity: index < 0 ? 0 : 1,
              pointerEvents: "none",
              top: `${Math.max(plot.top - 4, 0) * 2}rpx`,
              transform: `translateX(${(clamped - half) * 2}rpx)`,
              width: `${LINE_CHART_LABEL_WIDTH * 2}rpx`,
            }}
          >
            <View className="flex flex-col items-center rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg">
              {active ? (
                <>
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
                        {series.length > 1 ? (
                          <View
                            style={{ backgroundColor: seriesColor }}
                            className="h-[12px] w-[12px] rounded-full"
                          />
                        ) : null}
                        <Text size="sm" weight="semibold" numberOfLines={1}>
                          {formatValue
                            ? formatValue(value, key)
                            : compactNumber(value)}
                        </Text>
                      </View>
                    );
                  })}
                </>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    );
  },
  { displayName: "LineChart.Tooltip", layer: "overlay" as const }
);
