import type { CSSProperties } from "react";

import type { ComboboxAnchor, ComboboxProps } from "./types";

export const comboboxPosition = (
  anchor: ComboboxAnchor,
  screenHeight: number,
  keyboardHeight: number,
  offset: number,
  flip: boolean,
  contentWidth: ComboboxProps["contentWidth"]
) => {
  const below =
    screenHeight - keyboardHeight - (anchor.y + anchor.height) - offset;
  let width: CSSProperties = { minWidth: `${anchor.width * 2}rpx` };
  if (contentWidth === "field") {
    width = { width: `${anchor.width * 2}rpx` };
  }
  if (typeof contentWidth === "number") {
    width = { width: `${contentWidth * 2}rpx` };
  }
  return {
    ...width,
    left: `${anchor.x * 2}rpx`,
    ...(flip
      ? { bottom: `${(screenHeight - anchor.y + offset) * 2}rpx` }
      : { top: `${(anchor.y + anchor.height + offset) * 2}rpx` }),
    maxHeight: `${Math.max((flip ? anchor.y : below) - offset, 160) * 2}rpx`,
    position: "fixed" as const,
    zIndex: 1,
  };
};
export const comboboxCatchers = (anchor: ComboboxAnchor): CSSProperties[] => [
  { height: `${Math.max(anchor.y, 0) * 2}rpx`, left: 0, right: 0, top: 0 },
  { bottom: 0, left: 0, right: 0, top: `${(anchor.y + anchor.height) * 2}rpx` },
  {
    height: `${anchor.height * 2}rpx`,
    left: 0,
    top: `${anchor.y * 2}rpx`,
    width: `${Math.max(anchor.x, 0) * 2}rpx`,
  },
  {
    height: `${anchor.height * 2}rpx`,
    left: `${(anchor.x + anchor.width) * 2}rpx`,
    right: 0,
    top: `${anchor.y * 2}rpx`,
  },
];
