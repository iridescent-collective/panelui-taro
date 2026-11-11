import type { CSSProperties } from "react";

import { FAB_MENU, FAB_SIZE } from "./constants";
import type { FabMenuAppearance, FabPlacement, FabSize } from "./types";

export const fabSlotProgress = (
  progress: number,
  count: number,
  index: number
) => {
  const from = (count - 1 - index) * 0.08;
  const to = Math.min(1, from + 1 - 0.08 * Math.max(0, count - 1));
  const within = Math.min(1, Math.max(0, (progress - from) / (to - from)));
  return within + Math.max(0, progress - 1);
};
export const fabSettled = (progress: number) =>
  1 - (1 - Math.min(1, Math.max(0, progress))) ** 3;
export const fabMenuScale = (progress: number) =>
  progress <= 0.06
    ? Math.min(0.3, Math.max(0, (progress / 0.06) * 0.3))
    : Math.min(1, 0.3 + ((progress - 0.06) / 0.94) * 0.7);
export const fabMenuOrigin = (
  placement: FabPlacement,
  appearance: FabMenuAppearance,
  width: number,
  count: number,
  size: FabSize
) => {
  const metrics = FAB_MENU[appearance];
  const height =
    metrics.padding * 2 +
    metrics.row * count +
    metrics.hairline * Math.max(0, count - 1);
  const half = FAB_SIZE[size] / 2;
  let x = width - half;
  if (placement === "bottom-left") {
    x = half;
  }
  if (placement === "bottom-center") {
    x = width / 2;
  }
  return `${x * 2}rpx ${(height + 12 + half) * 2}rpx`;
};
export const fabAnchor = (
  placement: FabPlacement,
  offset: number
): CSSProperties => {
  const base: CSSProperties = {
    bottom: `${offset * 2}rpx`,
    position: "absolute",
  };
  if (placement === "bottom-center") {
    return { ...base, alignSelf: "center" };
  }
  if (placement === "bottom-left") {
    return { ...base, left: `${offset * 2}rpx` };
  }
  return { ...base, right: `${offset * 2}rpx` };
};
export const fabAlign = (layout: "dial" | "menu", placement: FabPlacement) => {
  if (layout === "dial" || placement === "bottom-right") {
    return "items-end";
  }
  if (placement === "bottom-center") {
    return "items-center";
  }
  return "items-start";
};
