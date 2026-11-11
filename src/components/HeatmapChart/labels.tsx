import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { StaticSvg, Rect } from "../../primitives/static-svg";
import { Text } from "../primitives/Text";
import { useHeatmap } from "./context";
import type { HeatmapLegendProps, HeatmapHeaderProps } from "./types";

const Ramp = ({
  size,
  lessLabel,
  moreLabel,
}: {
  size: number;
  lessLabel: string;
  moreLabel: string;
}) => {
  const { ramp, opacities, cornerRadius } = useHeatmap("HeatmapChart ramp");
  return (
    <View className="flex flex-row items-center gap-[12px]">
      <Text size="xs" muted>
        {lessLabel}
      </Text>
      {ramp.map((fill, level) => (
        <StaticSvg
          key={level}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <Rect
            x={0}
            y={0}
            width={size}
            height={size}
            rx={cornerRadius}
            ry={cornerRadius}
            fill={fill}
            fillOpacity={opacities[level]}
          />
        </StaticSvg>
      ))}
      <Text size="xs" muted>
        {moreLabel}
      </Text>
    </View>
  );
};
export const HeatmapLegend = Object.assign(
  ({
    className,
    lessLabel = "Less",
    moreLabel = "More",
    swatchSize,
  }: HeatmapLegendProps) => {
    const { grid } = useHeatmap("HeatmapChart.Legend");
    return (
      <View
        className={cn(
          "flex flex-row items-center gap-[12px] pt-[16px]",
          className
        )}
      >
        <View className="flex-1" />
        <Ramp
          size={swatchSize ?? Math.max(grid.size, 10)}
          lessLabel={lessLabel}
          moreLabel={moreLabel}
        />
      </View>
    );
  },
  { displayName: "HeatmapChart.Legend", slot: "legend" as const }
);
export const HeatmapHeader = Object.assign(
  ({
    className,
    title,
    value,
    caption,
    legend = false,
    lessLabel = "Less",
    moreLabel = "More",
    children,
    ...props
  }: HeatmapHeaderProps) => {
    const { grid } = useHeatmap("HeatmapChart.Header");
    const trailing =
      children ??
      (legend ? (
        <Ramp
          size={Math.max(Math.min(grid.size, 12), 8)}
          lessLabel={lessLabel}
          moreLabel={moreLabel}
        />
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
  { displayName: "HeatmapChart.Header", slot: "header" as const }
);
