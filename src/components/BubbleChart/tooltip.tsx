import { Canvas, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useId, useRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { readCanvasPoints } from "../../primitives/canvas-touch";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import { bubbleHit, bubbleTooltipPosition } from "./math";
import type { BubbleChartTooltipProps } from "./types";

const usePointer = (hitRadius: number) => {
  const chart = useChart("BubbleChart.Tooltip");
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
    chart.bubbles,
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
    const bubble = bubbleHit(
      current.bubbles,
      current.plot,
      current.xExtent,
      current.yExtent,
      x * contact.scale,
      y * contact.scale,
      radius
    );
    current.setActivePoint(bubble);
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
export const BubbleChartTooltip = Object.assign(
  ({
    showLabel = true,
    formatX = compactNumber,
    formatY = compactNumber,
    formatSize = compactNumber,
    hitRadius = 22,
    className,
  }: BubbleChartTooltipProps) => {
    const { bubbles, plot, xExtent, yExtent, activeIndexJS, status } = useChart(
      "BubbleChart.Tooltip"
    );
    const pointer = usePointer(hitRadius);
    const active =
      bubbles.find((bubble) => bubble.index === activeIndexJS) ?? null;
    const label = useElementLayout(Boolean(active), [
      active,
      formatX,
      formatY,
      formatSize,
      className,
    ]);
    const canvasId = `panel-bubble-pointer-${useId().replaceAll(":", "")}`;
    if (status === "loading") {
      return null;
    }
    const { x, y } = bubbleTooltipPosition(
      active,
      plot,
      xExtent,
      yExtent,
      label.layout?.height ?? 0
    );
    return (
      <View className="absolute inset-0">
        <Canvas
          id={canvasId}
          type="2d"
          aria-hidden
          disableScroll={bubbles.length > 0}
          className="panel-bubble-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        {showLabel ? (
          <View
            className="absolute top-0 left-0"
            style={{
              opacity: active ? 1 : 0,
              pointerEvents: "none",
              transform: `translate(${x * 2}rpx,${y * 2}rpx)`,
              width: "264rpx",
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
                {active.label ? (
                  <View className="flex flex-row items-center gap-[12px]">
                    <View
                      style={{ backgroundColor: active.color }}
                      className="h-[12px] w-[12px] rounded-full"
                    />
                    <Text size="xs" weight="medium" numberOfLines={1}>
                      {active.label}
                    </Text>
                  </View>
                ) : null}
                <Text size="xs" muted numberOfLines={1}>
                  {formatX(active.x)}, {formatY(active.y)}
                </Text>
                {active.size === null ? null : (
                  <Text size="xs" muted numberOfLines={1}>
                    {formatSize(active.size)}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  },
  { displayName: "BubbleChart.Tooltip", layer: "overlay" as const }
);
