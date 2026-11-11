import { createContext, useContext } from "react";

export const SourcesContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);
export const useSources = (component: string) => {
  const context = useContext(SourcesContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Sources>`);
  }
  return context;
};
