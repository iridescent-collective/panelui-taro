import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { placeAnchoredPanel } from "../../lib/anchored-position";
import { TOOLTIP_ARROW_SIZE } from "./arrow";
import { useTooltip } from "./context";
import type { TooltipContentProps } from "./types";

const labelWidth = (
  width: NonNullable<TooltipContentProps["width"]>,
  minWidth: number | undefined,
  triggerWidth: number | undefined,
  available: number
) => {
  let requested: number | undefined;
  if (typeof width === "number") {
    requested = width;
  } else if (width === "trigger") {
    requested = triggerWidth;
  } else if (width === "full") {
    requested = available;
  } else {
    requested = minWidth;
  }
  return requested === undefined
    ? undefined
    : Math.min(available, Math.max(requested, minWidth ?? 0));
};
export const useLabelPosition = ({
  placement = "top",
  align = "center",
  offset = 6,
  alignOffset = 0,
  width = "content-fit",
  minWidth,
  maxHeight,
  children,
  onLayout,
}: TooltipContentProps) => {
  const context = useTooltip("Tooltip.Content");
  const window = useWindowMetrics();
  const measured = useElementLayout(context.open, children);
  const bounds = {
    bottom: window.height - window.insets.bottom - 12,
    left: window.insets.left + 12,
    right: window.width - window.insets.right - 12,
    top: window.insets.top + 12,
  };
  const available = Math.max(0, bounds.right - bounds.left);
  const room = Math.max(0, bounds.bottom - bounds.top);
  const cap = Math.max(0, Math.min(maxHeight ?? room, room));
  const resolvedWidth = labelWidth(
    width,
    minWidth,
    context.trigger?.width,
    available
  );
  const raw =
    context.trigger && measured.layout
      ? placeAnchoredPanel({
          align,
          alignOffset,
          arrowSize: TOOLTIP_ARROW_SIZE,
          bounds,
          offset,
          placement,
          size: measured.layout,
          trigger: context.trigger,
        })
      : null;
  const previous = useRef(raw);
  if (raw) {
    previous.current = raw;
  }
  const position = context.open ? raw : previous.current;
  const side = raw?.placement;
  const arrow = raw?.arrowOffset;
  useEffect(() => {
    if (side) {
      context.setPlacement(side);
    }
    if (arrow !== undefined) {
      context.setArrowOffset(arrow);
    }
  }, [side, arrow, context.setPlacement, context.setArrowOffset]);
  useEffect(() => {
    if (measured.layout) {
      const { width: w, height, left, top } = measured.layout;
      onLayout?.({
        nativeEvent: { layout: { height, width: w, x: left, y: top } },
      });
    }
  }, [measured.layout, onLayout]);
  const style: CSSProperties = {
    left: `${(position?.left ?? -9999) * 2}rpx`,
    maxHeight: `${cap * 2}rpx`,
    maxWidth: `${available * 2}rpx`,
    position: "absolute",
    top: `${(position?.top ?? -9999) * 2}rpx`,
    width: resolvedWidth === undefined ? undefined : `${resolvedWidth * 2}rpx`,
  };
  return { cap, id: measured.id, placed: Boolean(raw), position, style };
};
