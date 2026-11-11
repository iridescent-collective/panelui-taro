import { createContext, useContext } from "react";

import type { SectionRailPlacement, SectionRailAlign } from "./types";

export interface SectionRailContextValue {
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  onValueChange: (value: string) => void;
  placement: SectionRailPlacement;
  align: SectionRailAlign;
}
export const SectionRailContext = createContext<SectionRailContextValue | null>(
  null
);
export const SectionRailBarsContext = createContext<string[]>([]);
export const useSectionRail = (part: string) => {
  const context = useContext(SectionRailContext);
  if (!context) {
    throw new Error(`${part} must be used within a <SectionRail>`);
  }
  return context;
};
