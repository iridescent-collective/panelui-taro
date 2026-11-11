import { View } from "@tarojs/components";

import { colorPickerVariants } from "./variants";

export const ColorThumb = ({
  diameter,
  x,
  y = 0,
  color,
  className,
}: {
  diameter: number;
  x: number;
  y?: number;
  color: string;
  className?: string;
}) => {
  const slots = colorPickerVariants();
  return (
    <View
      aria-hidden
      className={slots.thumb({ className: `flex ${className ?? ""}` })}
      style={{
        height: `${diameter * 2}rpx`,
        left: 0,
        pointerEvents: "none",
        right: "auto",
        top: 0,
        transform: `translateX(${x * 2}rpx) translateY(${y * 2}rpx)`,
        width: `${diameter * 2}rpx`,
      }}
    >
      <View className={slots.thumbFill()} style={{ backgroundColor: color }} />
    </View>
  );
};
