import { createContext, useContext } from "react";

import type { DrawerCloseSide } from "./types";

export interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export const DrawerContext = createContext<DrawerContextValue | null>(null);
export const DrawerSurfaceContext = createContext<{
  closeSide: DrawerCloseSide;
  showClose: boolean;
} | null>(null);
export const useDrawer = (part: string) => {
  const value = useContext(DrawerContext);
  if (!value) {
    throw new Error(`${part} must be used within a <Drawer>`);
  }
  return value;
};
