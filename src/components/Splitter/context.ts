import { createContext, useContext } from "react";

import type { SplitterConstraint } from "./splitter-math";
import type { SplitterOrientation } from "./types";

export interface SplitterContextValue {
  orientation: SplitterOrientation;
  layout: number[];
  available: number;
  measured: boolean;
  settled: number[];
  initial: number[];
  constraints: SplitterConstraint[];
  disabled: boolean;
  step: number;
  sign: 1 | -1;
  read: () => number[];
  update: (layout: number[]) => void;
  commit: (layout: number[]) => void;
}
export const SplitterContext = createContext<SplitterContextValue | null>(null);
export const PanelIndexContext = createContext(0);
export const BoundaryIndexContext = createContext(-1);
export const useSplitter = (part: string) => {
  const value = useContext(SplitterContext);
  if (!value) {
    throw new Error(`${part} must be used within a <Splitter>`);
  }
  return value;
};
