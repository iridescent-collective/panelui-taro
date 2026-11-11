import { View } from "@tarojs/components";
import { useCallback, useMemo, useRef, useState } from "react";

import { cn } from "../../lib/utils";
import { createObservableNumber } from "../../primitives/observable-number";
import { textChildren } from "../primitives/Text";
import { MessageScrollerContext } from "./context";
import { MESSAGE_SCROLLER_EDGE_THRESHOLD } from "./math";
import type {
  MessageScrollerDriver,
  MessageScrollerProps,
  MessageScrollerRow,
} from "./types";

export const MessageScrollerRoot = ({
  className,
  autoScroll = false,
  preserveScrollOnPrepend = true,
  defaultScrollPosition = "end",
  children,
  ...props
}: MessageScrollerProps) => {
  const [rows] = useState(() => new Map<string, MessageScrollerRow>());
  const [pendingRows] = useState(() => new Set<string>());
  const [rowRevision, setRowRevision] = useState(0);
  const registerPendingItem = useCallback(
    (id: string) => {
      if (!pendingRows.has(id)) {
        pendingRows.add(id);
        setRowRevision((value) => value + 1);
      }
    },
    [pendingRows]
  );
  const driver = useRef<MessageScrollerDriver | null>(null);
  const following = useRef(autoScroll);
  const [atEndJS, setAtEndJS] = useState(true);
  const [currentAnchorId, setCurrentAnchorId] = useState<string | null>(null);
  const numbers = useMemo(
    () => ({
      content: createObservableNumber(),
      distanceFromEnd: createObservableNumber(
        defaultScrollPosition === "end"
          ? 0
          : MESSAGE_SCROLLER_EDGE_THRESHOLD + 1
      ),
      distanceFromStart: createObservableNumber(
        defaultScrollPosition === "start"
          ? 0
          : MESSAGE_SCROLLER_EDGE_THRESHOLD + 1
      ),
      offset: createObservableNumber(),
      viewport: createObservableNumber(),
    }),
    []
  );
  const registerItem = useCallback(
    (id: string, row: MessageScrollerRow) => {
      const previous = rows.get(id);
      const wasPending = pendingRows.delete(id);
      if (
        wasPending ||
        previous?.y !== row.y ||
        previous?.height !== row.height ||
        previous?.anchor !== row.anchor
      ) {
        rows.set(id, row);
        setRowRevision((value) => value + 1);
      }
    },
    [rows, pendingRows]
  );
  const unregisterItem = useCallback(
    (id: string) => {
      const wasPending = pendingRows.delete(id);
      if (rows.delete(id) || wasPending) {
        setRowRevision((value) => value + 1);
      }
    },
    [rows, pendingRows]
  );
  const scrollToEnd = useCallback((animated = true) => {
    following.current = true;
    driver.current?.scrollToEnd(animated);
  }, []);
  const scrollToStart = useCallback((animated = true) => {
    following.current = false;
    driver.current?.scrollToStart(animated);
  }, []);
  const scrollToMessage = useCallback((id: string, animated = true) => {
    if (driver.current?.scrollToMessage(id, animated)) {
      following.current = false;
    }
  }, []);
  const context = useMemo(
    () => ({
      ...numbers,
      atEndJS,
      autoScroll,
      currentAnchorId,
      defaultScrollPosition,
      driver,
      following,
      pendingRows,
      preserveScrollOnPrepend,
      registerItem,
      registerPendingItem,
      rowRevision,
      rows,
      scrollToEnd,
      scrollToMessage,
      scrollToStart,
      setAtEndJS,
      setCurrentAnchorId,
      unregisterItem,
    }),
    [
      numbers,
      autoScroll,
      preserveScrollOnPrepend,
      defaultScrollPosition,
      rows,
      pendingRows,
      rowRevision,
      registerPendingItem,
      atEndJS,
      currentAnchorId,
      registerItem,
      unregisterItem,
      scrollToEnd,
      scrollToStart,
      scrollToMessage,
    ]
  );
  return (
    <MessageScrollerContext.Provider value={context}>
      <View
        {...props}
        className={cn("relative flex flex-col overflow-hidden", className)}
      >
        {textChildren(children)}
      </View>
    </MessageScrollerContext.Provider>
  );
};
MessageScrollerRoot.displayName = "MessageScroller";
