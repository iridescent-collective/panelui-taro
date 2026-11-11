import { View } from "@tarojs/components";
import type { CSSProperties } from "react";

import type { TourRect } from "./types";

export const TourBackdrop = ({
  interactive,
  dismissible,
  spot,
  width,
  height,
  onDismiss,
}: {
  interactive: boolean;
  dismissible: boolean;
  spot: TourRect | null;
  width: number;
  height: number;
  onDismiss: () => void;
}) => {
  const press = dismissible ? onDismiss : undefined;
  if (!interactive || !spot) {
    return <View className="fixed inset-0" onClick={press} catchMove />;
  }
  const bottom = spot.y + spot.height;
  const right = spot.x + spot.width;
  const rectangles: CSSProperties[] = [
    { height: `${Math.max(0, spot.y) * 2}rpx`, left: 0, right: 0, top: 0 },
    {
      height: `${Math.max(0, height - bottom) * 2}rpx`,
      left: 0,
      right: 0,
      top: `${bottom * 2}rpx`,
    },
    {
      height: `${spot.height * 2}rpx`,
      left: 0,
      top: `${spot.y * 2}rpx`,
      width: `${Math.max(0, spot.x) * 2}rpx`,
    },
    {
      height: `${spot.height * 2}rpx`,
      left: `${right * 2}rpx`,
      top: `${spot.y * 2}rpx`,
      width: `${Math.max(0, width - right) * 2}rpx`,
    },
  ];
  return (
    <>
      {rectangles.map((style, index) => (
        <View
          key={index}
          style={{ ...style, position: "fixed" }}
          onClick={press}
          catchMove
        />
      ))}
    </>
  );
};
