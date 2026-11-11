import { Canvas, View } from "@tarojs/components";
import { useId, useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { compactNumber } from "../../lib/chart";
import type { ChartPoint } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useCanvasTap } from "../../primitives/use-canvas-tap";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import { hexAt } from "./math";
import type { HexChartTooltipProps } from "./types";

const HexChartLabel = ({
  anchor,
  width,
  height,
  color,
  value,
  detail,
  className,
}: {
  anchor: ChartPoint;
  width: number;
  height: number;
  color?: string;
  value: string;
  detail: string;
  className?: string;
}) => {
  const measurement = useElementLayout(
    true,
    [value, detail, className],
    undefined,
    false
  );
  const size = measurement.layout;
  const left = size
    ? Math.max(0, Math.min(width - size.width, anchor.x - size.width / 2))
    : 0;
  const top = size
    ? Math.max(0, Math.min(height - size.height, anchor.y - 6 - size.height))
    : 0;
  return (
    <View
      id={measurement.id}
      className={cn(
        "absolute flex flex-row items-center gap-[12px] rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-overlay)] px-[16px] py-[8px] shadow-md",
        className
      )}
      style={{
        left: `${left * 2}rpx`,
        maxWidth: `${width * 2}rpx`,
        opacity: size ? 1 : 0,
        pointerEvents: "none",
        top: `${top * 2}rpx`,
      }}
    >
      <View
        style={{ backgroundColor: color }}
        className="h-[16px] w-[16px] rounded-full"
      />
      <Text size="xs" weight="medium" numberOfLines={1} className="shrink">
        {value}
      </Text>
      <Text size="xs" muted numberOfLines={1} className="shrink">
        {detail}
      </Text>
    </View>
  );
};
export const HexChartTooltip = Object.assign(
  ({ formatValue, showCells = false, className }: HexChartTooltipProps) => {
    const {
      data,
      plan,
      total,
      colors,
      metrics,
      columns,
      rows,
      left,
      top,
      width,
      height,
      status,
      activeIndex,
      setActiveIndex,
    } = useChart("HexChart.Tooltip");
    const reset = useMemo(
      () => ({ columns, left, metrics, plan, rows, status, top }),
      [plan, metrics, left, top, columns, rows, status]
    );
    const pointer = useCanvasTap(
      (x, y) => {
        const cell = hexAt(x, y, metrics, left, top, columns, rows);
        return {
          index: cell
            ? (plan.owners[cell.row * columns + cell.column] ?? -1)
            : -1,
        };
      },
      (target) =>
        setActiveIndex(target.index === activeIndex ? -1 : target.index),
      reset
    );
    const id = `panel-hex-pointer-${useId().replaceAll(":", "")}`;
    if (status === "loading" || width <= 0) {
      return null;
    }
    const series = activeIndex >= 0 ? (data[activeIndex] ?? null) : null;
    const anchor = series ? plan.labelAnchors[activeIndex] : null;
    const percent =
      series && total > 0
        ? Math.round((Math.max(0, series.value) / total) * 100)
        : 0;
    return (
      <>
        <Canvas
          id={id}
          type="2d"
          aria-label="Select a series"
          className="panel-hex-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        {series && anchor ? (
          <HexChartLabel
            key={activeIndex}
            anchor={anchor}
            width={width}
            height={height}
            color={colors[activeIndex]}
            value={
              formatValue
                ? formatValue(series.value, series)
                : compactNumber(series.value)
            }
            detail={
              showCells
                ? `${percent}% · ${plan.counts[activeIndex] ?? 0} cells`
                : `${percent}%`
            }
            className={className}
          />
        ) : null}
      </>
    );
  },
  { displayName: "HexChart.Tooltip", slot: "overlay" as const }
);
