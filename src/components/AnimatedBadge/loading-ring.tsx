import { View } from "@tarojs/components";
import type { CSSProperties } from "react";

export const LoadingRing = ({
  size,
  color,
  reducedMotion,
}: {
  size: number;
  color: string;
  reducedMotion: boolean;
}) => {
  const ring: CSSProperties = {
    borderRadius: `${size}rpx`,
    borderStyle: "solid",
    borderWidth: `${Math.max(1, Math.round(size / 8)) * 2}rpx`,
    inset: 0,
    position: "absolute",
  };
  return (
    <View
      style={{
        height: `${size * 2}rpx`,
        position: "relative",
        width: `${size * 2}rpx`,
      }}
    >
      <View style={{ ...ring, borderColor: color, opacity: 0.25 }} />
      <View
        style={{
          ...ring,
          animation: reducedMotion
            ? "none"
            : "panel-badge-spin 800ms linear infinite",
          borderColor: "transparent",
          borderTopColor: color,
        }}
      />
    </View>
  );
};
