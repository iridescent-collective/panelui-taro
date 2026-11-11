import { Canvas, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useId, useRef } from "react";

import { compactNumber } from "../../lib/chart";
import { readCanvasPoints } from "../../primitives/canvas-touch";
import { projectBubble } from "../BubbleChart/math";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import { scatterHit } from "./math";
import type { ScatterChartTooltipProps } from "./types";

const usePointer = (hitRadius: number) => {
  const chart = useChart("ScatterChart.Tooltip");
  const latest = useRef({ chart, hitRadius });
  latest.current = { chart, hitRadius };
  const touch = useRef<{ identifier: number; scale: number } | null>(null);
  const clear = () => {
    if (!touch.current) {
      return;
    }
    touch.current = null;
    latest.current.chart.setActivePoint(null);
  };
  useEffect(() => {
    clear();
  }, [
    chart.data,
    chart.series,
    chart.status,
    chart.plot.width,
    chart.plot.height,
    chart.plot.left,
    chart.plot.top,
  ]);
  useEffect(() => clear, []);
  const resolve = (x: number, y: number) => {
    const contact = touch.current;
    if (!contact) {
      return;
    }
    const { chart: current, hitRadius: radius } = latest.current;
    const point = scatterHit(
      current.data,
      current.series.map(([key]) => key),
      current.xDataKey,
      current.plot,
      current.xExtent,
      current.yExtent,
      x * contact.scale,
      y * contact.scale,
      radius
    );
    current.setActivePoint(point);
  };
  const onTouchStart = (event: unknown) => {
    clear();
    const [point, extra] = readCanvasPoints(event);
    if (!point || extra || latest.current.chart.status === "loading") {
      return;
    }
    touch.current = {
      identifier: point.identifier,
      scale: 375 / getWindowInfo().windowWidth,
    };
    resolve(point.x, point.y);
  };
  const onTouchMove = (event: unknown) => {
    if (!touch.current) {
      return;
    }
    const [point, extra] = readCanvasPoints(event);
    if (!point || extra || point.identifier !== touch.current.identifier) {
      clear();
      return;
    }
    resolve(point.x, point.y);
  };
  return { onTouchCancel: clear, onTouchEnd: clear, onTouchMove, onTouchStart };
};
export const ScatterChartTooltip = Object.assign(
  ({
    showLabel = true,
    formatX = compactNumber,
    formatY = compactNumber,
    formatTitle,
    hitRadius = 32,
  }: ScatterChartTooltipProps) => {
    const { activePoint, plot, series, xExtent, yExtent, status } = useChart(
      "ScatterChart.Tooltip"
    );
    const pointer = usePointer(hitRadius);
    const id = `panel-scatter-pointer-${useId().replaceAll(":", "")}`;
    if (status === "loading") {
      return null;
    }
    const center = activePoint
      ? projectBubble(activePoint, plot, xExtent, yExtent)
      : { x: 0, y: 0 };
    const x =
      Math.min(
        plot.left + plot.width - 66,
        Math.max(plot.left + 66, center.x)
      ) - 66;
    const y = center.y - plot.top < 52 ? center.y + 16 : center.y - 52;
    return (
      <View className="absolute inset-0">
        <Canvas
          id={id}
          type="2d"
          aria-hidden
          disableScroll={series.length > 0}
          className="panel-scatter-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        {showLabel ? (
          <View
            className="absolute top-0 left-0"
            style={{
              opacity: activePoint ? 1 : 0,
              pointerEvents: "none",
              transform: `translate(${x * 2}rpx,${y * 2}rpx)`,
              width: "264rpx",
            }}
          >
            <View className="flex flex-col items-center rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg">
              {activePoint ? (
                <>
                  {formatTitle ? (
                    <Text size="xs" muted numberOfLines={1}>
                      {formatTitle(activePoint.datum)}
                    </Text>
                  ) : null}
                  <View className="flex flex-row items-center gap-[12px]">
                    {series.length > 1 ? (
                      <View
                        style={{
                          backgroundColor: series.find(
                            ([key]) => key === activePoint.dataKey
                          )?.[1],
                        }}
                        className="h-[12px] w-[12px] rounded-full"
                      />
                    ) : null}
                    <Text size="sm" weight="semibold" numberOfLines={1}>
                      {formatX(activePoint.x)} ·{" "}
                      {formatY(activePoint.y, activePoint.dataKey)}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    );
  },
  { displayName: "ScatterChart.Tooltip", layer: "overlay" as const }
);
