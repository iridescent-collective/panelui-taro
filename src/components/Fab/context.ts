import { createContext, useContext } from "react";

import type { FabMenuAppearance, FabMenuIconPlacement, FabSize } from "./types";

export interface FabContextValue {
  progress: number;
  count: number;
  size: FabSize;
  layout: "dial" | "menu";
  appearance: FabMenuAppearance;
  iconPlacement: FabMenuIconPlacement;
  rowClassName?: string;
  close: () => void;
}
export const FabContext = createContext<FabContextValue | null>(null);
export const useFabGroup = () => {
  const context = useContext(FabContext);
  if (!context) {
    throw new Error("Fab.Action must be used inside <Fab.Group>.");
  }
  return context;
};
