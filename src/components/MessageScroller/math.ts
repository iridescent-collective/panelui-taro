import type {
  MessageScrollerListItem,
  MessageScrollerPosition,
  MessageScrollerRow,
} from "./types";

export const MESSAGE_SCROLLER_EDGE_THRESHOLD = 24;
export const ANCHOR_PEEK = 24;
export const SCROLL_SETTLE_DELAY = 120;
export const ESTIMATED_ROW_HEIGHT = 72;
export const distanceFromMessageScrollerTarget = (
  target: "start" | "end",
  contentOffsetY: number,
  contentHeight: number,
  viewportHeight: number
) => {
  const maximumOffset = Math.max(0, contentHeight - viewportHeight);
  const boundedOffset = Math.min(maximumOffset, Math.max(0, contentOffsetY));
  return target === "start" ? boundedOffset : maximumOffset - boundedOffset;
};
export const isMessageScrollerTargetVisible = (distance: number) =>
  distance > MESSAGE_SCROLLER_EDGE_THRESHOLD;
export const messageScrollerIndex = (
  items: readonly MessageScrollerListItem[],
  id: string
) => {
  const index = items.findIndex((item) => item.messageId === id);
  return index === -1 ? undefined : index;
};
export const initialMessageScrollerIndex = (
  items: readonly MessageScrollerListItem[],
  position: MessageScrollerPosition
) => {
  if (position === "end") {
    return;
  }
  if (position === "start") {
    return items.length ? 0 : undefined;
  }
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index].scrollAnchor) {
      return index;
    }
  }
};
export const messageScrollerAnchorAt = (
  items: readonly MessageScrollerListItem[],
  firstVisibleIndex: number
) => {
  for (
    let index = Math.min(firstVisibleIndex, items.length - 1);
    index >= 0;
    index -= 1
  ) {
    if (items[index].scrollAnchor) {
      return items[index].messageId;
    }
  }
  return null;
};
export const topmostShift = (
  before: Map<string, number>,
  after: Map<string, number>
) => {
  let bestY = Infinity;
  let shift = 0;
  for (const [id, y] of before) {
    const now = after.get(id);
    if (now === undefined || y >= bestY) {
      continue;
    }
    bestY = y;
    shift = now - y;
  }
  return shift;
};
export const anchorAtOffset = (
  rows: Map<string, MessageScrollerRow>,
  offset: number,
  roundingTolerance = 0
) => {
  let current: string | null = null;
  let best = -Infinity;
  for (const [id, row] of rows) {
    if (
      row.anchor &&
      row.y <= offset + ANCHOR_PEEK + roundingTolerance &&
      row.y > best
    ) {
      best = row.y;
      current = id;
    }
  }
  return current;
};
export const transcriptWindow = (
  offsets: number[],
  lengths: number[],
  offset: number,
  viewport: number,
  windowSize: number,
  minimum: number
) => {
  const behind = Math.max(0, (windowSize - 1) / 2) * viewport;
  const from = Math.max(0, offset - behind);
  const to = offset + viewport + behind;
  let start = 0;
  while (start < offsets.length && offsets[start] + lengths[start] < from) {
    start += 1;
  }
  let end = start;
  while (end < offsets.length && offsets[end] < to) {
    end += 1;
  }
  return {
    end: Math.min(offsets.length, Math.max(end, start + minimum)),
    start: Math.min(start, Math.max(0, offsets.length - minimum)),
  };
};

export const lastScrollerAnchor = (rows: Map<string, MessageScrollerRow>) => {
  let id: string | undefined;
  let lastY = -Infinity;
  for (const [key, row] of rows) {
    if (row.anchor && row.y >= lastY) {
      lastY = row.y;
      id = key;
    }
  }
  return id;
};

export const visibleReaderShift = (
  before: Map<string, number>,
  after: Map<string, number>,
  offset: number
) => {
  let candidate: string | undefined;
  let y = -Infinity;
  for (const [id, position] of before) {
    if (position <= offset && position > y && after.has(id)) {
      candidate = id;
      y = position;
    }
  }
  return candidate === undefined
    ? topmostShift(before, after)
    : (after.get(candidate) ?? y) - y;
};
