import { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { BadgeCheckIcon } from "../../icons";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Avatar, AVATAR_SIZE_POINTS } from "../Avatar";
import { AVATAR_RING, BADGE_RATIO } from "./constants";
import { PageHeaderRowContext, usePageHeader } from "./context";
import type { PageHeaderAvatarProps } from "./types";
import { pageHeaderVariants } from "./variants";

export const PageHeaderAvatar = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderAvatarProps
>(
  (
    {
      className,
      size = "xl",
      verified,
      badge,
      overlap,
      source,
      fallback,
      imageProps,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { variant, align, hasCover } = usePageHeader("PageHeader.Avatar");
    const inRow = useContext(PageHeaderRowContext);
    const slots = pageHeaderVariants({ align, variant });
    const primary = useThemeToken("primary");
    const onPrimary = useThemeToken("primary-foreground");
    const diameter = AVATAR_SIZE_POINTS[size] ?? AVATAR_SIZE_POINTS.xl;
    const lifts = overlap ?? hasCover;
    const mark =
      badge ??
      (verified ? (
        <BadgeCheckIcon
          size={Math.round(diameter * BADGE_RATIO)}
          color={primary}
          checkColor={onPrimary}
        />
      ) : null);
    const ringSize = `${(diameter + AVATAR_RING * 2) * 2}rpx`;
    return (
      <View
        {...props}
        ref={ref}
        className={cn(
          "relative",
          inRow ? "self-start" : slots.avatar(),
          className
        )}
        style={mergeStyle(
          lifts ? { marginTop: `${-Math.round(diameter / 2) * 2}rpx` } : {},
          style
        )}
      >
        <View
          className={cn(slots.ring(), "border-solid")}
          style={{
            borderWidth: `${AVATAR_RING * 2}rpx`,
            ...(children ? { height: ringSize, width: ringSize } : {}),
          }}
        >
          {children ?? (
            <Avatar
              size={size}
              source={source}
              fallback={fallback}
              imageProps={imageProps}
              className="border-0"
            />
          )}
        </View>
        {mark ? (
          <View className="absolute end-[4px] bottom-[4px]">{mark}</View>
        ) : null}
      </View>
    );
  }
);
