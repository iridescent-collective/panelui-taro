import { createContext, useContext } from "react";

import type { FlipCardContextValue } from "./types";

export const FlipCardContext = createContext<FlipCardContextValue | null>(null);
export const useFlipCard = () => {
  const context = useContext(FlipCardContext);
  if (!context) {
    throw new Error("useFlipCard must be used within a <FlipCard>");
  }
  const { flipped, direction, rotation, progress, flip } = context;
  return { direction, flip, flipped, progress, rotation };
};
