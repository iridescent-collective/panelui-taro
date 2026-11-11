import { createContext, useContext } from "react";

export interface SectionProgressContextValue {
  value?: string;
  onValueChange: (value: string) => void;
  tint: string;
}
export const SectionProgressContext =
  createContext<SectionProgressContextValue | null>(null);
export const useSectionProgress = () => {
  const context = useContext(SectionProgressContext);
  if (!context) {
    throw new Error(
      "SectionProgress.Item must be used within a <SectionProgress>"
    );
  }
  return context;
};
