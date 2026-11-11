import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { LineChart } from "../LineChart";
import { Progress } from "../Progress";
import { useKpi } from "./context";
import type { KpiProgressProps, KpiSparklineProps } from "./types";

const CHART_HEIGHT = 56;
const INLINE_CHART_WIDTH = 128;
const INLINE_ASPECT = 2.3;
export const KpiSparkline = ({
  className,
  data,
  dataKey,
  colorIndex,
  filled,
  height,
  inline = false,
  strokeWidth = 2,
}: KpiSparklineProps) => {
  const context = useKpi("Kpi.Chart");
  const index = colorIndex ?? context.colorIndex;
  const fill = filled ?? !inline;
  return (
    <View
      className={cn(inline ? "" : "w-full", className)}
      style={{
        height: `${(height ?? CHART_HEIGHT) * 2}rpx`,
        ...(inline ? { width: `${INLINE_CHART_WIDTH * 2}rpx` } : {}),
      }}
    >
      <LineChart data={data} compact aspectRatio={inline ? INLINE_ASPECT : 4}>
        {fill ? <LineChart.Area dataKey={dataKey} colorIndex={index} /> : null}
        <LineChart.Line
          dataKey={dataKey}
          colorIndex={index}
          strokeWidth={strokeWidth}
        />
      </LineChart>
    </View>
  );
};
export const KpiProgressBar = ({
  className,
  value,
  maxValue = 100,
  label,
  showValueLabel,
}: KpiProgressProps) => (
  <Progress
    className={className}
    value={value}
    maxValue={maxValue}
    label={label}
    showValueLabel={showValueLabel}
    size="sm"
  />
);
