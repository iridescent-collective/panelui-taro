import {
  ENV_TYPE,
  getEnv,
  getMenuButtonBoundingClientRect,
  getSystemInfoSync,
  getWindowInfo,
  nextTick,
} from "@tarojs/taro";
import { useEffect, useState } from "react";

import { subscribeWindowResize } from "../../hooks/window-resize-subscription";

/** WeChat geometry is already in physical CSS pixels; do not convert to rpx. */
export interface PageHeaderNavigationMetrics {
  statusBarHeight: number;
  navRowHeight: number;
  rightInset: number;
  capsuleBottom: number;
}
const FALLBACK: PageHeaderNavigationMetrics = {
  statusBarHeight: 20,
  navRowHeight: 44,
  rightInset: 96,
  capsuleBottom: 64,
};
let lastComplete:
  | { windowWidth: number; metrics: PageHeaderNavigationMetrics }
  | undefined;
const finitePositive = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
export const readPageHeaderNavigationMetrics =
  (): PageHeaderNavigationMetrics => {
    try {
      if (getEnv() !== ENV_TYPE.WEAPP) {
        return {
          statusBarHeight: 0,
          navRowHeight: 44,
          rightInset: 0,
          capsuleBottom: 44,
        };
      }
      const info =
        typeof getWindowInfo === "function"
          ? getWindowInfo()
          : getSystemInfoSync();
      const statusBarHeight =
        typeof info.statusBarHeight === "number" &&
        Number.isFinite(info.statusBarHeight) &&
        info.statusBarHeight >= 0
          ? info.statusBarHeight
          : FALLBACK.statusBarHeight;
      const windowWidth = finitePositive(info.windowWidth)
        ? info.windowWidth
        : 375;
      let menu: ReturnType<typeof getMenuButtonBoundingClientRect> | undefined;
      try {
        menu = getMenuButtonBoundingClientRect?.();
      } catch {
        /* Retry after mount. */
      }
      if (
        !menu ||
        !finitePositive(menu.height) ||
        !finitePositive(menu.width) ||
        !finitePositive(menu.top) ||
        !finitePositive(menu.left) ||
        menu.left >= windowWidth
      ) {
        if (
          lastComplete?.windowWidth === windowWidth &&
          lastComplete.metrics.statusBarHeight === statusBarHeight
        )
          return lastComplete.metrics;
        return {
          ...FALLBACK,
          statusBarHeight,
          capsuleBottom: statusBarHeight + FALLBACK.navRowHeight,
        };
      }
      const navRowHeight =
        menu.height + Math.max(0, menu.top - statusBarHeight) * 2;
      const metrics = {
        statusBarHeight,
        navRowHeight,
        rightInset: Math.max(12, windowWidth - menu.left + 8),
        capsuleBottom: finitePositive(menu.bottom)
          ? menu.bottom
          : statusBarHeight + navRowHeight,
      };
      lastComplete = { windowWidth, metrics };
      return metrics;
    } catch {
      return lastComplete?.metrics ?? FALLBACK;
    }
  };
export const usePageHeaderNavigation = (enabled: boolean) => {
  const [metrics, setMetrics] = useState(() =>
    enabled ? readPageHeaderNavigationMetrics() : undefined
  );
  useEffect(() => {
    if (!enabled) {
      setMetrics(undefined);
      return;
    }
    let active = true;
    const refresh = () => {
      if (active) setMetrics(readPageHeaderNavigationMetrics());
    };
    refresh();
    if (typeof nextTick === "function") nextTick(refresh);
    const unsubscribe = subscribeWindowResize(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [enabled]);
  return enabled ? metrics : undefined;
};
