import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type {
  SankeyChartFlow,
  SankeyChartBreakdownProps,
  SankeyChartLegendProps,
} from "./types";
import { useSankeyChart } from "./use-sankey";

const BreakdownSide = ({
  title,
  rows,
  limit,
  format,
  onSelect,
}: {
  title: string;
  rows: SankeyChartFlow[];
  limit?: number;
  format: (value: number) => string;
  onSelect: (id: string) => void;
}) => {
  if (!rows.length) {
    return null;
  }
  const shown = limit ? rows.slice(0, limit) : rows;
  const rest = rows.length - shown.length;
  return (
    <View className="flex w-full flex-col gap-[8px]">
      <Text size="xs" muted weight="medium">
        {title}
      </Text>
      {shown.map((row) => (
        <AnimatedPressable
          key={`${title}-${row.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${row.label}, ${format(row.value)}, ${Math.round(row.share * 100)} percent`}
          onPress={() => onSelect(row.id)}
          className="flex w-full flex-row items-center gap-[16px] py-[8px]"
        >
          <View
            style={{
              backgroundColor: row.color,
              borderRadius: "4rpx",
              height: "16rpx",
              width: "16rpx",
            }}
          />
          <Text size="xs" numberOfLines={1} className="shrink grow">
            {row.label}
          </Text>
          <Text size="xs" weight="medium" numberOfLines={1}>
            {format(row.value)}
          </Text>
          <Text
            size="xs"
            muted
            numberOfLines={1}
            className="w-[80px] text-right"
          >{`${Math.round(row.share * 100)}%`}</Text>
        </AnimatedPressable>
      ))}
      {rest > 0 ? <Text size="xs" muted>{`and ${rest} more`}</Text> : null}
    </View>
  );
};
export const SankeyChartBreakdown = Object.assign(
  ({
    className,
    formatValue = compactNumber,
    maxRows,
    onSelectNode,
    placeholder = "Select a stage to see what it carries",
    ...props
  }: SankeyChartBreakdownProps) => {
    const { status, setActiveId, labelFor } = useChart("SankeyChart.Breakdown");
    const { activeId, activeValue, sources, targets } = useSankeyChart();
    if (status === "loading") {
      return null;
    }
    const limit = maxRows && maxRows > 0 ? Math.floor(maxRows) : undefined;
    if (!activeId) {
      return (
        <View {...props} className={cn("w-full pt-[24px]", className)}>
          <Text size="xs" muted>
            {placeholder}
          </Text>
        </View>
      );
    }
    const select = (id: string) => {
      setActiveId(id);
      onSelectNode?.(id);
    };
    return (
      <View
        {...props}
        className={cn("flex w-full flex-col gap-[16px] pt-[24px]", className)}
      >
        <View className="flex w-full flex-row items-baseline justify-between gap-[16px]">
          <Text size="xs" weight="bold" numberOfLines={1} className="shrink">
            {labelFor(activeId)}
          </Text>
          <Text size="xs" weight="semibold">
            {formatValue(activeValue)}
          </Text>
        </View>
        <BreakdownSide
          title="In"
          rows={sources}
          limit={limit}
          format={formatValue}
          onSelect={select}
        />
        <BreakdownSide
          title="Out"
          rows={targets}
          limit={limit}
          format={formatValue}
          onSelect={select}
        />
      </View>
    );
  },
  { displayName: "SankeyChart.Breakdown", slot: "footer" as const }
);
export const SankeyChartLegend = Object.assign(
  ({
    className,
    limit,
    showShare = true,
    ...props
  }: SankeyChartLegendProps) => {
    const { layout, colors, status, activeId, setActiveId, labelFor } =
      useChart("SankeyChart.Legend");
    if (status === "loading" || !layout.nodes.length) {
      return null;
    }
    let total = 0;
    const byLayer = new Map<number, number>();
    for (const node of layout.nodes) {
      const carried = (byLayer.get(node.layer) ?? 0) + node.value;
      byLayer.set(node.layer, carried);
      if (carried > total) {
        total = carried;
      }
    }
    const shown =
      limit && limit > 0
        ? layout.nodes.slice(0, Math.floor(limit))
        : layout.nodes;
    return (
      <View
        {...props}
        className={cn(
          "flex w-full flex-row flex-wrap items-center gap-x-[24px] gap-y-[12px] pt-[24px]",
          className
        )}
      >
        {shown.map((node, index) => {
          const percent =
            total > 0 ? Math.round((node.value / total) * 100) : 0;
          const selected = activeId === node.id;
          const dimmed = activeId !== null && !selected;
          return (
            <AnimatedPressable
              key={node.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${labelFor(node.id)}, ${percent} percent`}
              onPress={() => setActiveId(selected ? null : node.id)}
              style={{ opacity: dimmed ? 0.4 : 1 }}
              className="flex max-w-full flex-row items-center gap-[12px]"
            >
              <View
                style={{
                  backgroundColor: colors[index] ?? "#3b82f6",
                  borderRadius: "4rpx",
                  height: "16rpx",
                  width: "16rpx",
                }}
              />
              <Text size="xs" muted numberOfLines={1} className="shrink">
                {labelFor(node.id)}
              </Text>
              {showShare ? (
                <Text
                  size="xs"
                  weight="medium"
                  numberOfLines={1}
                >{`${percent}%`}</Text>
              ) : null}
            </AnimatedPressable>
          );
        })}
      </View>
    );
  },
  { displayName: "SankeyChart.Legend", slot: "footer" as const }
);
