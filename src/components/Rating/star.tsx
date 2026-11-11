import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { StarIcon } from "../../icons";

export const RatingStar = ({
  index,
  display,
  size,
  gap,
  fillColor,
  emptyColor,
  dragging,
}: {
  index: number;
  display: number;
  size: number;
  gap: number;
  fillColor: string;
  emptyColor: string;
  dragging: boolean;
}) => {
  const reduced = usePanelReducedMotion();
  return (
    <View
      aria-hidden
      className="relative shrink-0"
      style={{
        height: `${size * 2}rpx`,
        marginRight: `${gap * 2}rpx`,
        width: `${size * 2}rpx`,
      }}
    >
      <StarIcon size={size} color={emptyColor} />
      <View
        className="absolute top-0 left-0 overflow-hidden"
        style={{
          height: `${size * 2}rpx`,
          transition:
            reduced || dragging
              ? "none"
              : "width 350ms cubic-bezier(0.22,1,0.36,1)",
          width: `${Math.min(Math.max(display - index, 0), 1) * size * 2}rpx`,
        }}
      >
        <StarIcon size={size} color={fillColor} filled />
      </View>
    </View>
  );
};
