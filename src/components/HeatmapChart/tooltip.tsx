import { Canvas, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "../../lib/utils";
import { readCanvasPoints } from "../../primitives/canvas-touch";
import { Text } from "../primitives/Text";
import { DEFAULT_HOLD, TOOLTIP_HEIGHT } from "./constants";
import { useHeatmap } from "./context";
import { defaultTooltipLabel, heatmapHit } from "./math";
import type { HeatmapTooltipProps } from "./types";

interface Contact {
  identifier: number;
  scale: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  active: boolean;
}
const useHeldPointer = (hold: number) => {
  const chart = useHeatmap("HeatmapChart pointer");
  const latest = useRef(chart);
  latest.current = chart;
  const contact = useRef<Contact | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reading, setReading] = useState(false);
  const finish = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const active = contact.current?.active ?? false;
    contact.current = null;
    setReading(false);
    if (active) {
      latest.current.setActiveCell(null);
    }
  };
  const resolve = () => {
    const touch = contact.current;
    if (!touch?.active) {
      return;
    }
    const cell = heatmapHit(
      touch.x * touch.scale,
      touch.y * touch.scale,
      latest.current.grid
    );
    if (cell) {
      latest.current.setActiveCell(
        latest.current.cellAt(cell.column, cell.row)
      );
    }
  };
  const activate = () => {
    const touch = contact.current;
    if (!touch) {
      return;
    }
    timer.current = null;
    touch.active = true;
    setReading(true);
    resolve();
  };
  useEffect(() => {
    finish();
  }, [
    chart.data,
    chart.grid.size,
    chart.grid.gap,
    chart.grid.columns,
    chart.grid.rows,
    hold,
  ]);
  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
      contact.current = null;
    },
    []
  );
  const onTouchStart = (event: unknown) => {
    finish();
    const [point, extra] = readCanvasPoints(event);
    if (!point || extra) {
      return;
    }
    contact.current = {
      active: false,
      identifier: point.identifier,
      scale: 375 / getWindowInfo().windowWidth,
      startX: point.x,
      startY: point.y,
      x: point.x,
      y: point.y,
    };
    if (hold <= 0) {
      activate();
    } else {
      timer.current = setTimeout(activate, hold);
    }
  };
  const onTouchMove = (event: unknown) => {
    const touch = contact.current;
    if (!touch) {
      return;
    }
    const [point, extra] = readCanvasPoints(event);
    if (!point || extra || point.identifier !== touch.identifier) {
      finish();
      return;
    }
    touch.x = point.x;
    touch.y = point.y;
    if (
      !touch.active &&
      Math.hypot(point.x - touch.startX, point.y - touch.startY) * touch.scale >
        10
    ) {
      finish();
      return;
    }
    resolve();
  };
  return {
    onTouchCancel: finish,
    onTouchEnd: finish,
    onTouchMove,
    onTouchStart,
    reading,
  };
};
export const HeatmapTooltip = Object.assign(
  ({
    className,
    formatLabel,
    activateAfterLongPress = DEFAULT_HOLD,
  }: HeatmapTooltipProps) => {
    const { grid, activeCell } = useHeatmap("HeatmapChart.Tooltip");
    const { reading, ...pointer } = useHeldPointer(activateAfterLongPress);
    const id = `panel-heatmap-touch-${useId().replaceAll(":", "")}`;
    const step = grid.size + grid.gap;
    let label: string | null = null;
    if (activeCell) {
      label = formatLabel
        ? formatLabel(activeCell)
        : defaultTooltipLabel(activeCell);
    }
    const anchorX = activeCell ? activeCell.column * step + grid.size / 2 : 0;
    const flipped = anchorX > grid.width / 2;
    const below = (activeCell?.row ?? 0) < 2;
    let anchorY = 0;
    if (activeCell) {
      anchorY = below
        ? activeCell.row * step + grid.size + 6
        : activeCell.row * step - TOOLTIP_HEIGHT - 6;
    }
    return (
      <>
        <Canvas
          id={id}
          type="2d"
          aria-hidden
          disableScroll={reading}
          className="panel-heatmap-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        {activeCell && label ? (
          <View
            className={cn(
              "absolute rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[16px] py-[8px] shadow-md",
              className
            )}
            style={{
              pointerEvents: "none",
              top: `${anchorY * 2}rpx`,
              ...(flipped
                ? { right: `${(grid.width - anchorX) * 2}rpx` }
                : { left: `${anchorX * 2}rpx` }),
            }}
          >
            <Text
              size="xs"
              className="text-[color:var(--panel-popover-foreground)]"
            >
              {label}
            </Text>
          </View>
        ) : null}
      </>
    );
  },
  { displayName: "HeatmapChart.Tooltip", slot: "tooltip" as const }
);
