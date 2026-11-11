import { Image, View } from "@tarojs/components";

import { iconSvg } from "../svg";
import type { IconGlyph, IconProps } from "../types";

export interface DrawingProps extends IconProps {
  glyph: IconGlyph;
  color: string;
  flip?: boolean;
  mirrorable?: boolean;
}
export const Drawing = ({
  glyph,
  size = 18,
  color,
  strokeWidth = 2,
  fill = "none",
  fillOpacity,
  strokeOpacity,
  flip = false,
  mirrorable = false,
  onClick,
  onPress,
  style,
  ...props
}: DrawingProps) => {
  const source = `data:image/svg+xml,${encodeURIComponent(iconSvg(glyph, color, strokeWidth, fill, fillOpacity, strokeOpacity))}`;
  // Native SVGs have no text baseline. Keep Image from adding a descender
  // gap inside the mirroring View, which would shift centered arrows upward.
  const dimensions = {
    display: "block" as const,
    height: `${size * 2}rpx`,
    width: `${size * 2}rpx`,
  };
  const imageStyle =
    typeof style === "string"
      ? `display:block;width:${size * 2}rpx;height:${size * 2}rpx;${style}`
      : { ...dimensions, ...style };
  const image = (
    <Image
      {...props}
      aria-hidden
      mode="aspectFit"
      src={source}
      onClick={onClick ?? onPress}
      style={mirrorable ? dimensions : imageStyle}
    />
  );
  const transform = `scaleX(${flip ? -1 : 1})`;
  return mirrorable ? (
    <View
      style={
        typeof style === "string"
          ? `transform:${transform};${style}`
          : { transform, ...style }
      }
    >
      {image}
    </View>
  ) : (
    image
  );
};
