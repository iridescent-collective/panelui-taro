import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { FunnelChartLegendProps } from "./types";

export const FunnelChartLegend = ({
  className,
  layout = "list",
  showValue = true,
  formatValue,
  ...props
}: FunnelChartLegendProps) => {
  const { data, shares, colors, strengths, activeIndex, setActiveIndex } =
    useChart("FunnelChart.Legend");
  if (!data.length) {
    return null;
  }
  const list = layout === "list";
  const format = formatValue ?? ((value: number) => compactNumber(value));
  return (
    <View
      {...props}
      className={cn(
        "flex w-full flex-col pt-[24px]",
        list
          ? "gap-[12px]"
          : "flex flex-row flex-wrap items-center justify-center gap-x-[24px] gap-y-[12px]",
        className
      )}
    >
      {data.map((stage, index) => {
        const percent = Math.round((shares[index] ?? 0) * 100);
        const dimmed = activeIndex >= 0 && activeIndex !== index;
        return (
          <View
            key={stage.label}
            role="button"
            aria-role="button"
            aria-selected={activeIndex === index}
            aria-label={`${stage.label}, ${percent} percent of the first stage`}
            onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
            style={{ opacity: dimmed ? 0.4 : 1 }}
            className={cn(
              "flex flex-row items-center gap-[12px]",
              list ? "w-full" : "max-w-full"
            )}
          >
            <View
              style={{
                backgroundColor: colors[index],
                borderRadius: `${4 * 2}rpx`,
                height: `${8 * 2}rpx`,
                opacity: strengths[index] ?? 1,
                width: `${8 * 2}rpx`,
              }}
            />
            <Text
              size="xs"
              muted
              numberOfLines={1}
              className={list ? "flex-1" : "shrink"}
            >
              {stage.label}
            </Text>
            {showValue ? (
              <>
                {list ? (
                  <Text size="xs" weight="medium" numberOfLines={1}>
                    {format(stage.value, stage)}
                  </Text>
                ) : null}
                <Text
                  size="xs"
                  muted={list}
                  weight={list ? "normal" : "medium"}
                  numberOfLines={1}
                  className={list ? "w-[80px] text-right" : undefined}
                >
                  {percent}%
                </Text>
              </>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};
FunnelChartLegend.displayName = "FunnelChart.Legend";
FunnelChartLegend.slot = "footer" as const;
