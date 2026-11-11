import { createContext } from "react";

export interface MarqueeGroupContextValue {
  paused: boolean;
  report: (id: string, live: boolean) => void;
}
export const MarqueeGroupContext =
  createContext<MarqueeGroupContextValue | null>(null);
