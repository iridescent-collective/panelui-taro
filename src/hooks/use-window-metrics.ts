import {
  ENV_TYPE,
  getDeviceInfo,
  getEnv,
  getMenuButtonBoundingClientRect,
  getWindowInfo,
} from "@tarojs/taro";
import { useEffect, useState } from "react";

import { subscribeWindowResize } from "./window-resize-subscription";

type MetricsSpace = "window" | "screen";

const readCapsuleBottom = (fallback: number) => {
  try {
    const bottom = getMenuButtonBoundingClientRect?.().bottom;
    return typeof bottom === "number" && Number.isFinite(bottom) && bottom > 0
      ? bottom
      : fallback;
  } catch {
    return fallback;
  }
};

const readWindowTop = (
  window: ReturnType<typeof getWindowInfo>,
  screen: boolean
) =>
  !screen && "screenTop" in window && typeof window.screenTop === "number"
    ? window.screenTop
    : 0;

export const readWindowMetrics = (space: MetricsSpace = "window") => {
  const window = getWindowInfo();
  const scale = 375 / window.windowWidth;
  const screen = space === "screen" && getEnv() === ENV_TYPE.WEAPP;
  const height = screen ? window.screenHeight : window.windowHeight;
  const top = readWindowTop(window, screen);
  const safe = window.safeArea;
  const safeTop = Math.max(0, (safe?.top ?? top) - top);
  const overlayTop =
    getEnv() === ENV_TYPE.WEAPP
      ? Math.max(
          safeTop,
          readCapsuleBottom((window.statusBarHeight ?? safe?.top ?? 20) + 44) -
            top
        )
      : safeTop;
  return {
    height: height * scale,
    insets: {
      bottom:
        Math.max(0, height - ((safe?.bottom ?? height + top) - top)) * scale,
      left: Math.max(0, safe?.left ?? 0) * scale,
      right:
        Math.max(0, window.windowWidth - (safe?.right ?? window.windowWidth)) *
        scale,
      top: Math.max(0, (safe?.top ?? top) - top) * scale,
    },
    overlayTop: overlayTop * scale,
    platform: getDeviceInfo().platform,
    scale,
    width: window.windowWidth * scale,
  };
};
export const useWindowMetrics = (space: MetricsSpace = "window") => {
  const [metrics, setMetrics] = useState(() => readWindowMetrics(space));
  useEffect(() => {
    const refresh = () => setMetrics(readWindowMetrics(space));
    return subscribeWindowResize(refresh);
  }, [space]);
  return metrics;
};
