import { View } from "@tarojs/components";
import { getWindowInfo, onWindowResize, offWindowResize } from "@tarojs/taro";
import { useState, useEffect } from "react";
import type { ComponentProps } from "react";

import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";

export const hasNativeUI = () => false;
export const useAIInputToken = (token: string) =>
  useThemeToken(token.replace("--color-", "") as ThemeToken);
const readInputInsets = () => {
  const window = getWindowInfo();
  return {
    bottom:
      (Math.max(
        0,
        window.windowHeight - (window.safeArea?.bottom ?? window.windowHeight)
      ) *
        375) /
      window.windowWidth,
  };
};
export const useInputInsets = () => {
  const [insets, setInsets] = useState(readInputInsets);
  useEffect(() => {
    const refresh = () => setInsets(readInputInsets());
    onWindowResize(refresh);
    return () => offWindowResize(refresh);
  }, []);
  return insets;
};
export const Glass = ({
  radius = 0,
  variant: _variant,
  fallbackClassName,
  className,
  style,
  ...props
}: ComponentProps<typeof View> & {
  radius?: number;
  variant?: "clear";
  fallbackClassName?: string;
}) => (
  <View
    {...props}
    className={cn(
      "relative flex flex-col overflow-hidden",
      fallbackClassName,
      className
    )}
    style={mergeStyleAfter(style, { borderRadius: `${radius * 2}rpx` })}
  />
);
