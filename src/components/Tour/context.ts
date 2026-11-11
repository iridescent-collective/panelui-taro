import { createContext, useContext } from "react";

import type { TourStepEntry } from "./types";

export const TourContext = createContext<{
  register: (entry: TourStepEntry) => void;
  unregister: (entry: TourStepEntry) => void;
} | null>(null);
export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("Tour.Step must be used within a <Tour>");
  }
  return ctx;
};
