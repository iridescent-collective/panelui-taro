import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { FunnelChartLabelsProps } from "./types";

export const FunnelChartLabels = ({
  className,
  formatValue,
  formatShare,
  share = "top",
  showValue = true,
  showLabel = true,
}: FunnelChartLabelsProps) => {
  const {
    data,
    bands,
    shares,
    steps,
    textBand,
    status,
    activeIndex,
    setActiveIndex,
  } = useChart("FunnelChart.Labels");
  if (status === "loading" || !bands.length) {
    return null;
  }
  const format = formatValue ?? ((value: number) => compactNumber(value));
  const formatPercent =
    formatShare ?? ((ratio: number) => `${Math.round(ratio * 100)}%`);
  return (
    <>
      {bands.map((band, index) => {
        const datum = data[index];
        if (!datum) {
          return null;
        }
        const ratio = share === "top" ? shares[index] : steps[index];
        const pill =
          share === "none" || (share === "previous" && index === 0)
            ? null
            : formatPercent(ratio ?? 0, datum);
        const dimmed = activeIndex >= 0 && activeIndex !== index;
        const value = format(datum.value, datum);
        return (
          <View
            key={datum.label}
            role="button"
            aria-role="button"
            aria-selected={activeIndex === index}
            aria-label={`${datum.label}, ${value}${pill ? `, ${pill}` : ""}`}
            onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
            style={{
              bottom: 0,
              left: `${band.offset * 2}rpx`,
              opacity: dimmed ? 0.5 : 1,
              position: "absolute",
              top: 0,
              width: `${band.length * 2}rpx`,
            }}
            className={cn("flex flex-col items-center px-[8px]", className)}
          >
            <View
              style={{ height: `${textBand * 2}rpx` }}
              className="flex flex-col justify-end pb-[8px]"
            >
              {showValue ? (
                <Text size="sm" weight="semibold" numberOfLines={1}>
                  {value}
                </Text>
              ) : null}
            </View>
            <View className="flex flex-1 flex-col justify-center">
              {pill ? (
                <View className="rounded-full border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] px-[16px] py-[4px]">
                  <Text size="xs" weight="bold" numberOfLines={1}>
                    {pill}
                  </Text>
                </View>
              ) : null}
            </View>
            <View
              style={{ height: `${textBand * 2}rpx` }}
              className="flex flex-col justify-start pt-[8px]"
            >
              {showLabel ? (
                <Text size="xs" muted weight="medium" numberOfLines={1}>
                  {datum.label}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </>
  );
};
FunnelChartLabels.displayName = "FunnelChart.Labels";
FunnelChartLabels.slot = "overlay" as const;
