import { View } from "@tarojs/components";
import type { CSSProperties } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { usePopover } from "./context";
import { POPOVER_ARROW_SIZE } from "./placement";
import type { PopoverArrowProps } from "./types";

export const PopoverArrow = ({
  className,
  style,
  ...props
}: PopoverArrowProps) => {
  const { trigger, placement, arrowOffset, presentation } =
    usePopover("Popover.Arrow");
  if (!trigger || presentation === "bottom-sheet") {
    return null;
  }
  const vertical = placement === "top" || placement === "bottom";
  const edge = { bottom: "top", left: "right", right: "left", top: "bottom" }[
    placement
  ];
  const base: CSSProperties = {
    [edge]: `${-POPOVER_ARROW_SIZE}rpx`,
    height: `${POPOVER_ARROW_SIZE * 2}rpx`,
    pointerEvents: "none",
    position: "absolute",
    transform: "rotate(45deg)",
    width: `${POPOVER_ARROW_SIZE * 2}rpx`,
  };
  const axis: CSSProperties = vertical
    ? { left: `${arrowOffset * 2}rpx`, marginLeft: `${-POPOVER_ARROW_SIZE}rpx` }
    : { marginTop: `${-POPOVER_ARROW_SIZE}rpx`, top: `${arrowOffset * 2}rpx` };
  return (
    <View
      {...props}
      aria-hidden
      style={mergeStyle({ ...base, ...axis }, style)}
      className={cn(
        "border-solid border-[var(--panel-border)] bg-[var(--panel-popover)]",
        placement === "bottom" && "border-t-[2px] border-l-[2px]",
        placement === "top" && "border-r-[2px] border-b-[2px]",
        placement === "right" && "border-b-[2px] border-l-[2px]",
        placement === "left" && "border-t-[2px] border-r-[2px]",
        className
      )}
    />
  );
};
