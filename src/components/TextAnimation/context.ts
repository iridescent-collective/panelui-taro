import { createContext, useContext } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import type { TextAnimationContextValue } from "./types";

export const TextAnimationContext = createContext<TextAnimationContextValue>(
  {}
);
export const useShared = <K extends keyof TextAnimationContextValue>(
  key: K,
  own: TextAnimationContextValue[K],
  fallback: NonNullable<TextAnimationContextValue[K]>
): NonNullable<TextAnimationContextValue[K]> => {
  const inherited = useContext(TextAnimationContext);
  return (own ?? inherited[key] ?? fallback) as NonNullable<
    TextAnimationContextValue[K]
  >;
};
export const useStill = (enabled: boolean) =>
  usePanelReducedMotion() || !enabled;
