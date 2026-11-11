import { createContext, useContext } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { ProgressButtonVariant, ProgressButtonSize } from "./types";
import type { progressButtonVariants } from "./variants";

export interface ProgressButtonContextValue {
  progress: ObservableNumber;
  done: ObservableNumber;
  width: number;
  completed: boolean;
  variant: ProgressButtonVariant;
  size: ProgressButtonSize;
  slots: ReturnType<typeof progressButtonVariants>;
}
export const ProgressButtonContext =
  createContext<ProgressButtonContextValue | null>(null);
export const useProgressButtonContext = (part: string) => {
  const context = useContext(ProgressButtonContext);
  if (!context) {
    throw new Error(`${part} must be used within a <ProgressButton>`);
  }
  return context;
};
export const useProgressButton = () => {
  const { progress, completed } = useProgressButtonContext("useProgressButton");
  return { completed, progress };
};
