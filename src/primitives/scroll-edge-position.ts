import type { CSSProperties } from "react";

export const scrollEdgePosition = (
  size: number,
  horizontal: boolean,
  start: boolean
): CSSProperties =>
  horizontal
    ? {
        bottom: 0,
        top: 0,
        width: `${size * 2}rpx`,
        [start ? "left" : "right"]: 0,
      }
    : {
        height: `${size * 2}rpx`,
        left: 0,
        right: 0,
        [start ? "top" : "bottom"]: 0,
      };
