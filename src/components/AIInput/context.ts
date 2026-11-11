import { createContext, useContext } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { AIInputSize } from "./growth";
import type { AIInputStatus } from "./types";

export interface AIInputContextValue {
  value: string;
  setValue: (value: string) => void;
  status: AIInputStatus;
  size: AIInputSize;
  level?: number | ObservableNumber;
  disabled: boolean;
  native: boolean;
  minRows: number;
  maxRows: number;
  focused: boolean;
  setFocused: (focused: boolean) => void;
  submit: () => void;
  stop: () => void;
  canVoice: boolean;
  canStop: boolean;
  recordCancel: () => void;
  recordConfirm: () => void;
  voice: () => void;
}
export interface AIInputSheetContextValue {
  stack: string[];
  push: (id: string) => void;
  pop: () => void;
  close: () => void;
}
export const AIInputContext = createContext<AIInputContextValue | null>(null);
export const AIInputInlineContext = createContext(false);
export const AIInputSheetContext =
  createContext<AIInputSheetContextValue | null>(null);
export const useAIInput = (component: string) => {
  const value = useContext(AIInputContext);
  if (!value) {
    throw new Error(`${component} must be used within an <AIInput>`);
  }
  return value;
};
export const useAIInputOptional = () => useContext(AIInputContext);
export const useAIInputSheet = (component: string) => {
  const value = useContext(AIInputSheetContext);
  if (!value) {
    throw new Error(`${component} must be used within an <AIInput.Sheet>`);
  }
  return value;
};
