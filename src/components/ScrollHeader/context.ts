import { createContext, useContext, useSyncExternalStore } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { ScrollHeaderContextValue, ScrollHeaderSlot } from "./types";

export const ScrollHeaderContext = createContext<
  ScrollHeaderContextValue | undefined
>(undefined);
export const ScrollHeaderSlotContext = createContext<ScrollHeaderSlot>("large");
export const useScrollHeader = (component: string) => {
  const context = useContext(ScrollHeaderContext);
  if (!context) {
    throw new Error(`${component} must be used within a <ScrollHeader>`);
  }
  return context;
};
export const useHeaderNumber = (value: ObservableNumber) =>
  useSyncExternalStore(value.subscribe, value.getSnapshot, value.getSnapshot);
