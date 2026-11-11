import { View } from "@tarojs/components";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useNativeScrollMetrics } from "../../hooks/use-native-scroll-metrics";
import { cn } from "../../lib/utils";
import { useScroller } from "./context";
import {
  ESTIMATED_ROW_HEIGHT,
  initialMessageScrollerIndex,
  messageScrollerAnchorAt,
  messageScrollerIndex,
  transcriptWindow,
} from "./math";
import type {
  MessageScrollerListItem,
  MessageScrollerListProps,
} from "./types";
import { useContentPadding } from "./use-content-padding";
import { MessageScrollerViewport } from "./viewport";
import type { TranscriptDriverModel } from "./viewport";

const SEPARATORS = {
  highlight: () => false,
  unhighlight: () => false,
  updateProps: () => false,
};
const VirtualRow = ({
  messageId,
  children,
  onHeight,
}: {
  messageId: string;
  children: ReactNode;
  onHeight: (id: string, height: number) => void;
}) => {
  const measured = useElementLayout(true, children, undefined, false);
  useEffect(() => {
    if (measured.layout) {
      onHeight(messageId, measured.layout.height);
    }
  }, [measured.layout, messageId, onHeight]);
  return <View id={measured.id}>{children}</View>;
};
export const MessageScrollerList = <T extends MessageScrollerListItem>({
  data,
  renderItem,
  contentContainerClassName,
  initialNumToRender = 12,
  maxToRenderPerBatch = 8,
  windowSize = 7,
  getItemLayout,
  ...props
}: MessageScrollerListProps<T>) => {
  const { rows } = useScroller("MessageScroller.List");
  const { pixelSpacing: gapPixels, pixelScale } = useNativeScrollMetrics(12);
  const gap = gapPixels / pixelScale;
  const { padding, bindContent } = useContentPadding(contentContainerClassName);
  const [heights, setHeights] = useState(() => new Map<string, number>());
  const [view, setView] = useState({ offset: 0, viewport: 375 });
  const ledger = useMemo(() => {
    let y = padding.top;
    const offsets: number[] = [];
    const lengths: number[] = [];
    for (const [index, item] of data.entries()) {
      const known = getItemLayout?.(data, index);
      const height =
        known?.length ?? heights.get(item.messageId) ?? ESTIMATED_ROW_HEIGHT;
      offsets.push(known ? known.offset + padding.top : y);
      lengths.push(height);
      y = (known ? known.offset + padding.top : y) + height + gap;
    }
    return {
      height: (data.length ? y - gap : padding.top) + padding.bottom,
      lengths,
      offsets,
    };
  }, [data, heights, getItemLayout, padding, gap]);
  const range = transcriptWindow(
    ledger.offsets,
    ledger.lengths,
    view.offset,
    view.viewport,
    windowSize,
    Math.max(initialNumToRender, maxToRenderPerBatch)
  );
  useEffect(() => {
    const ids = new Set(data.map((item) => item.messageId));
    for (const id of rows.keys()) {
      if (!ids.has(id)) {
        rows.delete(id);
      }
    }
    for (const [index, item] of data.entries()) {
      rows.set(item.messageId, {
        anchor: item.scrollAnchor ?? false,
        height: ledger.lengths[index],
        y: ledger.offsets[index],
      });
    }
  }, [data, rows, ledger]);
  const onHeight = useMemo(
    () => (id: string, height: number) =>
      setHeights((previous) => {
        if (previous.get(id) === height) {
          return previous;
        }
        return new Map([...previous, [id, height]]);
      }),
    []
  );
  const model = useMemo<TranscriptDriverModel>(
    () => ({
      anchor: (offset) => {
        const first = ledger.offsets.findIndex(
          (y, index) => y + ledger.lengths[index] > offset
        );
        return messageScrollerAnchorAt(
          data,
          first === -1 ? data.length - 1 : first
        );
      },
      bindContent,
      height: ledger.height,
      lastAnchor: () => {
        const index = initialMessageScrollerIndex(data, "last-anchor");
        return index === undefined ? undefined : data[index].messageId;
      },
      onOffset: (offset, viewport) =>
        setView((previous) =>
          previous.offset === offset && previous.viewport === viewport
            ? previous
            : { offset, viewport }
        ),
      position: (id) => {
        const index = messageScrollerIndex(data, id);
        return index === undefined ? undefined : ledger.offsets[index];
      },
    }),
    [ledger, data, bindContent]
  );
  const before =
    (ledger.offsets[range.start] ?? ledger.height - padding.bottom) -
    padding.top;
  const after = Math.max(
    0,
    ledger.height -
      padding.bottom -
      (ledger.offsets[range.end - 1] ?? padding.top) -
      (ledger.lengths[range.end - 1] ?? 0) -
      (range.end < data.length ? gap : 0)
  );
  return (
    <MessageScrollerViewport
      {...props}
      model={model}
      contentClassName={cn(
        "flex flex-col p-[32px] pb-[128px]",
        contentContainerClassName
      )}
    >
      <View
        aria-hidden
        style={{ height: `${Math.max(0, before) * pixelScale}px` }}
      />
      {data.slice(range.start, range.end).map((item, local) => {
        const index = range.start + local;
        return (
          <View
            key={item.messageId}
            style={{
              marginBottom: index < data.length - 1 ? `${gapPixels}px` : 0,
            }}
          >
            <VirtualRow messageId={item.messageId} onHeight={onHeight}>
              {renderItem({ index, item, separators: SEPARATORS })}
            </VirtualRow>
          </View>
        );
      })}
      <View aria-hidden style={{ height: `${after * pixelScale}px` }} />
    </MessageScrollerViewport>
  );
};
MessageScrollerList.displayName = "MessageScroller.List";
