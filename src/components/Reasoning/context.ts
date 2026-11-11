import { createContext, useContext } from "react";

import type { ReasoningContextValue } from "./types";

export const ReasoningContext = createContext<ReasoningContextValue | null>(
  null
);
export const useReasoning = (component: string) => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Reasoning>`);
  }
  return context;
};
