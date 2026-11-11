import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ComponentRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { useAxisLabelScale } from "../../primitives/chart-axis-text";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { getRegisteredThemeTokens } from "../../theme/registry";
import type { PanelTheme, ThemeToken } from "../../theme/types";
import { useTheme } from "../../theme/use-theme";
import { DAYS_IN_WEEK, DEFAULT_AXIS_WIDTH, LEVEL_OPACITY } from "./constants";
import { HeatmapContext, HeatmapOrderContext, useHeatmap } from "./context";
import { deriveLevels, heatmapGrid, heatmapLevel } from "./math";
import type { HeatmapChartProps, HeatmapCell } from "./types";

const resolveColor = (
  value: string | undefined,
  fallback: ThemeToken,
  theme: PanelTheme
) => {
  if (value?.startsWith("--")) {
    const token = value.replace(/^--color-/u, "");
    if (Object.hasOwn(getRegisteredThemeTokens(theme), token)) {
      return getRegisteredThemeTokens(theme)[token as ThemeToken];
    }
    return fallback === "chart-1" ? "#262626" : "rgba(128,128,128,0.16)";
  }
  return value ?? getRegisteredThemeTokens(theme)[fallback];
};
const lastSlot = <T extends { slot: string }>(parts: T[], slot: string) => {
  let selected: T | undefined;
  for (const part of parts) {
    if (part.slot === slot) {
      selected = part;
    }
  }
  return selected;
};
const rampModel = (
  colors: string[] | undefined,
  opacity: number[] | undefined,
  empty: string,
  base: string
) =>
  colors
    ? { opacities: colors.map(() => 1), ramp: colors }
    : {
        opacities: opacity ?? [...LEVEL_OPACITY],
        ramp: [empty, base, base, base, base],
      };
const GraphicLayer = () => {
  const { graphics, grid, reveal } = useHeatmap("HeatmapChart graphics");
  const parts = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  const grow = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  return (
    <View
      className="absolute inset-y-0 left-0 overflow-hidden"
      style={{ pointerEvents: "none", width: `${grid.width * grow * 2}rpx` }}
    >
      <CanvasGraphics
        width={grid.width}
        height={grid.height}
        viewBox={`0 0 ${grid.width} ${grid.height}`}
      >
        {parts.map((part) => part.node)}
      </CanvasGraphics>
    </View>
  );
};
export const HeatmapChartRoot = forwardRef<
  ComponentRef<typeof View>,
  HeatmapChartProps
