import { createContext, useContext } from "react";

import type { SelectionModeContextValue } from "./types";

export const SelectionModeContext =
  createContext<SelectionModeContextValue | null>(null);
export const SelectionModeItemContext = createContext<{ value: string } | null>(
  null
);
export const useSelectionMode = (): SelectionModeContextValue => {
  const context = useContext(SelectionModeContext);
  if (!context) {
    throw new Error("useSelectionMode must be used within a <SelectionMode>");
  }
  return context;
};
