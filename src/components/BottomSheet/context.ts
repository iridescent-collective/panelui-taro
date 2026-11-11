import { createContext, useContext } from "react";

import type { SheetSurfaceStore } from "./surface-store";

export const BottomSheetContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);
export const SheetSurfaceContext = createContext<SheetSurfaceStore | null>(
  null
);
export const SheetSizedContext = createContext(false);
export const useBottomSheet = (component: string) => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error(`${component} must be used within a <BottomSheet>`);
  }
  return context;
};
