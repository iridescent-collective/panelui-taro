import type { View } from "@tarojs/components";
import type { AriaAttributes, ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { AvatarProps, AvatarSizeName } from "../Avatar";
import type { AvatarImageSource } from "../Avatar/types";

export type PageHeaderVariant = "card" | "page";
export type PageHeaderAlign = "start" | "center";
export type PageHeaderStatsLayout = "stacked" | "inline";
export type PageHeaderProps = ComponentProps<typeof View>;
export interface PageHeaderRootProps extends PageHeaderProps {
  variant?: PageHeaderVariant;
  align?: PageHeaderAlign;
  /** Opt in to the custom WeChat navigation bar geometry. Profile headers are unchanged. */
  navigation?: boolean;
  /** Fix navigation to the viewport and reserve its measured height. Default: true. */
  fixed?: boolean;
  /** Reserve the full measured header height when navigation is fixed. Default: true. */
  placeholder?: boolean;
  /** Include the WeChat status bar inside navigation. Default: true. */
  safeAreaInsetTop?: boolean;
}
export interface PageHeaderCoverProps extends PageHeaderProps {
  source?: AvatarImageSource;
  height?: number;
  colors?: readonly [string, string, ...string[]];
  alt?: string;
}
export interface PageHeaderAvatarProps extends Omit<AvatarProps, "size"> {
  size?: AvatarSizeName;
  verified?: boolean;
  badge?: ReactNode;
  overlap?: boolean;
}
export type PageHeaderRowProps = PageHeaderProps;
export type PageHeaderContentProps = PageHeaderProps;
export interface PageHeaderMetaProps extends PageHeaderProps {
  icon?: ReactNode;
}
export interface PageHeaderStatsProps extends PageHeaderProps {
  layout?: PageHeaderStatsLayout;
  divided?: boolean;
}
export interface PageHeaderStatProps
  extends Omit<AnimatedPressableProps, "children">, AriaAttributes {
  value: ReactNode;
  label: ReactNode;
  divided?: boolean;
}
export type PageHeaderActionsProps = PageHeaderProps;
export interface PageHeaderContextValue {
  variant: PageHeaderVariant;
  align: PageHeaderAlign;
  hasCover: boolean;
  navigationRowHeight?: number;
}
