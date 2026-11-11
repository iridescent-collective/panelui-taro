import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { MeterColor, MeterThreshold } from "./meter-scale";

export interface MeterProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  value: number;
  minValue?: number;
  maxValue?: number;
  label?: string;
  accessibilityLabel?: string;
  showValueLabel?: boolean;
  valueLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
  thresholds?: MeterThreshold[];
  segments?: number;
  indicatorClassName?: string;
  headerClassName?: string;
  color?: MeterColor;
  size?: "sm" | "md" | "lg";
}
