import { createContext, useContext } from "react";

export const ReducedMotionContext = createContext(false);
export const usePanelReducedMotion = (): boolean =>
  useContext(ReducedMotionContext);
