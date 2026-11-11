import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import type { TimelineItemProps } from "./types";

export const TIMELINE_WIDE_COLUMN = 268;
export const TIMELINE_NARROW_COLUMN = 76;
export const timelineColumnWidth = (
  requested: number | undefined,
  filled: boolean
): number => {
  if (requested !== undefined && Number.isFinite(requested) && requested > 0) {
    return requested;
  }
  return filled ? TIMELINE_WIDE_COLUMN : TIMELINE_NARROW_COLUMN;
};
export const timelineColumnOffsets = (widths: readonly number[]): number[] => {
  const offsets: number[] = [];
  let sum = 0;
  for (const width of widths) {
    offsets.push(sum);
    sum += width;
  }
  return offsets;
};
export const itemWidth = (props: TimelineItemProps): number => {
  let filled = false;
  Children.forEach(props.children, (child) => {
    if (filled || !isValidElement(child)) {
      return;
    }
    const displayName = (child.type as { displayName?: string })?.displayName;
    if (displayName !== "Timeline.Content") {
      return;
    }
    const inner = (child.props as { children?: ReactNode }).children;
    if (inner !== undefined && inner !== null && inner !== false) {
      filled = true;
    }
  });
  return timelineColumnWidth(props.width, filled);
};
export const nearestColumn = (x: number, offsets: readonly number[]) => {
  let index = 0;
  let best = Infinity;
  for (let i = 0; i < offsets.length; i += 1) {
    const distance = Math.abs(x - (offsets[i] ?? 0));
    if (distance < best) {
      best = distance;
      index = i;
    }
  }
  return index;
};
export const timelineMountRange = (
  offsets: readonly number[],
  widths: readonly number[],
  x: number,
  viewport: number,
  windowSize: number,
  initial: number
) => {
  if (!offsets.length) {
    return { end: 0, start: 0 };
  }
  const padding = (Math.max(viewport, 268) * Math.max(1, windowSize)) / 2;
  let start = 0;
  while (
    start < offsets.length &&
    (offsets[start] ?? 0) + (widths[start] ?? 0) < x - padding
  ) {
    start += 1;
  }
  let end = start;
  while (end < offsets.length && (offsets[end] ?? 0) < x + viewport + padding) {
    end += 1;
  }
  if (x === 0) {
    end = Math.max(end, Math.min(offsets.length, initial));
  }
  return { end, start };
};
