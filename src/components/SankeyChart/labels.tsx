import { View } from "@tarojs/components";
import { useEffect, useMemo } from "react";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import { labelPlacements } from "./math";
import type {
  SankeyChartLabelsProps,
  SankeyChartTooltipProps,
  SankeyChartHeaderProps,
} from "./types";
import { useSankeyChart } from "./use-sankey";

export const SankeyChartLabels = Object.assign(
  ({
    className,
    formatValue = compactNumber,
    showValue = false,
    minHeight = 6,
  }: SankeyChartLabelsProps) => {
    const {
      layout,
      width,
      height,
      status,
      activeId,
      setActiveId,
      labelFor,
      reportLabelled,
      orientation,
      datumFor,
    } = useChart("SankeyChart.Labels");
    const upright = orientation === "horizontal";
    const drawing = status !== "loading" && layout.nodes.length > 0;
    const placements = useMemo(
      () =>
        drawing
          ? labelPlacements(
              layout,
              width,
              height,
              upright,
              minHeight,
              showValue,
              labelFor
            )
          : [],
      [drawing, layout, width, height, upright, minHeight, showValue, labelFor]
    );
    const drawn = useMemo(
      () =>
        drawing
          ? placements.filter((item) => item.show).map((item) => item.node.id)
          : null,
      [drawing, placements]
    );
    useEffect(() => {
      reportLabelled(drawn);
      return () => reportLabelled(null);
    }, [drawn, reportLabelled]);
    if (!drawing) {
      return null;
    }
    return (
      <>
        {placements.map(
          ({ node, show, trailing, gap, crossFrom, crossSize }) => {
            if (!show) {
              return null;
            }
            const name = labelFor(node.id);
            const value = formatValue(node.value, datumFor(node));
            const selected = activeId === node.id;
            const slack = Math.max(0, (44 - crossSize) / 2);
            let align: "left" | "right" | "center" = "center";
            if (upright) {
              align = trailing ? "right" : "left";
            }
            const style = upright
              ? {
                  alignItems: trailing
                    ? ("flex-end" as const)
                    : ("flex-start" as const),
                  height: `${crossSize * 2}rpx`,
                  justifyContent: "center" as const,
                  left: `${gap.from * 2}rpx`,
                  top: `${crossFrom * 2}rpx`,
                  width: `${gap.size * 2}rpx`,
                }
              : {
                  alignItems: "center" as const,
                  height: `${gap.size * 2}rpx`,
                  justifyContent: trailing
                    ? ("flex-end" as const)
                    : ("flex-start" as const),
                  left: `${crossFrom * 2}rpx`,
                  top: `${gap.from * 2}rpx`,
                  width: `${crossSize * 2}rpx`,
                };
            return (
              <AnimatedPressable
                key={node.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${name}, ${value}`}
                hitSlop={
                  upright
                    ? { bottom: slack, top: slack }
                    : { left: slack, right: slack }
                }
                onPress={() => setActiveId(selected ? null : node.id)}
                style={{
                  ...style,
                  pointerEvents: "auto",
                  position: "absolute",
                }}
                className={cn("flex flex-col", className)}
              >
                <View className="max-w-full rounded-[var(--panel-radius-md)] bg-[var(--panel-background-opacity-80)] px-[12px] py-[4px]">
                  <Text
                    size="xs"
                    weight={selected ? "bold" : "medium"}
                    numberOfLines={1}
                    style={{ textAlign: align }}
                  >
                    {name}
                  </Text>
                  {showValue ? (
                    <Text
                      size="xs"
                      muted
                      numberOfLines={1}
                      style={{ textAlign: align }}
                    >
                      {value}
                    </Text>
                  ) : null}
                </View>
              </AnimatedPressable>
            );
          }
        )}
      </>
    );
  },
  { displayName: "SankeyChart.Labels", slot: "overlay" as const }
);
export const SankeyChartTooltip = Object.assign(
  ({ className, formatValue = compactNumber }: SankeyChartTooltipProps) => {
    const { layout, width, height, labelFor, orientation } = useChart(
      "SankeyChart.Tooltip"
    );
    const { activeId, activeValue, incoming, outgoing } = useSankeyChart();
    if (!activeId) {
      return null;
    }
    const node = layout.nodes.find((placed) => placed.id === activeId);
    if (!node) {
      return null;
    }
    const upright = orientation === "horizontal";
    const alongEnd = upright ? node.x1 : node.y1;
    const alongStart = upright ? node.x0 : node.y0;
    const alongSpan = upright ? width : height;
    const cardAlong = upright ? 132 : 68;
    const trailing = alongEnd + 6 + cardAlong > alongSpan;
    const along = trailing
      ? Math.max(0, alongStart - 6 - cardAlong)
      : Math.min(alongEnd + 6, Math.max(0, alongSpan - cardAlong));
    const crossCentre = upright
      ? (node.y0 + node.y1) / 2
      : (node.x0 + node.x1) / 2;
    const crossSpan = upright ? height : width;
    const cardCross = upright ? 68 : 132;
    const cross = Math.max(
      0,
      Math.min(crossCentre - cardCross / 2, crossSpan - cardCross)
    );
    return (
      <View
        className={cn(
          "absolute flex flex-col gap-[4px] rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] px-[20px] py-[16px] shadow-sm",
          className
        )}
        style={{
          left: `${(upright ? along : cross) * 2}rpx`,
          pointerEvents: "none",
          top: `${(upright ? cross : along) * 2}rpx`,
          width: "264rpx",
        }}
      >
        <Text size="xs" weight="bold" numberOfLines={1}>
          {labelFor(activeId)}
        </Text>
        <Text size="xs" weight="semibold" numberOfLines={1}>
          {formatValue(activeValue)}
        </Text>
        <Text
          size="xs"
          muted
          numberOfLines={1}
        >{`In ${formatValue(incoming)} · Out ${formatValue(outgoing)}`}</Text>
      </View>
    );
  },
  { displayName: "SankeyChart.Tooltip", slot: "overlay" as const }
);
export const SankeyChartHeader = Object.assign(
  ({
    title,
    value,
    caption,
    className,
    children,
    ...props
  }: SankeyChartHeaderProps) => (
    <View
      {...props}
      className={cn(
        "flex flex-row items-start justify-between gap-[24px] pb-[24px]",
        className
      )}
    >
      <View className="flex flex-1 flex-col gap-[4px]">
        {title ? (
          <Text size="xs" muted>
            {title}
          </Text>
        ) : null}
        {value ? (
          <Text size="xl" weight="bold">
            {value}
          </Text>
        ) : null}
        {caption ? (
          <Text size="xs" muted>
            {caption}
          </Text>
        ) : null}
      </View>
      {children ? (
        <View className="max-w-[55%] shrink pt-[8px]">{children}</View>
      ) : null}
    </View>
  ),
  { displayName: "SankeyChart.Header", slot: "header" as const }
);