>(
  (
    {
      className,
      data,
      layout = "fluid",
      binSize = 12,
      gap = 3,
      cornerRadius = 2,
      weekStartDay = 0,
      rows = DAYS_IN_WEEK,
      levels,
      levelColors,
      color,
      emptyColor,
      levelOpacity,
      animationDuration = 900,
      inactiveOpacity = 1,
      onActiveCellChange,
      accessible,
      accessibilityLabel,
      accessibilityHint,
      accessibilityLabelForDatum,
      onAccessibilityDatumPress,
      children,
      onLayout,
      ...props
    },
    ref
  ) => {
    const measure = useElementLayout(
      true,
      [className, children, layout, binSize],
      props.id,
      false
    );
    const width = measure.layout?.width ?? 0;
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child, order) => ({
        child,
        order,
        slot: (child.type as { slot?: string }).slot ?? "cells",
      }));
    const y = lastSlot(parts, "y-axis");
    const x = lastSlot(parts, "x-axis");
    const labelScale = useAxisLabelScale();
    const axisWidth = y
      ? ((y.child.props as { width?: number }).width ??
        Math.ceil(DEFAULT_AXIS_WIDTH * labelScale))
      : 0;
    const grid = useMemo(
      () =>
        heatmapGrid(data.length, width, axisWidth, layout, binSize, gap, rows),
      [data.length, width, axisWidth, layout, binSize, gap, rows]
    );
    const { theme } = useTheme();
    const base = resolveColor(color, "chart-1", theme);
    const empty = resolveColor(emptyColor, "muted", theme);
    const thresholds = useMemo(
      () => levels ?? deriveLevels(data),
      [levels, data]
    );
    const levelOf = useCallback(
      (count: number) => heatmapLevel(count, thresholds),
      [thresholds]
    );
    const cellAt = useCallback(
      (column: number, row: number): HeatmapCell => {
        const bin = data[column]?.bins.find(
          (candidate) => candidate.bin === row
        );
        const count = bin?.count ?? 0;
        return { column, count, date: bin?.date, level: levelOf(count), row };
      },
      [data, levelOf]
    );
    const { ramp, opacities } = rampModel(
      levelColors,
      levelOpacity,
      empty,
      base
    );
    const [activeCell, setActive] = useState<HeatmapCell | null>(null);
    const current = useRef("");
    const setActiveCell = useCallback(
      (cell: HeatmapCell | null) => {
        const key = cell ? `${cell.column}:${cell.row}` : "";
        if (current.current === key) {
          return;
        }
        current.current = key;
        setActive(cell);
        onActiveCellChange?.(cell);
      },
      [onActiveCellChange]
    );
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartCubicOut);
    const revealed = useRef(false);
    useEffect(() => {
      if (revealed.current || grid.width <= 0) {
        return;
      }
      revealed.current = true;
      if (reduced) {
        reveal.setImmediate(1);
      } else {
        reveal.timingTo(1, animationDuration);
      }
    }, [
      grid.width,
      reduced,
      animationDuration,
      reveal.setImmediate,
      reveal.timingTo,
    ]);
    const [graphics] = useState(createChartGraphicsStore);
    useEffect(() => {
      if (measure.layout) {
        onLayout?.({
          nativeEvent: {
            layout: {
              height: measure.layout.height,
              width: measure.layout.width,
              x: measure.layout.left,
              y: measure.layout.top,
            },
          },
        });
      }
    }, [measure.layout, onLayout]);
    const context = {
      activeCell,
      cellAt,
      cornerRadius,
      data,
      graphics,
      grid,
      inactiveOpacity,
      levelOf,
      opacities,
      ramp,
      reveal: reveal.signal,
      setActiveCell,
      weekStartDay,
    };
    const render = (slot: string) =>
      parts
        .filter((part) => part.slot === slot)
        .map(({ child, order }) => (
          <HeatmapOrderContext.Provider
            key={child.key ?? order}
            value={slot === "rules" ? -10_000 + order : order}
          >
            {child}
          </HeatmapOrderContext.Provider>
        ));
    return (
      <HeatmapContext.Provider value={context}>
        <View
          {...props}
          ref={ref}
          id={props.id ?? measure.id}
          className={cn("w-full", className)}
        >
          {render("header")}
          <ChartAccessibilityData
            chart="Heatmap chart"
            data={data.flatMap((column) =>
              column.bins.map((bin) => ({
                column: column.bin,
                count: bin.count,
                date: bin.date,
                level: levelOf(bin.count),
                row: bin.bin,
              }))
            )}
            disabled={accessible === false}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityLabelForDatum={accessibilityLabelForDatum}
            onAccessibilityDatumPress={onAccessibilityDatumPress}
            valueOf={(cell) => [
              ["date", cell.date],
              ["column", cell.column],
              ["row", cell.row],
              ["count", cell.count],
            ]}
          />
          {x ? (
            <View style={{ paddingLeft: `${axisWidth * 2}rpx` }} aria-hidden>
              {x.child}
            </View>
          ) : null}
          <View className="flex flex-row" aria-hidden>
            {y?.child}
            <View
              className="relative shrink-0"
              style={{
                height: `${grid.height * 2}rpx`,
                width: `${grid.width * 2}rpx`,
              }}
            >
              {grid.width > 0 ? (
                <>
                  <GraphicLayer />
                  {render("rules")}
                  {render("cells")}
                  {render("tooltip")}
                </>
              ) : null}
            </View>
          </View>
          {render("legend")}
        </View>
      </HeatmapContext.Provider>
    );
  }
);
HeatmapChartRoot.displayName = "HeatmapChart";
