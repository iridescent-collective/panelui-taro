import { View } from "@tarojs/components";

import { compactNumber, polarPoint } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { PolarAreaChartTooltipProps } from "./types";

const TOOLTIP_WIDTH = 132;
const TOOLTIP_HEIGHT = 30;
const LABEL_AT = 0.62;
export const PolarAreaChartTooltip = Object.assign(
  ({ formatValue, className }: PolarAreaChartTooltipProps) => {
    const { data, wedges, size, activeIndex, status } = useChart(
      "PolarAreaChart.Tooltip"
    );
    if (status === "loading" || activeIndex < 0) {
      return null;
    }
    const datum = data[activeIndex];
    const wedge = wedges[activeIndex];
    if (!datum || !wedge) {
      return null;
    }
    const format = formatValue ?? ((value: number) => compactNumber(value));
    const point = polarPoint(
      size / 2,
      size / 2,
      wedge.radius * LABEL_AT,
      wedge.mid
    );
    const left = Math.max(
      0,
      Math.min(size - TOOLTIP_WIDTH, point.x - TOOLTIP_WIDTH / 2)
    );
    const top = Math.max(
      0,
      Math.min(size - TOOLTIP_HEIGHT, point.y - TOOLTIP_HEIGHT / 2)
    );
    return (
      <View
        style={{
          left: `${left * 2}rpx`,
          pointerEvents: "none",
          position: "absolute",
          top: `${top * 2}rpx`,
          width: `${TOOLTIP_WIDTH * 2}rpx`,
        }}
        className={cn(
          "flex flex-col items-center rounded-[var(--panel-radius-lg)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[16px] py-[8px] shadow-sm",
          className
        )}
      >
        <Text size="xs" weight="medium" numberOfLines={1}>
          {datum.label}
        </Text>
        <Text size="xs" muted numberOfLines={1}>
          {format(datum.value, datum)}
        </Text>
      </View>
    );
  },
  { displayName: "PolarAreaChart.Tooltip", slot: "overlay" as const }
);
