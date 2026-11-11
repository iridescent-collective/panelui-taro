import { Image, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { imageSourceUri } from "../../lib/image-source";
import { mergeStyleAfter } from "../../lib/styles";
import { useThemeToken } from "../../theme/use-theme";
import type { ScrollHeaderCoverProps } from "./types";
import { scrollHeaderVariants } from "./variants";

export const ScrollHeaderCover = forwardRef<
  ComponentRef<typeof View>,
  ScrollHeaderCoverProps
>(
  (
    { className, source, colors, scrim = true, id, children, style, ...props },
    ref
  ) => {
    const one = useThemeToken("chart-1");
    const two = useThemeToken("chart-2");
    const ramp = colors ?? [one, two];
    const measured = useElementLayout(Array.isArray(source), source, id);
    const window = getWindowInfo();
    const scale = (window.windowWidth / 375) * window.pixelRatio;
    const uri = imageSourceUri(
      source,
      (measured.layout?.width ?? 375) * scale,
      (measured.layout?.height ?? 96) * scale
    );
    return (
      <View
        {...props}
        ref={ref}
        id={measured.id}
        className={scrollHeaderVariants().cover({ className })}
        style={mergeStyleAfter(style, { pointerEvents: "none" })}
      >
        <View
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${ramp.join(", ")})`,
          }}
        />
        {source ? (
          <Image
            aria-hidden
            src={uri}
            mode="aspectFill"
            className="absolute inset-0 h-full w-full"
          />
        ) : null}
        {scrim ? (
          <View aria-hidden className="absolute inset-0 bg-black/25" />
        ) : null}
        {children}
      </View>
    );
  }
);
ScrollHeaderCover.displayName = "ScrollHeader.Cover";
