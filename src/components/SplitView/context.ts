import { createContext, useContext } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import type { SplitViewVariant } from "./types";

export interface SplitViewContextValue {
  topHeight: ObservableNumber;
  dragging: ObservableValue<boolean>;
  points: number[];
  minPx: number;
  maxPx: number;
  room: number;
  measured: boolean;
  disabled: boolean;
  snapIndex: number;
  animate: boolean;
  snapTo: (index: number) => void;
  measureDragArea: (height: number) => void;
  dragAreaHeight: number;
  variant: SplitViewVariant;
  writeHeight: (height: number) => void;
  cancel: () => void;
}
export const SplitViewContext = createContext<SplitViewContextValue | null>(
  null
);
export const useSplitViewContext = (part: string) => {
  const value = useContext(SplitViewContext);
  if (!value) {
    throw new Error(`${part} must be used within a <SplitView>`);
  }
  return value;
};
export const useSplitView = () => useSplitViewContext("useSplitView");
