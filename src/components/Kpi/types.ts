import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import type { SeriesColorIndex } from "../../lib/chart";
import type { LineChartDatum } from "../LineChart";
import type { kpiVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type KpiVariantProps = VariantProps<typeof kpiVariants>;
export type KpiTone = NonNullable<KpiVariantProps["tone"]>;
export type KpiGoodDirection = "up" | "down" | "none";
export interface KpiProps extends Omit<ViewProps, "children"> {
  className?: string;
  colorIndex?: SeriesColorIndex;
  goodDirection?: KpiGoodDirection;
  surface?: boolean;
  children: ReactNode;
}
export interface KpiHeaderProps extends ViewProps {
  className?: string;
  children: ReactNode;
}
export interface KpiIconProps extends ViewProps {
  className?: string;
  tone?: KpiTone;
  children: ReactNode;
}
export interface KpiTitleProps {
  className?: string;
  children: ReactNode;
}
export interface KpiStatProps extends ViewProps {
  className?: string;
  children: ReactNode;
}
export interface KpiActionsProps extends ViewProps {
  className?: string;
  children: ReactNode;
}
export interface KpiContentProps extends ViewProps {
  className?: string;
  layout?: NonNullable<KpiVariantProps["layout"]>;
  children: ReactNode;
}
export interface KpiValueProps {
  className?: string;
  children: ReactNode;
}
export interface KpiTrendProps extends Omit<ViewProps, "children"> {
  className?: string;
  value: number;
  format?: (value: number) => string;
  goodDirection?: KpiGoodDirection;
  variant?: NonNullable<KpiVariantProps["trendVariant"]>;
  caption?: string;
  children?: ReactNode;
  threshold?: number;
}
export interface KpiSparklineProps {
  className?: string;
  data: LineChartDatum[];
  dataKey: string;
  colorIndex?: SeriesColorIndex;
  filled?: boolean;
  height?: number;
  inline?: boolean;
  strokeWidth?: number;
}
export interface KpiProgressProps {
  className?: string;
  value: number;
  maxValue?: number;
  label?: string;
  showValueLabel?: boolean;
}
export interface KpiFooterProps extends ViewProps {
  className?: string;
  children: ReactNode;
}
export interface KpiSeparatorProps extends ViewProps {
  className?: string;
}
export type KpiGroupOrientation = "horizontal" | "vertical";
export interface KpiGroupProps extends ViewProps {
  className?: string;
  orientation?: KpiGroupOrientation;
  separated?: boolean;
  children: ReactNode;
}
