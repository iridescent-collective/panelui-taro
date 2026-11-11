import { createContext, useContext } from "react";

import type { SeriesColorIndex } from "../../lib/chart";
import type { KpiGoodDirection } from "./types";

export const KpiContext = createContext<{
  colorIndex: SeriesColorIndex;
  goodDirection: KpiGoodDirection;
} | null>(null);
export const KpiHeaderContext = createContext(false);
export const KpiStatContext = createContext(false);
export const useKpi = (part: string) => {
  const context = useContext(KpiContext);
  if (!context) {
    throw new Error(`${part} must be used inside <Kpi>.`);
  }
  return context;
};
