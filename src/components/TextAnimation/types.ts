import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { TextProps } from "../primitives/Text";

type ViewProps = ComponentProps<typeof View>;
export interface TextAnimationContextValue {
  duration?: number;
  delay?: number;
  loop?: boolean;
  enabled?: boolean;
}
export interface TextAnimationProps extends ViewProps {
  className?: string;
  duration?: number;
  delay?: number;
  loop?: boolean;
  enabled?: boolean;
  children?: ReactNode;
}
export interface TextAnimationTypingProps extends Omit<TextProps, "children"> {
  className?: string;
  text: string | string[];
  duration?: number;
  delay?: number;
  hold?: number;
  loop?: boolean;
  caret?: boolean;
  caretClassName?: string;
  onDone?: () => void;
  enabled?: boolean;
}
export interface TextAnimationRotatingProps extends Omit<
  TextProps,
  "children"
> {
  className?: string;
  text: string | string[];
  duration?: number;
  delay?: number;
  enabled?: boolean;
}
export interface TextAnimationCountingProps extends Omit<
  TextProps,
  "children"
> {
  className?: string;
  value: number;
  from?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  formatOptions?: Intl.NumberFormatOptions;
  enabled?: boolean;
}
export interface TextAnimationSlidingProps extends ViewProps {
  className?: string;
  value: number;
  decimals?: number;
  padStart?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  textClassName?: string;
  size?: TextProps["size"];
  weight?: TextProps["weight"];
  delay?: number;
  enabled?: boolean;
}
export interface TextAnimationScrollingProps extends ViewProps {
  className?: string;
  value: number;
  step?: number;
  around?: number;
  duration?: number;
  delay?: number;
  formatOptions?: Intl.NumberFormatOptions;
  textClassName?: string;
  size?: TextProps["size"];
  weight?: TextProps["weight"];
  highlight?: boolean;
  highlightClassName?: string;
  fadeColor?: string | false;
  enabled?: boolean;
}
