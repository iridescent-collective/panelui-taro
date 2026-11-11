import { createContext, useContext } from "react";

import type { PlanContextValue } from "./types";

export const PlanContext = createContext<PlanContextValue | null>(null);
export const PlanStepContext = createContext({ last: false });
export const usePlan = (component: string) => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Plan>`);
  }
  return context;
};
