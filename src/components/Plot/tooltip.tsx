import { Canvas, View } from "@tarojs/components";
import type { ReactNode } from "react";
import { useId } from "react";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { LABEL_WIDTH } from "./constants";
import { usePlot } from "./context";
import { pointX } from "./math";
import type { PlotCursorProps, PlotDatum, PlotTooltipProps } from "./types";
import { usePlotPointer } from "./use-pointer";

export const PlotCursor = Object.assign(
  ({ color, showLine = true }: PlotCursorProps) => {
    const {
      plot,
      data,
      status,
      xScale,
      activeIndexJS: index,
    } = usePlot("Plot.Cursor");
    const foreground = useThemeToken("foreground");
    const pointer = usePlotPointer();
    const id = `panel-plot-${useId().replaceAll(":", "")}`;
    return status === "loading" ? null : (
      <View className="absolute inset-0">
        <Canvas
          id={id}
          type="2d"
          aria-hidden
          disableScroll={data.length > 1}
          className="panel-plot-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
        {showLine ? (
          <View
            aria-hidden
            className="absolute left-0"
            style={{
              backgroundColor: color ?? foreground,
              height: `${plot.height * 2}rpx`,
              opacity: index < 0 ? 0 : 0.45,
              pointerEvents: "none",
              top: `${plot.top * 2}rpx`,
              transform: `translateX(${pointX(index, data.length, plot, xScale) * 2}rpx)`,
              width: "2rpx",
            }}
          />
        ) : null}
      </View>
    );
  },
  { displayName: "Plot.Cursor", layer: "overlay" }
);
const TooltipContent = ({
  datum,
  formatValue = compactNumber,
  formatX,
}: {
  datum: PlotDatum;
  formatValue?: PlotTooltipProps["formatValue"];
  formatX?: PlotTooltipProps["formatX"];
}) => {
  const { series, xDataKey } = usePlot("Plot.Tooltip content");
  return (
    <>
      <Text size="xs" muted numberOfLines={1}>
        {formatX ? formatX(datum) : String(datum[xDataKey] ?? "")}
      </Text>
      {series.map(([key, color]) =>
        typeof datum[key] === "number" && Number.isFinite(datum[key]) ? (
          <View key={key} className="flex flex-row items-center gap-[12px]">
            {series.length > 1 ? (
              <View
                className="h-[12px] w-[12px] rounded-full"
                style={{ backgroundColor: color }}
              />
            ) : null}
            <Text size="sm" weight="semibold" numberOfLines={1}>
              {formatValue(datum[key], key)}
            </Text>
          </View>
        ) : null
      )}
    </>
  );
};
export const PlotTooltip = Object.assign(
  ({
    formatValue = compactNumber,
    formatX,
    children,
    className,
  }: PlotTooltipProps) => {
    const {
      data,
      status,
      plot,
      xScale,
      activeIndexJS: index,
    } = usePlot("Plot.Tooltip");
    if (status === "loading") {
      return null;
    }
    const active = index >= 0 ? data[index] : null;
    const half = LABEL_WIDTH / 2;
    const x = pointX(index, data.length, plot, xScale);
    const clamped = Math.min(
      plot.left + plot.width - half,
      Math.max(plot.left + half, x)
    );
    let content: ReactNode = null;
    if (active) {
      content = children ? (
        children(active, index)
      ) : (
        <TooltipContent
          datum={active}
          formatValue={formatValue}
          formatX={formatX}
        />
      );
    }
    return (
      <View
        aria-hidden
        className="absolute left-0"
        style={{
          opacity: active ? 1 : 0,
          pointerEvents: "none",
          top: `${Math.max(plot.top - 4, 0) * 2}rpx`,
          transform: `translateX(${(clamped - half) * 2}rpx)`,
          width: `${LABEL_WIDTH * 2}rpx`,
        }}
      >
        <View
          className={cn(
            "flex flex-col items-center rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[20px] py-[12px] shadow-lg",
            className
          )}
        >
          {content}
        </View>
      </View>
    );
  },
  { displayName: "Plot.Tooltip", layer: "overlay" }
);
