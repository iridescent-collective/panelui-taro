import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { PieChartCenterProps } from "./types";

export const PieChartCenter = Object.assign(
  ({
    defaultLabel = "Total",
    formatValue,
    children,
    className,
  }: PieChartCenterProps) => {
    const { data, slices, total, hole, activeIndex } =
      useChart("PieChart.Center");
    const slice = activeIndex >= 0 ? (data[activeIndex] ?? null) : null;
    const share = activeIndex >= 0 ? (slices[activeIndex]?.fraction ?? 0) : 0;
    const format = formatValue ?? ((amount: number) => compactNumber(amount));
    const room = hole * Math.SQRT2;
    if (room <= 0) {
      return null;
    }
    return (
      <View
        style={{ maxWidth: `${room * 2}rpx`, pointerEvents: "none" }}
        className={cn("flex flex-col items-center", className)}
      >
        {children ? (
          children(slice)
        ) : (
          <>
            <Text size="xs" muted numberOfLines={1}>
              {slice ? slice.label : defaultLabel}
            </Text>
            <Text
              size={room < 90 ? "lg" : "xl"}
              weight="semibold"
              numberOfLines={1}
            >
              {format(slice ? slice.value : total, slice)}
            </Text>
            {room >= 90 && slice ? (
              <Text
                size="xs"
                muted
                numberOfLines={1}
              >{`${Math.round(share * 100)}% of ${format(total, null)}`}</Text>
            ) : null}
          </>
        )}
      </View>
    );
  },
  { displayName: "PieChart.Center", slot: "overlay" as const }
);
