import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { SeriesColorIndex } from "../../lib/chart";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export interface RingDatum {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}
export interface RingChartProps extends ViewProps {
  className?: string;
  data: RingDatum[];
  size?: number;
  strokeWidth?: number;
  ringGap?: number;
  startAngle?: number;
  endAngle?: number;
  animationDuration?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  children?: ReactNode;
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface RingChartHandle {
  replay: () => void;
}
export interface RingChartRingProps {
  index: number;
  color?: string;
  colorIndex?: SeriesColorIndex;
  lineCap?: "round" | "butt";
  trackOpacity?: number;
  segments?: number;
  segmentGap?: number;
}
export interface RingChartCenterProps {
  defaultLabel?: string;
  formatValue?: (value: number, ring: RingDatum | null) => string;
  children?: (ring: RingDatum | null) => ReactNode;
  className?: string;
}
export interface RingChartLegendProps extends ViewProps {
  className?: string;
  showValue?: boolean;
}
export interface RingChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
