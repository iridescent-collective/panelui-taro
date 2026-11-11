import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useWaterfallSettings } from "./root";
import type {
  WaterfallKind,
  WaterfallChartHeaderProps,
  WaterfallChartLegendProps,
} from "./types";

export const SeriesSwatch = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => (
  <View className="flex flex-row items-center gap-[12px]">
    <View
      style={{ backgroundColor: color }}
      className="h-[16px] w-[16px] rounded-full"
    />
    <Text size="xs" muted>
      {label}
    </Text>
  </View>
);
export const WaterfallChartLegend = Object.assign(
  ({ className, labels, style, ...props }: WaterfallChartLegendProps) => {
    const { steps, colors } = useWaterfallSettings();
    const present = (["rise", "fall", "total"] as WaterfallKind[]).filter(
      (kind) => steps.some((step) => step.kind === kind)
    );
    const series = present.map((kind) => [kind, colors[kind]] as const);
    const names = {
      fall: labels?.fall ?? "Decrease",
      rise: labels?.rise ?? "Increase",
      total: labels?.total ?? "Total",
    };
    if (!series.length) {
      return null;
    }
    return (
      <View
        {...props}
        className={cn(
          "absolute top-[8px] right-[16px] flex flex-row gap-[24px]",
          className
        )}
        style={mergeStyle({ pointerEvents: "none" }, style)}
      >
        {series.map(([key, color]) => (
          <SeriesSwatch key={key} color={color} label={names[key]} />
        ))}
      </View>
    );
  },
  { displayName: "WaterfallChart.Legend", layer: "overlay" as const }
);
export const WaterfallChartHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    labels,
    legend = false,
    children,
    ...props
  }: WaterfallChartHeaderProps) => {
    const { steps, colors } = useWaterfallSettings();
    const present = (["rise", "fall", "total"] as WaterfallKind[]).filter(
      (kind) => steps.some((step) => step.kind === kind)
    );
    const series = present.map((kind) => [kind, colors[kind]] as const);
    const names = {
      fall: labels?.fall ?? "Decrease",
      rise: labels?.rise ?? "Increase",
      total: labels?.total ?? "Total",
    };
    const trailing =
      children ??
      (legend && series.length ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          {series.map(([key, color]) => (
            <SeriesSwatch key={key} color={color} label={names[key]} />
          ))}
        </View>
      ) : null);
    return (
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
        {trailing ? <View className="shrink pt-[8px]">{trailing}</View> : null}
      </View>
    );
  },
  { displayName: "WaterfallChart.Header", layer: "header" as const }
);
