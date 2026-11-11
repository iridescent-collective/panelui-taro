import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import {
  PYRAMID_AXIS_LABEL_WIDTH as LABEL_WIDTH,
  PYRAMID_PADDING,
  PYRAMID_CENTRE_GUTTER,
} from "./constants";
import { geometry, pyramidLabelSpace } from "./math";
import { usePyramidChartSettings } from "./root";
import type { PyramidChartXAxisProps, PyramidChartYAxisProps } from "./types";

export const PyramidChartXAxis = Object.assign(
  ({
    ticks = 2,
    format = compactNumber,
    className,
  }: PyramidChartXAxisProps) => {
    const { plot, extent } = useChart("PyramidChart.XAxis");
    const { hasYAxis, labelPlacement } = usePyramidChartSettings();
    const { gutter } = pyramidLabelSpace(hasYAxis, labelPlacement);
    const { innerStart, innerEnd, wing, centre } = geometry(plot, gutter);
    const labels = [{ key: "centre", text: format(0), x: centre }];
    for (let index = 1; index <= ticks; index += 1) {
      const fraction = index / ticks;
      const text = format(extent[1] * fraction);
      labels.push(
        { key: `start-${index}`, text, x: innerStart - wing * fraction },
        { key: `end-${index}`, text, x: innerEnd + wing * fraction }
      );
    }
    if (wing <= 0) {
      return null;
    }
    return (
      <View
        className={cn("absolute inset-0", className)}
        style={{ pointerEvents: "none" }}
      >
        {labels.map((label) => (
          <Text
            key={label.key}
            size="xs"
            muted
            numberOfLines={1}
            style={{
              bottom: 0,
              left: `${Math.max(0, Math.min(label.x - LABEL_WIDTH / 2, plot.left + plot.width + PYRAMID_PADDING.right - LABEL_WIDTH)) * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: `${LABEL_WIDTH * 2}rpx`,
            }}
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  { displayName: "PyramidChart.XAxis", layer: "overlay" as const }
);
export const PyramidChartYAxis = Object.assign(
  ({ format, className }: PyramidChartYAxisProps) => {
    const { data, xDataKey, plot } = useChart("PyramidChart.YAxis");
    const { hasYAxis, labelPlacement } = usePyramidChartSettings();
    const { gutter, labelInset } = pyramidLabelSpace(hasYAxis, labelPlacement);
    const { centre } = geometry(plot, gutter);
    if (!data.length) {
      return null;
    }
    const label = (datum: (typeof data)[number], index: number) =>
      format ? format(datum, index) : String(datum[xDataKey] ?? "");
    if (labelPlacement === "above") {
      return (
        <View
          className={cn("absolute inset-0", className)}
          style={{ pointerEvents: "none" }}
        >
          {data.map((datum, index) => (
            <View
              key={index}
              className="absolute flex flex-col justify-center"
              style={{
                height: `${labelInset * 2}rpx`,
                left: `${plot.left * 2}rpx`,
                top: `${(plot.top + (index * plot.height) / data.length) * 2}rpx`,
                width: `${plot.width * 2}rpx`,
              }}
            >
              <Text
                size="xs"
                muted
                numberOfLines={1}
                style={{ textAlign: "center" }}
              >
                {label(datum, index)}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    const centered = labelPlacement === "center";
    return (
      <View
        className={cn(
          "absolute flex flex-col",
          centered ? "items-center" : "items-end",
          className
        )}
        style={{
          height: `${plot.height * 2}rpx`,
          left: `${(centered ? centre - PYRAMID_CENTRE_GUTTER / 2 : 0) * 2}rpx`,
          pointerEvents: "none",
          top: `${plot.top * 2}rpx`,
          width: `${(centered ? PYRAMID_CENTRE_GUTTER : Math.max(plot.left - 8, 0)) * 2}rpx`,
        }}
      >
        {data.map((datum, index) => (
          <View key={index} className="flex flex-1 flex-col justify-center">
            <Text size="xs" muted numberOfLines={1}>
              {label(datum, index)}
            </Text>
          </View>
        ))}
      </View>
    );
  },
  {
    axis: "y" as const,
    displayName: "PyramidChart.YAxis",
    layer: "overlay" as const,
  }
);
