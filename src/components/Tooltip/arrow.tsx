import { View } from "@tarojs/components";
import type { CSSProperties } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useTooltip } from "./context";
import type { TooltipArrowProps } from "./types";
import { tooltipVariants } from "./variants";

export const TOOLTIP_ARROW_SIZE = 10;
const EDGES = {
  bottom: "top",
  left: "right",
  right: "left",
  top: "bottom",
} as const;
export const TooltipArrow = ({
  className,
  style,
  ...props
}: TooltipArrowProps) => {
  const { trigger, placement, arrowOffset, variant } =
    useTooltip("Tooltip.Arrow");
  if (!trigger) {
    return null;
  }
  const vertical = placement === "top" || placement === "bottom";
  const position: CSSProperties = {
    [EDGES[placement]]: `${-TOOLTIP_ARROW_SIZE}rpx`,
    height: `${TOOLTIP_ARROW_SIZE * 2}rpx`,
    pointerEvents: "none",
    position: "absolute",
    transform: "rotate(45deg)",
    width: `${TOOLTIP_ARROW_SIZE * 2}rpx`,
  };
  const axis: CSSProperties = vertical
    ? { left: `${arrowOffset * 2}rpx`, marginLeft: `${-TOOLTIP_ARROW_SIZE}rpx` }
    : { marginTop: `${-TOOLTIP_ARROW_SIZE}rpx`, top: `${arrowOffset * 2}rpx` };
  return (
    <View
      {...props}
      aria-hidden
      style={mergeStyle({ ...position, ...axis }, style)}
      className={cn(tooltipVariants({ variant }).arrow(), className)}
    />
  );
};
