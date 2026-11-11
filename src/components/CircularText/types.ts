import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

export interface CircularTextProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children: string;
  radius?: number;
  spinDuration?: number;
  reverse?: boolean;
  paused?: boolean;
  spread?: number;
  startAngle?: number;
  textClassName?: string;
}
