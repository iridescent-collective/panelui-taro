import { createContext, useContext } from "react";

import type { FeedbackContextValue } from "./types";

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);
export const useFeedback = (component: string) => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Feedback>`);
  }
  return context;
};
