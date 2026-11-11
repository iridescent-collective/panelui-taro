import type { Image } from "@tarojs/components";
import type { ComponentProps } from "react";

export type IconGlyph = readonly (readonly [
  string,
  Readonly<Record<string, string | number>>,
])[];
export interface IconProps extends Omit<ComponentProps<typeof Image>, "src"> {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  strokeOpacity?: number;
  onPress?: ComponentProps<typeof Image>["onClick"];
}
export interface ToggleIconProps extends IconProps {
  filled?: boolean;
}
export interface BadgeCheckIconProps extends IconProps {
  checkColor?: string;
}
export interface IconDefaults {
  size: number;
  color: string;
  strokeWidth?: number;
  flip?: boolean;
  fillable?: boolean;
}
