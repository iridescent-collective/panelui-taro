import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type {
  MessageScrollerDriver,
  MessageScrollerPosition,
  MessageScrollerRow,
} from "./types";

export interface MessageScrollerContextValue {
  autoScroll: boolean;
  preserveScrollOnPrepend: boolean;
  defaultScrollPosition: MessageScrollerPosition;
  rows: Map<string, MessageScrollerRow>;
  pendingRows: Set<string>;
  rowRevision: number;
  registerPendingItem: (id: string) => void;
  registerItem: (id: string, row: MessageScrollerRow) => void;
  unregisterItem: (id: string) => void;
  driver: MutableRefObject<MessageScrollerDriver | null>;
  following: MutableRefObject<boolean>;
  offset: ObservableNumber;
  content: ObservableNumber;
  viewport: ObservableNumber;
  distanceFromStart: ObservableNumber;
  distanceFromEnd: ObservableNumber;
  atEndJS: boolean;
  setAtEndJS: (value: boolean) => void;
  currentAnchorId: string | null;
  setCurrentAnchorId: (id: string | null) => void;
  scrollToEnd: (animated?: boolean) => void;
  scrollToStart: (animated?: boolean) => void;
  scrollToMessage: (id: string, animated?: boolean) => void;
}
export const MessageScrollerContext =
  createContext<MessageScrollerContextValue | null>(null);
export const TranscriptContentContext = createContext<string | null>(null);
export const useScroller = (part: string) => {
  const context = useContext(MessageScrollerContext);
  if (!context) {
    throw new Error(`${part} must be used within a <MessageScroller>`);
  }
  return context;
};
export const useMessageScroller = () => {
  const { scrollToEnd, scrollToStart, scrollToMessage } =
    useScroller("useMessageScroller");
  return { scrollToEnd, scrollToMessage, scrollToStart };
};
export const useMessageScrollerVisibility = () => {
  const { currentAnchorId, atEndJS } = useScroller(
    "useMessageScrollerVisibility"
  );
  return { atEnd: atEndJS, currentAnchorId };
};
