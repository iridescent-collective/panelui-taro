import { createContext, useContext } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import type { StackCardDirection, StackFrame } from "./types";

export interface StackContext {
  signal: ObservableValue<StackFrame>;
  release: ObservableNumber;
  index: number;
  count: number;
  disabled: boolean;
  threshold: number;
  canUndo: boolean;
  send: (direction: StackCardDirection) => void;
  undo: () => void;
  reset: () => void;
}
export const StackCardContext = createContext<StackContext | null>(null);
export const StackCardSlotIndex = createContext<number | null>(null);
export const useStackCardContext = () => {
  const ctx = useContext(StackCardContext);
  if (!ctx) {
    throw new Error("StackCard parts must be used within a <StackCard>");
  }
  return ctx;
};
export const useStackCard = () => {
  const { index, count, canUndo, release, send, undo, reset } =
    useStackCardContext();
  return {
    canUndo,
    count,
    index,
    release,
    remaining: Math.max(0, count - index),
    reset,
    send,
    undo,
  };
};
