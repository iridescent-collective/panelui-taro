import { createContext, useContext } from "react";

import type { CompareOrientation } from "./types";

export interface CompareContextValue {
  ratio: number;
  width: number;
  height: number;
  orientation: CompareOrientation;
  mirrored: boolean;
  disabled: boolean;
  step: number;
  nudge: (delta: number) => void;
}
export const CompareContext = createContext<CompareContextValue | null>(null);
export const useCompare = (part: string) => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error(`${part} must be used within a <Compare>`);
  }
  return context;
};
export const clampRatio = (value: number) => Math.max(0, Math.min(1, value));
