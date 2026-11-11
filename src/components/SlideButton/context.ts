import { createContext, useContext } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { SlideButtonSize, SlideButtonVariant } from "./types";
import type { slideButtonVariants } from "./variants";

export interface SlideButtonContextValue {
  progress: ObservableNumber;
  done: ObservableNumber;
  travel: number;
  completed: boolean;
  slots: ReturnType<typeof slideButtonVariants>;
  variant: SlideButtonVariant;
  size: SlideButtonSize;
}
export const SlideButtonContext = createContext<SlideButtonContextValue | null>(
  null
);
export const useSlideButtonContext = (component: string) => {
  const context = useContext(SlideButtonContext);
  if (!context) {
    throw new Error(`${component} must be used within a <SlideButton>`);
  }
  return context;
};
export const useSlideButton = () => {
  const { progress, completed } = useSlideButtonContext("useSlideButton");
  return { completed, progress };
};
