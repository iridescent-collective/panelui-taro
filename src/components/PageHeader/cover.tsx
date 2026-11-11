import { Image, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { imageSourceUri } from "../../lib/image-source";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { COVER_HEIGHT } from "./constants";
import { usePageHeader } from "./context";
import type { PageHeaderCoverProps } from "./types";
import { pageHeaderVariants } from "./variants";

export const PageHeaderCover = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderCoverProps
>(
  (
    {
      className,
      id,
      source,
      height = COVER_HEIGHT,
      colors,
      alt,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { variant } = usePageHeader("PageHeader.Cover");
    const from = useThemeToken("chart-2");
    const to = useThemeToken("chart-5");
    const ramp = colors ?? [from, to];
    const measured = useElementLayout(Array.isArray(source), source, id);
    const window = getWindowInfo();
    const scale = (window.windowWidth / 375) * window.pixelRatio;
    const uri = imageSourceUri(
      source,
      (measured.layout?.width ?? 375) * scale,
      (measured.layout?.height ?? height) * scale
    );
    return (
      <View
        {...props}
        ref={ref}
        id={measured.id}
        className={cn(
          pageHeaderVariants({ variant }).cover(),
          "relative",
          className
        )}
        style={mergeStyle({ height: `${height * 2}rpx` }, style)}
      >
        {source ? (
          <Image
            src={uri}
            mode="aspectFill"
            className="absolute inset-0 h-full w-full"
            aria-role={alt ? "image" : undefined}
            aria-label={alt}
            aria-hidden={!alt}
          />
        ) : (
          <View
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${ramp.join(", ")})`,
            }}
          />
        )}
        {children}
      </View>
    );
  }
);
