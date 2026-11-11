import { View } from "@tarojs/components";

import { compactNumber, polarPoint } from "../../lib/chart";
import { inkOn } from "../../lib/chart-colors";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useChart } from "./context";
import type { PolarAreaChartLabelsProps } from "./types";

const LABEL_AT = 0.62;
const LABEL_BOX = 64;
export const PolarAreaChartLabels = Object.assign(
  ({ formatValue, minRadius = 34, className }: PolarAreaChartLabelsProps) => {
    const { data, wedges, colors, size, status } = useChart(
      "PolarAreaChart.Labels"
    );
    const background = useThemeToken("background");
    if (status === "loading" || !wedges.length) {
      return null;
    }
    const format = formatValue ?? ((value: number) => compactNumber(value));
    return (
      <>
        {wedges.map((wedge, index) => {
          const datum = data[index];
          if (!datum || wedge.radius < minRadius) {
            return null;
          }
          const point = polarPoint(
            size / 2,
            size / 2,
            wedge.radius * LABEL_AT,
            wedge.mid
          );
          const ink = inkOn(colors[index] ?? colors[0], background, 1);
          return (
            <View
              key={`${datum.label}-${index}`}
              style={{
                height: `${LABEL_BOX * 2}rpx`,
                left: `${(point.x - LABEL_BOX / 2) * 2}rpx`,
                pointerEvents: "none",
                position: "absolute",
                top: `${(point.y - LABEL_BOX / 2) * 2}rpx`,
                width: `${LABEL_BOX * 2}rpx`,
              }}
              className={cn("flex items-center justify-center", className)}
            >
              <Text
                size="xs"
                weight="semibold"
                numberOfLines={1}
                style={{ color: ink.color }}
              >
                {format(datum.value, datum)}
              </Text>
            </View>
          );
        })}
      </>
    );
  },
  { displayName: "PolarAreaChart.Labels", slot: "overlay" as const }
);
