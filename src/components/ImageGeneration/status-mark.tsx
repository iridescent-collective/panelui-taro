import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { AlertTriangleIcon, CheckIcon } from "../../icons";
import { useThemeToken } from "../../theme/use-theme";
import type { ImageGenerationStatus } from "./types";

export const StatusMark = ({ status }: { status: ImageGenerationStatus }) => {
  const reduced = usePanelReducedMotion();
  const color = useThemeToken("muted-foreground");
  if (status === "complete") {
    return <CheckIcon size={14} />;
  }
  if (status === "error") {
    return <AlertTriangleIcon size={14} />;
  }
  return (
    <View
      aria-hidden
      style={{
        animation: reduced
          ? "none"
          : "panel-generation-spin 2400ms ease-in-out infinite",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "4rpx",
        height: "28rpx",
        width: "28rpx",
      }}
    >
      {[1, 0.55, 0.55, 1].map((opacity, index) => (
        <View
          key={`dot-${index}`}
          style={{
            backgroundColor: color,
            borderRadius: "2rpx",
            height: "10rpx",
            opacity,
            width: "10rpx",
          }}
        />
      ))}
    </View>
  );
};
