import { useEffect } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { usePopover } from "./context";
import {
  placePopover,
  POPOVER_OFFSET,
  POPOVER_SCREEN_MARGIN,
} from "./placement";
import type { PopoverContentProps } from "./types";

export const usePanelPosition = (
  {
    placement = "bottom",
    align = "center",
    offset = POPOVER_OFFSET,
    alignOffset = 0,
    width = "content-fit",
    minWidth,
    maxHeight,
    children,
    onLayout,
  }: PopoverContentProps,
  ready = true
) => {
  const context = usePopover("Popover.Content");
  const window = useWindowMetrics();
  const measured = useElementLayout(ready, children);
  const bounds = {
    bottom: window.height - window.insets.bottom - POPOVER_SCREEN_MARGIN,
    left: window.insets.left + POPOVER_SCREEN_MARGIN,
    right: window.width - window.insets.right - POPOVER_SCREEN_MARGIN,
    top: window.insets.top + POPOVER_SCREEN_MARGIN,
  };
  const available = Math.max(0, bounds.right - bounds.left);
  const room = Math.max(0, bounds.bottom - bounds.top);
  let requested: number | undefined;
  if (typeof width === "number") {
    requested = width;
  }
  if (width === "trigger") {
    requested = context.trigger?.width;
  }
  if (width === "full") {
    requested = available;
  }
  const floor =
    minWidth === undefined
      ? undefined
      : Math.max(0, Math.min(minWidth, available));
  const resolvedWidth =
    requested === undefined
      ? undefined
      : Math.min(available, Math.max(requested, floor ?? 0));
  const cap =
    maxHeight === undefined ? room : Math.max(0, Math.min(maxHeight, room));
  const position =
    ready && context.trigger && measured.layout
      ? placePopover({
          align,
          alignOffset,
          bounds,
          offset,
          placement,
          size: measured.layout,
          trigger: context.trigger,
        })
      : null;
  const actualPlacement = position?.placement;
  const arrow = position?.arrowOffset;
  useEffect(() => {
    if (actualPlacement) {
      context.setPlacement(actualPlacement);
    }
    if (arrow !== undefined) {
      context.setArrowOffset(arrow);
    }
  }, [actualPlacement, arrow, context.setPlacement, context.setArrowOffset]);
  useEffect(() => {
    if (measured.layout) {
      const { width: w, height, left, top } = measured.layout;
      onLayout?.({
        nativeEvent: { layout: { height, width: w, x: left, y: top } },
      });
    }
  }, [measured.layout, onLayout]);
  return {
    available,
    cap,
    floor,
    id: measured.id,
    position,
    width: resolvedWidth,
  };
};
