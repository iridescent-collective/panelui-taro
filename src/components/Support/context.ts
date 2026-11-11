import { createContext, useContext } from "react";

import type { SupportContextValue, TopicsContextValue } from "./types";

export const SupportContext = createContext<SupportContextValue>({
  availability: "online",
});
export const useSupport = (): SupportContextValue => useContext(SupportContext);
export const TopicsContext = createContext<TopicsContextValue | null>(null);
